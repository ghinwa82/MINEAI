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
| Payments | Stripe REST API directly — no SDK dependency |
| Persistence | Supabase (PostgREST) with an in-memory fallback |
| Deploy | Vercel |

## Layout

```
app/
  [locale]/            Root layout — html lang/dir decided on the server
    layout.tsx         <html lang dir> + global JSON-LD + providers
    page.tsx           Overview
    store/page.tsx     Node catalogue
    store/[id]/page.tsx  Node detail
    notes/page.tsx     Field notes ledger
  _views/              Client view components shared by every locale route
  api/
    autonomous/        Agent cycle: state read, cycle run, node activate/pause
    notes/             Ledger CRUD
    payout/            Stripe Checkout session + Connect account state
    wallet/withdraw/   Treasury readout + bank settlement
    wallet/crypto/     Multi-chain deposit receivers
    languages/         Multilingual support agent
  components/          Logo, chrome, backdrop, JSON-LD injector
  globals.css          Design tokens, motion keyframes, contrast-safe type
  sitemap.ts robots.ts manifest.ts icon.svg
src/
  lib/                 i18n engine, catalogue, treasury, stripe, agents, schema
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
| `/api/wallet/withdraw` | GET | Treasury readout and settlement-rail state. |
| `/api/wallet/withdraw` | POST | Validate the destination, debit the treasury, settle, write the ledger. |
| `/api/payout` | GET/POST | Stripe Connect account state; open a Checkout session. |
| `/api/notes` | GET/POST/DELETE | The field-notes ledger. |
| `/api/languages` | GET/POST | Locale matrix; multilingual support agent. |

Without a Stripe key the storefront runs on a clearly-labelled sandbox rail and
says so in the interface rather than pretending to settle live money.

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

The scheduled agent cycle lives in `vercel.json`. Vercel sends
`CRON_SECRET` as an `Authorization: Bearer` header on every scheduled request,
which `/api/autonomous` verifies before running a cycle. The client also
keeps the loop alive with a heartbeat, so the mesh stays active on plans where
sub-daily crons are not available.
