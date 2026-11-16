# MineAI Node

A decentralised compute mesh with a resident agent workforce. Four agents —
telemetry, sentiment, finance and growth — run overlapping shifts: they scout
winning products, fulfil orders across connected storefronts, and settle
earnings to a wallet or a bank account.

**Live:** https://mineai-three.vercel.app

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Styling | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) |
| Language | TypeScript, strict, no `ignoreBuildErrors` escape hatch |
| Payments | Paymob, Lemon Squeezy and Stripe REST APIs directly — no SDK dependency; crypto settles to owner wallets |
| Persistence | Supabase (PostgREST) with an in-memory fallback; RLS in `supabase/security_schema.sql` |
| Contracts | `$MINEAI` BEP-20/ERC-20 in `contracts/MineAIToken.sol`, Hardhat toolchain isolated under `hardhat/` |
| Deploy | Vercel |

## Layout

```
app/
  [locale]/            Root layout — html lang/dir decided on the server
    layout.tsx         <html lang dir> + global JSON-LD + providers
    page.tsx           Overview
    store/page.tsx     Node catalogue
    store/[id]/page.tsx  Node detail
    mining/page.tsx    Cloud mining console
    markets/page.tsx   Market terminal and $MINEAI identity
    rewards/page.tsx   Streaks, VIP tiers, referrals, 2FA
    notes/page.tsx     Field notes ledger
  _views/              Client view components shared by every locale route
  api/
    autonomous/        Agent cycle: state read, cycle run, node activate/pause
    payments/          Dual-rail checkout: fiat session + crypto deposit intents
    webhooks/payment/  Signed settlement callbacks from every processor
    mining/            Position read + claim/stake/unstake/withdraw; /cron accrues
    rewards/           Streak, VIP tier, referral graph
    security/2fa/      TOTP enrolment, verification and recovery
    markets/           Indices, commodities, FX, crypto and the internal quote
    token/             $MINEAI supply, burn, pools and contract addresses
    payouts/           Public settlement tape
    notes/             Ledger CRUD
    payout/            Legacy Stripe Checkout session + Connect account state
    wallet/withdraw/   Treasury readout + bank settlement
    wallet/crypto/     Multi-chain deposit receivers
    languages/         Multilingual support agent
  components/          Logo, chrome, backdrop, checkout, explainer, market board
  globals.css          Design tokens, motion keyframes, contrast-safe type
  sitemap.ts robots.ts manifest.ts icon.svg
contracts/
  MineAIToken.sol      Fixed-supply token with burn and funded staking pools
hardhat/
  package.json         Hardhat toolchain, kept out of the Next.js install
scripts/
  deploy-mineai.js     Deploy the token and seed the four pools
supabase/
  schema.sql           Commerce and notes tables
  security_schema.sql  RLS for profiles, positions, deposits, withdrawals, 2FA
src/
  lib/                 i18n engine, catalogue, treasury, payments, mining, markets
  types/               Shared domain types
```

### Why the locale segment is at the root

`app/[locale]/layout.tsx` **is** the root layout. That is deliberate: it lets
the server decide `lang` and `dir` for every request, so Arabic pages ship
`dir="rtl"` in the raw HTML instead of patching it after paint. English is
served from the un-prefixed paths through a rewrite in `next.config.mjs`,
which keeps one canonical URL per page and one route tree behind both shapes.

```
/            → rewrite → /en      (canonical, hreflang en-US)
/ar          → /ar                 (dir=rtl)
/fr/store    → /fr/store
/en/store    → 308 → /store
```

## The six-language engine

`src/lib/i18n.ts` holds the whole dictionary — every UI string for English,
Arabic, French, Spanish, Chinese and Hindi. English is the root; the other
five mirror it key-for-key, so a missing translation can never surface as a
blank label.

- `src/lib/languages.ts` — the locale registry: native name, direction, BCP-47
  locale, font stack.
- `src/lib/i18n-provider.tsx` — the single authority. A locale in the URL wins,
  then the stored preference, then English. It also owns `document.lang`,
  `document.dir` and the per-script font stack.
- `src/lib/catalog.ts` — the node catalogue, authored once per language.

