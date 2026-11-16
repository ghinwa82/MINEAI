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

drop trigger if exists mining_positions_touch on public.mining_positions;
create trigger mining_positions_touch
  before update on public.mining_positions
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------- deposits ---

create table if not exists public.deposits (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid references auth.users (id) on delete set null,
  operator_ref   text,
  rail           text not null check (rail in ('paymob', 'lemonsqueezy', 'stripe', 'crypto')),
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

-- ------------------------------------------------------------- RLS setup ---

alter table public.profiles            enable row level security;
alter table public.mining_positions    enable row level security;
alter table public.deposits            enable row level security;
alter table public.withdrawals         enable row level security;
alter table public.referral_edges      enable row level security;
alter table public.two_factor_secrets  enable row level security;
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

grant select on public.profiles, public.mining_positions, public.deposits,
  public.withdrawals, public.referral_edges to authenticated;
grant insert, update on public.profiles to authenticated;

comment on table public.two_factor_secrets is
  'TOTP secrets sealed with AES-256-GCM. Service-role access only; no RLS policy grants client reads.';
comment on table public.audit_log is
  'Append-only record of money movement and security events. Service-role access only.';
