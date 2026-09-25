# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Specvla Ergon — Avditor Mvndi: a multi-tenant SaaS platform that performs AI-powered website growth audits. Users submit a URL, business niche, and target goal to receive a structured audit scored across eight strategic signal pillars:
- **Sun**: Identity (brand positioning, unique value proposition)
- **Moon**: Psychology (user behavior patterns, trust architecture)
- **Mercury**: Communication (copy clarity, messaging hierarchy)
- **Venus**: Aesthetic (visual harmony, design credibility)
- **Mars**: Drive (CTA placement, conversion friction)
- **Jupiter**: Reach (audience growth, distribution, social proof)
- **Saturn**: Structure (technical SEO, speed, schema markup)
- **Neptune**: Vision (storytelling coherence, narrative strategy)

Built for creators, agencies, and consultants.

Production URL: https://specvla-ergon-avditor-mvndi.vercel.app

## Commands

```bash
npm run dev              # Start dev server (Next.js 16 + Turbopack)
npm run build            # Production build
npm run lint             # ESLint (config at .config/eslint.config.mjs)
npm test                 # Vitest unit tests (451 tests across 77 test files, config at .config/vitest.config.ts)
npm run test:watch       # Vitest in watch mode
npm run test:e2e         # Playwright E2E tests (config at .config/playwright.config.ts)
npx tsc --noEmit         # Type check without emitting
```

To run a single test file:
```bash
npx vitest run --config .config/vitest.config.ts src/services/evaluator.test.ts
```

To run a single test by name:
```bash
npx vitest run --config .config/vitest.config.ts -t "returns a passed result"
```

## Architecture

### Stack
- **Next.js 16** (App Router, dynamic/server-rendered routes) + **React 19**
- **TypeScript** (strict mode, path alias `@/*` → `./src/*`)
- **Vercel AI SDK** (`ai` package) for LLM interaction
- **Sentry** for error monitoring (config in `.config/sentry/`)
- **PostHog** for analytics
- **Stripe** for Pro/Premium subscriptions and post-audit execution purchases
- **Resend** for transactional email

### Audio-Visual Engine

- **WebGL Background Shader**: `src/components/SpaceTimeBackground.tsx` renders a fixed full-screen canvas (`z-index: -5`) with a custom WebGL fragment shader simulating a slit-scan Stargate tunnel / corridor effect (inspired by *2001: A Space Odyssey* and *Interstellar*). It dynamically responds to device orientation parallax, scroll position speed modulation, and time-of-day color shifts.
- **Generative Ambient Audio**: `src/components/AmbientResonance.tsx` (`AmbientResonanceProvider`) uses the Web Audio API to generate continuous ambient drones, sub-bass LFO breathing, filtered noise, and overtone harmonics. Tuning and harmonics continuously modulate based on time-of-day, geolocation latitude, device tilt, and page scroll.

### AI Pipeline (the core product flow)

The audit pipeline is orchestrated in `src/services/aiOrchestrator.ts`:

```
User submits URL
  → scraper.ts (cheerio, multi-page crawl based on tier limit)
  → vision.ts (puppeteer screenshot → base64)
  → pagespeed.ts (Google Lighthouse API)
  → ragService.ts (dimensional inference — coordinate-space similarity search)
  → promptTemplates.ts (assembles prompt with all context)
  → aiModelFactory.ts (creates Vercel AI SDK model instance)
  → generateText() / streamText()
  → evaluator.ts (LLM-as-a-Judge quality loop — may retry once)
  → scrubProprietaryInfo() (gates detailed tactics for Basic/free users)
```

Three AI providers are supported: **Gemini** (default), **OpenAI**, and **Claude** — selected at runtime via `X-AI-Provider` header. Users can supply their own API keys (stored in browser `localStorage`, sent via `Authorization: Bearer` header).

Two audit endpoints:
- `POST /api/audit` — full orchestrated audit (non-streaming)
- `POST /api/audit/stream` — streaming audit via `streamText`
- `POST /api/v1/analyze` — paid public API authenticated via Personal Access Tokens (PATs)

### Database Layer (Supabase + In-Memory Fallback)

`src/lib/db.ts` exposes async data functions backed by:
- **Supabase** — used in production when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables are present.
- **In-Memory Fallback (`mem`)** — used in local development when Supabase env vars are absent. Data is stored in-memory `Map` instances for the lifetime of the dev server process.

