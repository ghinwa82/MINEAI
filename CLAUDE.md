# MineAI Node — Engineering Guide

## 1. Operating guardrails

- **Anti-crash rule**: if a build, install or script fails more than two
  consecutive times, stop, do not start a third loop, and surface the exact
  stack trace before continuing.
- **Memory optimisation**: `.gitignore` blocks recursive indexing of
  `node_modules` and every build artefact. Keep it that way.
- **Bilingual response matrix**: per `.claudecode.json`, explain steps and
  progress in Arabic while keeping all production code, identifiers and
  technical values in English.

## 2. Where the code actually lives

The application tree is `app/`. `src/` holds the shared library layer only —
`src/lib` (i18n engine, catalogue, treasury, Stripe bridge, agent log,
structured data) and `src/types`.

Next.js resolves the root `app/` directory ahead of `src/app/`. There is no
`src/app` tree, and there must not be one: two app trees means two route
tables, two designs for the same page, and a `src/app` version that silently
never renders.

`app/[locale]/layout.tsx` is the **root layout**. That placement is
intentional — it lets the server emit `<html lang dir>` for every request, so
RTL ships in the raw HTML rather than being patched after paint. English is
served from the un-prefixed paths through the rewrite in `next.config.mjs`.

### Language engine

`src/lib/i18n.ts` is the single dictionary for all six locales (en, ar, fr,
es, zh, hi). English is the root; the other five mirror it key-for-key.
`src/lib/i18n-provider.tsx` owns the active locale and the document
direction. Never introduce a second copy of a string in a component — if a
label is missing, it belongs in the dictionary.

### Copy discipline

Do not paraphrase the dictionary to make a line fit. The catalogue copy is
authored per language on purpose; changing it changes the search surface.
When a new surface ships, add its keys to the interface and to all six
locales in the same commit.

## 3. Conventions

- TypeScript is strict and the build enforces it. `ignoreBuildErrors` stays
  off; fix the type instead.
- Tailwind v4. Design tokens live in `app/globals.css` under `@theme`. The
  legacy `tailwind.config.ts` is not loaded by v4 — do not add tokens there.
- Foreground colours must clear WCAG AA against the near-black surface. Text
  must never be hidden by a gradient: if a headline uses `background-clip:
  text`, keep a solid colour fallback on the same element.
- Use logical CSS properties (`start`/`end`, `ps`/`pe`, `ms`/`me`) so RTL
  works without a second stylesheet.
- Stripe is called over its REST API from `src/lib/stripe.ts` — no SDK. When
  no key is configured the platform returns a clearly-labelled sandbox result
  and the interface says so. Never fake a live settlement.
- The new financial modules keep their copy in `src/lib/ecosystem-i18n.ts`, one
  hand-authored block per locale. Components read it as `eco` from
  `useI18n()`; never hardcode a new-module string.
- Every internal link in a client component goes through `href(path)` from
  `useI18n()` so the locale prefix survives navigation.
- Route handlers validate their input through `src/lib/validation.ts` (zod) and
  keep a bounded in-memory audit trail.

## 4. Backend surface

| Endpoint | Role |
| --- | --- |
| `/api/autonomous` | Mesh state, agent cycle, node activation. `CRON_SECRET` guards the cycle trigger. |
| `/api/payments/checkout` | Fiat rail status and hosted checkout sessions. |
| `/api/payments/crypto` | Deposit intents, QR payloads and on-chain hash verification. |
| `/api/webhooks/payment` | Signed processor callbacks; unsigned bodies are refused. |
| `/api/mining` | Position snapshot and claim/stake/unstake/withdraw actions. |
| `/api/mining/cron` | Accrual sweep, guarded by `CRON_SECRET`. |
| `/api/rewards` | Streak, VIP tier and referral graph. |
| `/api/security/2fa` | TOTP enrolment and recovery. |
| `/api/markets` | Global quotes plus the internal $MINEAI print. |
| `/api/token` | Supply, burn, pools and contract addresses. |
| `/api/payouts` | Public settlement tape. |
| `/api/wallet/withdraw` | Treasury readout and bank settlement. |
| `/api/payout` | Legacy Stripe Checkout session and Connect account state. |
| `/api/notes` | Field-notes ledger. |
| `/api/languages` | Locale matrix and the multilingual support agent. |
| `/api/wallet/crypto` | Multi-chain deposit receivers. |

Supabase is optional. `src/lib/supabase.ts` falls back to an in-memory mode
when the keys are absent, so a deployment without secrets still boots.
`supabase/security_schema.sql` is the production RLS layer: the 2FA vault and
audit log are service-role only, and deposits/withdrawals are read-only to the
operator who owns them.

## 4b. Contracts

`contracts/MineAIToken.sol` is the only Solidity source. It mints the fixed
1,000,000,000 supply once, exposes burn, and pays staking yield from funded
reserves rather than new minting. Hardhat lives under `hardhat/` — outside the
Solidity source tree, so the app build never downloads a compiler and Hardhat
never mistakes `node_modules` for a source directory:

```bash
npm --prefix hardhat install
npm --prefix hardhat run compile
npm --prefix hardhat run deploy:testnet
```

`scripts/deploy-mineai.js` writes `contracts/deployments/<network>.json`; copy
the address into `NEXT_PUBLIC_MINEAI_BSC_CONTRACT` or the Ethereum equivalent.

## 5. SEO

`app/sitemap.ts` and `app/robots.ts` are generated from the canonical
catalogue and route list. JSON-LD is assembled in `src/lib/schema.ts` and
injected through `app/components/JsonLd.tsx`. When a page is added, it needs
a canonical URL, the six hreflang alternates and a matching entry in the
sitemap — the metadata factory in `src/lib/metadata.ts` handles the first two
if it is used.

## 6. Deployment

Vercel, project `mineai`. `vercel.json` carries the region and the scheduled
agent cycle; Vercel sends `CRON_SECRET` as an `Authorization: Bearer` header
on scheduled requests, which `/api/autonomous` verifies. The client also
hearts the cycle so the mesh stays active on plans without sub-daily crons.

`npm run build` must pass with zero warnings before a deploy.
