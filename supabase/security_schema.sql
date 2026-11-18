-- ============================================================================
--  MineAI — security schema
--
--  Row Level Security for every table that holds money, identity or secrets.
--  The application talks to Postgres with the service-role key, which bypasses
--  RLS by design; these policies exist so a leaked anon key still cannot read
--  another operator's position, deposit, withdrawal or two-factor material.
--
--  Identity model: the browser mints an anonymous operator id (`operator_ref`).
--  When Supabase Auth is enabled, `owner_id` binds that operator to a real
--  session and the policies key on `auth.uid()`. Until then only the service
--  role can read these rows.
--
--  Run after `supabase/schema.sql`:
--    psql "$DATABASE_URL" -f supabase/security_schema.sql
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- helpers ---

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --------------------------------------------------------------- profiles ---

create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid unique references auth.users (id) on delete cascade,
  operator_ref  text not null unique,
  display_name  text,
  locale        text not null default 'en'
                check (locale in ('en', 'ar', 'fr', 'es', 'zh', 'hi')),
  vip_tier      text not null default 'observer'
                check (vip_tier in ('observer', 'navigator', 'whale', 'leviathan')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_operator_ref_format
    check (operator_ref ~ '^[A-Za-z0-9_-]{8,48}$')
);

create index if not exists profiles_owner_id_idx on public.profiles (owner_id);

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------- mining positions ---

create table if not exists public.mining_positions (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid references auth.users (id) on delete set null,
  operator_ref          text not null unique,
  hashrate_mhs          numeric(18, 4) not null default 0 check (hashrate_mhs >= 0),
  mined_tokens          numeric(24, 8) not null default 0 check (mined_tokens >= 0),
  lifetime_mined_tokens numeric(24, 8) not null default 0 check (lifetime_mined_tokens >= 0),
  staked_tokens         numeric(24, 8) not null default 0 check (staked_tokens >= 0),
  withdrawn_tokens      numeric(24, 8) not null default 0 check (withdrawn_tokens >= 0),
  streak_days           integer not null default 0 check (streak_days between 0 and 7),
  last_claim_at         timestamptz,
  two_factor_enabled    boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint mining_positions_operator_ref_format
    check (operator_ref ~ '^[A-Za-z0-9_-]{8,48}$')
);

create index if not exists mining_positions_owner_id_idx on public.mining_positions (owner_id);

-- Multi-coin ledger. `coins` holds one balance per rail (12 decimals of
-- precision, stored as jsonb so adding a rail never needs a migration);
-- `allocations` holds the percentage split the operator chose; the accrual
-- watermark makes a sweep idempotent across a restarted cron.
alter table public.mining_positions
  add column if not exists coins jsonb not null default '{}'::jsonb,
  add column if not exists allocations jsonb not null default '{}'::jsonb,
  add column if not exists last_accrual_at timestamptz,
  add column if not exists vip_tier text not null default 'observer',
  -- The provisioned plan and the reactor switch. A paused position has
  -- `mining_active = false` and accrues nothing until it is armed again.
  add column if not exists plan_id text,
  add column if not exists plan_name text,
  add column if not exists plan_hashrate_mhs numeric(18, 4) not null default 120,
  add column if not exists plan_multiplier numeric(6, 3) not null default 1,
  add column if not exists mining_active boolean not null default true;

drop trigger if exists mining_positions_touch on public.mining_positions;
create trigger mining_positions_touch
  before update on public.mining_positions
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------- deposits ---

create table if not exists public.deposits (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references auth.users (id) on delete set null,
  operator_ref   text,
  rail           text not null check (rail in ('kashier', 'paymob', 'stripe', 'crypto')),
  network        text,
  asset          text,
  amount_usd     numeric(18, 2) not null check (amount_usd > 0),
  asset_amount   numeric(36, 18) not null default 0 check (asset_amount >= 0),
  address        text,
  tx_hash        text,
  status         text not null default 'awaiting'
                 check (status in ('awaiting', 'pending', 'verified', 'failed', 'expired')),
  confirmations  integer not null default 0 check (confirmations >= 0),
  provider_ref   text,
  created_at     timestamptz not null default now(),
  settled_at     timestamptz
);

