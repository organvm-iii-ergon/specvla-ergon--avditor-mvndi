# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Growth Auditor AI is a "cosmic" growth marketing tool that audits websites and social media profiles using Google Gemini AI. Users provide a URL, business type, and goals; the app scrapes the site, captures a screenshot, fetches Lighthouse metrics, and sends everything to Gemini 1.5 Flash for a structured growth audit with scores and actionable recommendations.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint 9 with Next.js rules
npm run test         # Vitest suite (once)
npm run test:watch   # Vitest in watch mode
npx vitest run src/app/api/audit/route.test.ts  # Single test file
```

## Tech Stack

- **Next.js 16** (App Router) / React 19 / TypeScript strict
- **AI**: Google Gemini 1.5 Flash via `@google/generative-ai` + Vercel AI SDK (`ai`, `@ai-sdk/google`)
- **Database**: Dual-mode — Supabase (when env vars set) or local SQLite via `better-sqlite3` (automatic fallback)
- **Scraping**: Cheerio (HTML parsing) + Puppeteer (screenshots) + Google PageSpeed Insights API
- **Auth**: NextAuth v5 (beta) with Credentials provider — shared password, admin determined by email list
- **Payments**: Stripe (optional, disabled when no key)
- **Email**: Resend (optional), **Analytics**: PostHog (optional)
- **Testing**: Vitest + React Testing Library + jsdom
- **Styling**: Vanilla CSS with CSS variables (cosmic/deep-space theme — navy, electric blue, cosmic purple). Uses glassmorphism and gradient patterns defined in `globals.css`

## Architecture

### Request Flow (Core Audit)

`POST /api/audit` orchestrates the entire pipeline:
1. Rate-limits by IP (5/hour via LRU cache)
2. Validates Gemini API key from `Authorization: Bearer` header (users provide their own key)
3. Parallel data gathering: `scrapeWebsite()` + `captureScreenshot()` + `getPageSpeedInsights()`
4. Sends scraped content + screenshot + Lighthouse scores to Gemini with structured JSON output
5. Saves result to database, returns markdown audit + scores

### Dual Database Layer (`src/lib/db.ts`)

Every DB function (e.g., `saveAudit`, `getAudits`) has two code paths: Supabase (when `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set) or SQLite (default). Three tables: `audits`, `teams`, `team_members`.

### Config System (`src/lib/config.ts`)

App-wide settings stored in a separate SQLite database (`data/config.db`). Defaults are seeded on first run. Admin panel at `/admin` provides UI for all settings. Environment variables override config DB values.

### Auth (`src/auth.ts`)

NextAuth v5 Credentials provider. Single shared password (default: "cosmic"). Admin status determined by email match against `adminEmails` config. The `isAdmin` flag is passed through JWT → session callbacks.

### Key Services (`src/services/`)

| Service | Purpose |
|---------|---------|
| `scraper.ts` | Cheerio-based HTML scraping |
| `vision.ts` | Puppeteer screenshot capture |
| `pagespeed.ts` | Google PageSpeed Insights (Lighthouse scores) |
| `promptTemplates.ts` | Gemini prompt construction with cosmic marketing persona |

### API Routes

| Route | Purpose |
|-------|---------|
| `api/audit` | Core audit generation |
| `api/chat` | AI chat (Vercel AI SDK streaming) |
| `api/history` | Audit history retrieval |
| `api/share/[id]` | Public audit sharing |
| `api/admin/*` | Admin panel CRUD (config, users, actions) |
| `api/checkout` | Stripe checkout session |
| `api/subscription` | Subscription status |
| `api/webhooks/stripe` | Stripe webhook handler |
| `api/cron` | Monthly re-audit trigger |
| `api/auth/[...nextauth]` | NextAuth handlers |
| `api/og` | OG image generation (`@vercel/og`) |

## Conventions

- `@/*` path alias maps to `src/` — use for all imports
- Tests co-located next to source files (`*.test.ts` / `*.test.tsx`)
- Double quotes, semicolons, 2-space indent
- Default exports only where Next.js requires them (pages, layouts, routes)
- `'use client'` only when genuinely needed (hooks, browser APIs)
- Services handle failures gracefully — `Promise.all` with `.catch(() => null)` for non-critical fetches

## Local Data Files

- `data/audits.db` — SQLite audit storage (created on first run)
- `data/config.db` — App configuration (created on first run, seeded with defaults)
- Both are gitignored