No SQLite or native C++ database modules are used. App configuration (`src/lib/config.ts`) resolves values via environment variables and defaults without filesystem access.

### Authentication

next-auth v5 beta (`src/auth.ts`) with three providers: Google, GitHub, Credentials. Session type is augmented in `src/types/next-auth.d.ts` with `isAdmin`, `isPro`, `isPremium` booleans and a `plan` string. These are populated in the JWT callback from the subscriptions table/store. `isPro` means "has paid-tier features" — it is true for **both** Pro and Premium tiers, so existing `isPro` gates work across paid tiers; `isPremium`/`plan` distinguish the top tier.

### Subscription Tiers

`src/lib/plans.ts` is the single source of truth for subscription tiers (`free`/Basic, `pro` $29/mo, `premium` $99/mo), per-tier entitlements (scrape depth, team seats, vault access, scheduled audits, API access), and Stripe price-ID resolution (`getStripePriceId`, `resolvePlanFromPriceId`). It is dependency-free and safe to import anywhere (client + server).

### Key Patterns

- **Zod validation**: All API inputs validated through schemas in `src/lib/schemas.ts`
- **Rate limiting**: LRU-cache-based, in `src/lib/rate-limit.ts` — single-instance only
- **Icon components**: `TransparentIcon` / `CosmicIcon` components handle clean SVG icon rendering for the signal pillars.
- **Test mocking for `auth`**: next-auth v5's `auth` export has complex overloaded types. Tests use `(auth as unknown as Mock)` from vitest to sidestep overload resolution issues. This is intentional.

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/audit` | Full orchestrated audit |
| `/api/audit/stream` | Streaming audit |
| `/api/audit/feedback` | User feedback on audit sections |
| `/api/chat` | Follow-up chat about audit results |
| `/api/v1/analyze` | Public API (PAT-authenticated) |
| `/api/health` | Health check |
| `/api/teams`, `/api/teams/[id]/members` | Team CRUD |
| `/api/settings/*` | User settings (branding, schedules, integrations, data export/forget) |
| `/api/admin/*` | Admin dashboard (users, analytics, config, actions) |
| `/api/leads` | Lead capture |
| `/api/pdf` | PDF report generation (puppeteer) |
| `/api/share/[id]` | Public audit sharing |
| `/api/subscription`, `/api/checkout` | Stripe billing |
| `/api/webhooks/stripe` | Stripe webhook handler |
| `/api/cron` | Scheduled audit execution |
| `/api/og` | Dynamic OG image generation |

### Pages

| Page | Purpose |
|------|---------|
| `/` | Home — audit submission form with 8 strategic pillar selection and WebGL background |
| `/results` | Audit results display with pillar scores |
| `/compare` | Side-by-side audit comparison |
| `/history` | Audit history with trend charts |
| `/settings` | AI provider selection, agency branding, integrations, schedule management |
| `/pricing` | Subscription tiers (Basic, Pro, Premium) |
| `/vault` | Gated strategy playbooks (Pro/Premium) |
| `/teams`, `/teams/[id]` | Team management |
| `/dashboard` | Aggregate product status and usage dashboard |
| `/admin` | Admin dashboard |
| `/about` | Methodology ("eight pillars") |
| `/docs` | API documentation |
| `/examples` | Example audits |

## Environment Variables

All optional — the app runs locally with zero config (in-memory Map database fallback, user-supplied AI keys):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (enables Supabase instead of in-memory fallback) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Server-side Gemini key (optional — users can supply their own in browser) |
| `STRIPE_SECRET_KEY` | Stripe for Pro/Premium subscriptions |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `STRIPE_PRICE_PRO` | Stripe recurring price ID for the Pro tier ($29/mo) |
| `STRIPE_PRICE_PREMIUM` | Stripe recurring price ID for the Premium tier ($99/mo) |
| `RESEND_API_KEY` | Transactional email via Resend |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking |
| `CRON_SECRET` | Secret for `/api/cron` scheduled audits |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth |

## Testing Notes

- Unit tests are co-located with source files (`*.test.ts` / `*.test.tsx`)
- E2E tests are in `e2e/`
- Test setup in `src/setupTests.ts` mocks `localStorage` and `sessionStorage`
- All configs live in `.config/` (eslint, vitest, playwright, sentry)
- The `auth` mock pattern uses `(auth as unknown as Mock)` — this is the correct approach for next-auth v5's overloaded types; do not change to `vi.mocked(auth)` as it will cause TypeScript errors