-- A chain transaction may credit the platform exactly once.
create unique index if not exists deposits_tx_hash_unique
  on public.deposits (lower(tx_hash))
  where tx_hash is not null;

create index if not exists deposits_operator_ref_idx on public.deposits (operator_ref);
create index if not exists deposits_status_idx on public.deposits (status);

-- ------------------------------------------------------------ withdrawals ---

create table if not exists public.withdrawals (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references auth.users (id) on delete set null,
  operator_ref   text,
  network        text not null,
  wallet_masked  text not null,
  tokens         numeric(24, 8) not null check (tokens > 0),
  usd            numeric(18, 2) not null check (usd >= 0),
  status         text not null default 'queued'
                 check (status in ('queued', 'broadcasting', 'paid', 'failed', 'cancelled')),
  tx_hash        text,
  requested_at   timestamptz not null default now(),
  settled_at     timestamptz
);

create index if not exists withdrawals_operator_ref_idx on public.withdrawals (operator_ref);
create index if not exists withdrawals_status_idx on public.withdrawals (status);

-- --------------------------------------------------------- referral graph ---

create table if not exists public.referral_edges (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references auth.users (id) on delete set null,
  operator_ref   text not null,
  referrer_ref   text not null,
  code           text not null,
  created_at     timestamptz not null default now(),
  -- One referrer per operator, for life.
  constraint referral_edges_one_per_operator unique (operator_ref),
  constraint referral_edges_no_self check (operator_ref <> referrer_ref)
);

create index if not exists referral_edges_referrer_idx on public.referral_edges (referrer_ref);

-- ------------------------------------------------------- two-factor vault ---

create table if not exists public.two_factor_secrets (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references auth.users (id) on delete cascade,
  operator_ref      text not null unique,
  -- AES-256-GCM ciphertext produced by lib/encryption.ts: iv.tag.payload (base64url).
  secret_ciphertext text not null,
  recovery_hashes   text[] not null default '{}',
  enabled           boolean not null default false,
  confirmed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint two_factor_secrets_operator_ref_format
    check (operator_ref ~ '^[A-Za-z0-9_-]{8,48}$')
);

drop trigger if exists two_factor_secrets_touch on public.two_factor_secrets;
create trigger two_factor_secrets_touch
  before update on public.two_factor_secrets
  for each row execute function public.set_updated_at();

-- The security module owns `totp_secrets` under that exact name. It is the same
-- vault as `two_factor_secrets`, kept beside it so a server that reads either
-- name finds a row: the sealed secret, the recovery hashes and a confirmation
-- timestamp. Only the non-secret columns are ever grantable to a client.
create table if not exists public.totp_secrets (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references auth.users (id) on delete cascade,
  operator_ref      text not null unique,
  secret_ciphertext text not null,
  recovery_hashes   text[] not null default '{}',
  enabled           boolean not null default false,
  confirmed_at      timestamptz,
  last_used_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint totp_secrets_operator_ref_format
    check (operator_ref ~ '^[A-Za-z0-9_-]{8,48}$')
);

create index if not exists totp_secrets_owner_idx on public.totp_secrets (owner_id);

drop trigger if exists totp_secrets_touch on public.totp_secrets;
create trigger totp_secrets_touch
  before update on public.totp_secrets
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------- audit log ---

create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  owner_id    uuid references auth.users (id) on delete set null,
  operator_ref text,
  actor       text not null default 'system',
  action      text not null,
  payload     jsonb not null default '{}'::jsonb,
  ip          inet,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_operator_ref_idx on public.audit_log (operator_ref);
create index if not exists audit_log_action_idx on public.audit_log (action);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------- mining sub-ledgers ---