## Backend surface

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/autonomous` | GET | Mesh state: treasury, nodes, cycle, agent log, Connect status. A request carrying `CRON_SECRET` also runs a cycle. |
| `/api/autonomous` | POST | `activate` / `pause` a node, or force a `cycle`. |
| `/api/payments/checkout` | GET/POST | Fiat rail status and owner bank; open a Paymob, Lemon Squeezy or Stripe session. |
| `/api/payments/crypto` | GET/POST | Seven deposit networks with QR intents; verify a `txHash` on-chain before crediting. |
| `/api/webhooks/payment` | POST | Signature-verified settlement callbacks; refuses unsigned bodies. |
| `/api/mining` | GET/POST | Position snapshot; `claim-streak`, `stake`, `unstake`, `withdraw`. |
| `/api/mining/cron` | GET | Accrues every position; guarded by `CRON_SECRET`. |
| `/api/rewards` | GET/POST | Streak, VIP tier and referral graph. |
| `/api/security/2fa` | GET/POST | TOTP enrol/verify/recover. Secrets sealed with AES-256-GCM. |
| `/api/markets` | GET | Indices, commodities, FX, top crypto and the internal $MINEAI quote. |
| `/api/token` | GET | Supply, burn, staking pools and deployed contract addresses. |
| `/api/payouts` | GET | Public settlement tape, wallet addresses masked. |
| `/api/wallet/withdraw` | GET | Treasury readout and settlement-rail state. |
| `/api/wallet/withdraw` | POST | Validate the destination, debit the treasury, settle, write the ledger. |
| `/api/payout` | GET/POST | Legacy Stripe Connect account state; open a Checkout session. |
| `/api/notes` | GET/POST/DELETE | The field-notes ledger. |
| `/api/languages` | GET/POST | Locale matrix; multilingual support agent. |

Without a processor key the matching fiat rail downgrades to a clearly-labelled
sandbox session and says so in the interface rather than pretending to settle
live money. Crypto deposits are never credited optimistically: an unreachable RPC
leaves the intent `pending`.

## Financial rails

- `src/lib/payments.ts` — Paymob, Lemon Squeezy and Stripe over plain REST.
  Checkout settles to the bank named by `OWNER_BANK_*`; the Connect account is
  passed through when present.
- `src/lib/crypto-rails.ts` — USDT on BEP-20, Arbitrum, ERC-20 and TRC-20, plus
  SOL, TON and BTC. Each rail renders a QR of the owner address, enforces a
  minimum, and verifies the submitted hash against a public RPC.
- Owner destinations are environment-only. `OWNER_WALLET_MODE=demo` labels the
  seeded values in the UI; switch it to `live` when the real wallets are set.

## Mining and $MINEAI

The mining console accrues against rented edge capacity — no hardware, no power
draw. `src/lib/mining.ts` owns positions, accrual, streaks, VIP tiers, staking,
withdrawals and the referral graph; `/api/mining/cron` runs the accrual sweep.

`contracts/MineAIToken.sol` mints the entire 1,000,000,000 supply once and exposes
burn plus funded staking pools. Yield is paid from tokens the owner moves into a
pool, never from new minting.

```bash
npm --prefix hardhat install
npm --prefix hardhat run compile
npm --prefix hardhat run deploy:testnet   # writes contracts/deployments/<network>.json
```

## Security

- `supabase/security_schema.sql` — RLS on profiles, mining positions, deposits,
  withdrawals, referral edges, the 2FA vault and the audit log.
- `src/lib/encryption.ts` — AES-256-GCM field encryption for TOTP secrets.
- `src/lib/two-factor.ts` — RFC 6238 TOTP plus hashed recovery codes. A
  withdrawal requires a live code once the operator has enrolled.
- `src/lib/rate-limit.ts` + `proxy.ts` — per-IP and per-route request budgets.
- `src/lib/validation.ts` — zod schemas for every mutating endpoint.
- `next.config.mjs` — CSP locking scripts, frames, forms and connections to the
  processors, RPCs and Supabase.

## SEO

- `app/sitemap.ts` — every route in every locale, each with the full hreflang
  set.
- `app/robots.ts` — public pages open, `/api/` closed.
- `app/[locale]/layout.tsx` and each page emit `Organization`, `WebSite`,
  `SoftwareApplication`, `ItemList`, `Product`, `FAQPage` and `BreadcrumbList`
  JSON-LD.
- Canonical URLs and six hreflang alternates (plus `x-default`) on every page.
- `app/manifest.ts`, `app/icon.svg` and a static social card at `public/og.png`.

## Local development

```bash
npm install
cp .env.local.example .env.local   # every value is optional
npm run dev
```

```bash
npm run build && npm run start
```

## Deployment

```bash
vercel deploy --prod --yes
```

The scheduled jobs live in `vercel.json`: the agent cycle at 03:00 UTC and the
mining accrual sweep at 03:30 UTC. Both run daily because Vercel's Hobby plan
refuses sub-daily cron expressions; accrual itself is time-based, so a position
still earns on read even between sweeps. Vercel sends `CRON_SECRET` as an
`Authorization: Bearer` header on every scheduled request, which
`/api/autonomous` and `/api/mining/cron` verify before doing any work.