-- One row per operator and rail. Kept beside `mining_positions` rather than
-- inside it so a per-coin query never has to unpack the whole position.
create table if not exists public.mining_allocations (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users (id) on delete set null,
  operator_ref  text not null,
  coin          text not null
                check (coin in ('mineai', 'btc', 'eth', 'sol', 'bnb', 'ton', 'doge')),
  share_pct     numeric(6, 2) not null default 0 check (share_pct >= 0 and share_pct <= 100),
  updated_at    timestamptz not null default now(),
  constraint mining_allocations_one_per_coin unique (operator_ref, coin),
  constraint mining_allocations_operator_ref_format
    check (operator_ref ~ '^[A-Za-z0-9_-]{8,48}$')
);

create index if not exists mining_allocations_operator_idx on public.mining_allocations (operator_ref);

drop trigger if exists mining_allocations_touch on public.mining_allocations;
create trigger mining_allocations_touch
  before update on public.mining_allocations
  for each row execute function public.set_updated_at();

-- Append-only accrual journal. The cron writes one row per rail per sweep; the
-- sum of a position's rows must equal its lifetime mined balance.
create table if not exists public.mining_accruals (
  id            bigint generated always as identity primary key,
  owner_id      uuid references auth.users (id) on delete set null,
  operator_ref  text not null,
  coin          text not null
                check (coin in ('mineai', 'btc', 'eth', 'sol', 'bnb', 'ton', 'doge')),
  tokens        numeric(38, 12) not null check (tokens >= 0),
  usd           numeric(18, 6) not null default 0 check (usd >= 0),
  accrued_at    timestamptz not null default now()
);

create index if not exists mining_accruals_operator_idx on public.mining_accruals (operator_ref, accrued_at desc);

-- On-chain withdrawal requests, one row per rail. `status` is only ever moved
-- by the service role after a broadcast is observed on a public RPC.
create table if not exists public.mining_withdrawals (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users (id) on delete set null,
  operator_ref  text not null,
  coin          text not null
                check (coin in ('mineai', 'btc', 'eth', 'sol', 'bnb', 'ton', 'doge')),
  symbol        text not null,
  chain         text not null,
  wallet_masked text not null,
  tokens        numeric(38, 12) not null check (tokens > 0),
  usd           numeric(18, 6) not null default 0 check (usd >= 0),
  status        text not null default 'queued'
                check (status in ('queued', 'broadcasting', 'paid', 'failed', 'cancelled')),
  tx_hash       text,
  requested_at  timestamptz not null default now(),
  settled_at    timestamptz
);

create index if not exists mining_withdrawals_operator_idx on public.mining_withdrawals (operator_ref);
create index if not exists mining_withdrawals_status_idx on public.mining_withdrawals (status);

-- ------------------------------------------------ contract deployment registry ---

-- Written by the owner's browser wallet through /api/admin/contract. The route
-- refuses any deployer other than OWNER_EVM_WALLET and re-reads eth_getCode
-- before inserting, so a row here always points at real bytecode.
create table if not exists public.contract_deployments (
  chain_id      integer primary key,
  network       text not null,
  address       text not null,
  deployer      text not null,
  tx_hash       text,
  compiler      text,
  deployed_at   timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists contract_deployments_touch on public.contract_deployments;
create trigger contract_deployments_touch
  before update on public.contract_deployments
  for each row execute function public.set_updated_at();

-- Payment rails grew a processor; widen the original constraint in place.
alter table public.deposits drop constraint if exists deposits_rail_check;
alter table public.deposits
  add constraint deposits_rail_check
  check (rail in ('kashier', 'paymob', 'stripe', 'crypto'));

-- ------------------------------------------------------------- RLS setup ---

alter table public.profiles            enable row level security;
alter table public.mining_positions    enable row level security;
alter table public.mining_allocations  enable row level security;
alter table public.mining_accruals     enable row level security;
alter table public.mining_withdrawals  enable row level security;
alter table public.contract_deployments enable row level security;
alter table public.deposits            enable row level security;
alter table public.withdrawals         enable row level security;
alter table public.referral_edges      enable row level security;
alter table public.two_factor_secrets  enable row level security;
alter table public.totp_secrets        enable row level security;
alter table public.audit_log           enable row level security;

-- profiles: an operator reads and edits only their own row.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (owner_id = auth.uid());

-- mining positions: read-only to the owner; only the service role mutates them.
drop policy if exists mining_positions_select_own on public.mining_positions;
create policy mining_positions_select_own on public.mining_positions
  for select to authenticated
  using (owner_id = auth.uid());

-- per-coin ledgers: the owner reads their own rows, the service role writes.
drop policy if exists mining_allocations_select_own on public.mining_allocations;
create policy mining_allocations_select_own on public.mining_allocations
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists mining_accruals_select_own on public.mining_accruals;
create policy mining_accruals_select_own on public.mining_accruals
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists mining_withdrawals_select_own on public.mining_withdrawals;
create policy mining_withdrawals_select_own on public.mining_withdrawals
  for select to authenticated
  using (owner_id = auth.uid());

-- the deployment registry is public identity data: the token endpoint reads it
-- to render the contract address. Writes stay service-role only.
drop policy if exists contract_deployments_public_read on public.contract_deployments;
create policy contract_deployments_public_read on public.contract_deployments
  for select to anon, authenticated
  using (true);

-- deposits: owner sees their own; writes are service-role only because a
-- client must never be able to mark a deposit verified.
drop policy if exists deposits_select_own on public.deposits;
create policy deposits_select_own on public.deposits
  for select to authenticated
  using (owner_id = auth.uid());

-- withdrawals: owner sees their own; writes are service-role only.
drop policy if exists withdrawals_select_own on public.withdrawals;
create policy withdrawals_select_own on public.withdrawals
  for select to authenticated
  using (owner_id = auth.uid());

-- referrals: an operator sees the edge they belong to.
drop policy if exists referral_edges_select_own on public.referral_edges;
create policy referral_edges_select_own on public.referral_edges
  for select to authenticated
  using (owner_id = auth.uid());

-- two-factor vault: never readable through the anon or authenticated key. The
-- ciphertext is only opened server-side with the service role. This policy is
-- intentionally absent; only the service role can select this table.

-- audit log: append-only for the service role, invisible to clients.
-- No client policies: service role only.

-- --------------------------------------------------------- grants sanity ---

-- Revoke blanket table access from the browser-facing roles and hand back only
-- what the policies above allow.
revoke all on public.two_factor_secrets from anon, authenticated;
revoke all on public.audit_log from anon, authenticated;
revoke insert, update, delete on public.deposits from anon, authenticated;
revoke insert, update, delete on public.withdrawals from anon, authenticated;
revoke insert, update, delete on public.mining_positions from anon, authenticated;
revoke insert, update, delete on public.mining_allocations from anon, authenticated;
revoke insert, update, delete on public.mining_accruals from anon, authenticated;
revoke insert, update, delete on public.mining_withdrawals from anon, authenticated;
revoke insert, update, delete on public.contract_deployments from anon, authenticated;

grant select on public.profiles, public.mining_positions, public.deposits,
  public.withdrawals, public.referral_edges, public.mining_allocations,
  public.mining_accruals, public.mining_withdrawals to authenticated;
grant select on public.contract_deployments to anon, authenticated;
grant insert, update on public.profiles to authenticated;

comment on table public.two_factor_secrets is
  'TOTP secrets sealed with AES-256-GCM. Service-role access only; no RLS policy grants client reads.';
comment on table public.totp_secrets is
  'The same sealed TOTP vault under the name the security module uses. Clients may read only the enabled flag and timestamps, never secret_ciphertext or recovery_hashes.';
comment on column public.totp_secrets.secret_ciphertext is
  'AES-256-GCM ciphertext (iv.tag.payload, base64url). Decryption requires ENCRYPTION_KEY and happens only in a node-runtime server function.';
comment on table public.audit_log is
  'Append-only record of money movement and security events. Service-role access only.';

-- ============================================================================
--  Production data model — the eight tables the product reads and writes.
--
--  `profiles` and `withdrawals` are defined above. This block adds the rest of
--  the public surface named by the product spec (`mining_nodes`,
--  `mining_balances`, `subscriptions`, `transactions`, `support_tickets`,
--  `referrals`) and then hands every role an explicit grant. RLS still decides
--  which rows a caller sees, so a table-level grant never widens row access.
-- ============================================================================

-- -------------------------------------------------------------- mining_nodes ---

create table if not exists public.mining_nodes (
  id           text primary key,
  label        text not null,
  region       text,
  status       text not null default 'online'
               check (status in ('online', 'degraded', 'offline')),
  hashrate_mhs numeric(18, 2) not null default 0 check (hashrate_mhs >= 0),
  load_pct     numeric(5, 2) not null default 0 check (load_pct >= 0 and load_pct <= 100),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists mining_nodes_touch on public.mining_nodes;
create trigger mining_nodes_touch
  before update on public.mining_nodes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------- mining_balances ---

create table if not exists public.mining_balances (
  owner_id   uuid not null references auth.users (id) on delete cascade,
  coin       text not null check (coin in ('mineai', 'btc', 'eth', 'sol', 'bnb', 'ton', 'doge', 'ltc')),
  balance    numeric(36, 18) not null default 0 check (balance >= 0),
  lifetime   numeric(36, 18) not null default 0 check (lifetime >= 0),
  updated_at timestamptz not null default now(),
  primary key (owner_id, coin)
);

create index if not exists mining_balances_owner_idx on public.mining_balances (owner_id);

-- ------------------------------------------------------------ subscriptions ---

create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  plan_id     text not null,
  plan_name   text not null,
  price_usd   numeric(12, 2) not null default 0 check (price_usd >= 0),
  status      text not null default 'pending'
              check (status in ('pending', 'active', 'past_due', 'cancelled', 'expired')),
  rail        text check (rail in ('kashier', 'paymob', 'stripe', 'crypto')),
  started_at  timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists subscriptions_owner_idx on public.subscriptions (owner_id, created_at desc);

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------- transactions ---

create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users (id) on delete set null,
  kind         text not null
               check (kind in ('subscription', 'deposit', 'withdrawal', 'referral', 'adjustment')),
  rail         text check (rail in ('kashier', 'paymob', 'stripe', 'crypto')),
  network      text,
  asset        text,
  amount_usd   numeric(18, 2) not null default 0,
  asset_amount numeric(36, 18) not null default 0,
  status       text not null default 'pending'
               check (status in ('pending', 'processing', 'sent', 'confirmed', 'failed', 'refunded')),
  reference    text,
  tx_hash      text,
  wallet       text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists transactions_owner_idx on public.transactions (owner_id, created_at desc);
create index if not exists transactions_status_idx on public.transactions (status);

drop trigger if exists transactions_touch on public.transactions;
create trigger transactions_touch
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------- support_tickets ---

create table if not exists public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references auth.users (id) on delete set null,
  email      text,
  lang       text not null default 'en',
  topic      text,
  message    text not null,
  status     text not null default 'open' check (status in ('open', 'answered', 'closed')),
  reply      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_owner_idx on public.support_tickets (owner_id, created_at desc);

drop trigger if exists support_tickets_touch on public.support_tickets;
create trigger support_tickets_touch
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- referrals ---

create table if not exists public.referrals (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users (id) on delete cascade,
  code             text not null unique,
  referred_owner_id uuid references auth.users (id) on delete set null,
  tier             text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'diamond')),
  commission_pct   numeric(5, 2) not null default 5 check (commission_pct >= 0 and commission_pct <= 100),
  earned_usd       numeric(18, 2) not null default 0 check (earned_usd >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists referrals_owner_idx on public.referrals (owner_id);

drop trigger if exists referrals_touch on public.referrals;
create trigger referrals_touch
  before update on public.referrals
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------- RLS ---

alter table public.mining_nodes    enable row level security;
alter table public.mining_balances enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.transactions    enable row level security;
alter table public.support_tickets enable row level security;
alter table public.referrals       enable row level security;

-- Nodes are public infrastructure status: everyone may read, only the service
-- role may change them.
drop policy if exists mining_nodes_public_read on public.mining_nodes;
create policy mining_nodes_public_read on public.mining_nodes
  for select to anon, authenticated
  using (true);

-- Balances, subscriptions and transactions: an operator reads their own rows.
drop policy if exists mining_balances_select_own on public.mining_balances;
create policy mining_balances_select_own on public.mining_balances
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own on public.transactions
  for select to authenticated
  using (owner_id = auth.uid());

-- Support: an operator may open a ticket for themselves and read it back.
drop policy if exists support_tickets_select_own on public.support_tickets;
create policy support_tickets_select_own on public.support_tickets
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists support_tickets_insert_own on public.support_tickets;
create policy support_tickets_insert_own on public.support_tickets
  for insert to authenticated
  with check (owner_id = auth.uid());

-- Referrals: the owner sees and creates their own invite code.
drop policy if exists referrals_select_own on public.referrals;
create policy referrals_select_own on public.referrals
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists referrals_insert_own on public.referrals;
create policy referrals_insert_own on public.referrals
  for insert to authenticated
  with check (owner_id = auth.uid());

-- ------------------------------------------------------------- explicit grants ---
--
-- The Data API needs table privileges even when RLS would allow the row.
-- Grant them to every role the app uses, then re-revoke the secret tables so
-- the blanket grant can never expose two-factor material or the audit log.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to authenticated, service_role;

grant select on public.profiles,
              public.mining_nodes,
              public.contract_deployments
  to anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;

revoke all on public.two_factor_secrets from anon, authenticated;
revoke all on public.audit_log from anon, authenticated;

-- `totp_secrets` gets an explicit, column-scoped grant instead of the blanket
-- one above: an owner may see whether two-factor is on, never the ciphertext or
-- the recovery hashes. RLS then narrows those rows to the caller.
revoke all on public.totp_secrets from anon, authenticated;
grant select (id, owner_id, operator_ref, enabled, confirmed_at, last_used_at, created_at, updated_at)
  on public.totp_secrets to authenticated;
grant select, insert, update, delete on public.totp_secrets to service_role;

drop policy if exists totp_secrets_select_own on public.totp_secrets;
create policy totp_secrets_select_own on public.totp_secrets
  for select to authenticated
  using (owner_id = auth.uid());

drop policy if exists totp_secrets_insert_own on public.totp_secrets;
create policy totp_secrets_insert_own on public.totp_secrets
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists totp_secrets_update_own on public.totp_secrets;
create policy totp_secrets_update_own on public.totp_secrets
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists totp_secrets_delete_own on public.totp_secrets;
create policy totp_secrets_delete_own on public.totp_secrets
  for delete to authenticated
  using (owner_id = auth.uid());

comment on table public.mining_nodes is
  'Cloud node registry rendered by the mining terminal. Public read; service-role write.';
comment on table public.mining_balances is
  'One durable row per operator and coin. Service-role write; owner read.';
comment on table public.subscriptions is
  'Plan subscriptions unlocked by a confirmed card or crypto payment.';
comment on table public.transactions is
  'Every money movement with its rail, status and on-chain hash.';
comment on table public.support_tickets is
  'Tickets opened from the 24/7 assistant or the help centre.';
comment on table public.referrals is
  'Affiliate codes, tiers and accrued commission per operator.';
