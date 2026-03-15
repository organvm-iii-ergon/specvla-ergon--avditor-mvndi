# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` contains the Next.js App Router UI and API routes
- API routes: `api/audit`, `api/chat`, `api/history`, `api/cron`, `api/checkout`, `api/webhooks`, `api/auth`
- Keep route handlers thin; push reusable logic into `src/services/`
- Services: scraping (`scraper.ts`), prompts (`promptTemplates.ts`), vision (`vision.ts`), PageSpeed (`pagespeed.ts`)
- Shared UI: `src/components/`, Providers: `src/providers/`, Persistence: `src/lib/db.ts`
- Static files: `public/`, Local SQLite fallback: `data/audits.db`
- Use the `@/*` path alias from `tsconfig.json` for all imports

## Build, Test, and Development Commands

### Development
- `npm run dev` - Start local Next.js server at http://localhost:3000
- `npm run build` - Create production build
- `npm run start` - Serve production build locally

### Linting & Type Checking
- `npm run lint` - Run ESLint 9 with Next.js core-web-vitals and TypeScript rules

### Testing
- `npm run test` - Run Vitest suite once
- `npm run test:watch` - Run Vitest in watch mode for development
- `npx vitest run src/app/api/audit/route.test.ts` - Run a single test file
- `npx vitest run --reporter=verbose` - Run with verbose output

## Code Style Guidelines

### General Principles
- Use TypeScript with strict mode (enabled in tsconfig.json)
- Prefer functional React components and async/await patterns
- Use descriptive names over shorthand; avoid single-letter variables except in loops
- Keep new logic server-safe unless a file genuinely needs `'use client'`

### Imports & Path Aliases
- Use the `@/*` path alias for all internal imports: `import { foo } from "@/services/bar"`
- Order imports: external libraries → internal modules → types/interfaces
- Use named exports except where Next.js expects default (`page.tsx`, `layout.tsx`, route modules)
- Example:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/services/scraper";
import { getCosmicAuditPrompt } from "@/services/promptTemplates";
import { captureScreenshot } from "@/services/vision";
import type { SomeType } from "@/types";
```

### Formatting & Style
- Use double quotes for strings in JavaScript/TypeScript
- Use semicolons for statement termination
- Use 2 spaces for indentation (Prettier default with Next.js)
- Match the surrounding file's quote style and formatting; don't reformat unrelated code
- Maximum line length: 100 characters (soft limit)

### Naming Conventions
- **Files**: Use kebab-case for utilities (`scraper.ts`), PascalCase for components (`ChatBox.tsx`)
- **Functions**: Use camelCase and verb prefixes (`scrapeWebsite`, `getCosmicAuditPrompt`)
- **Types/Interfaces**: Use PascalCase (`interface ChatBoxProps`)
- **Constants**: Use camelCase or UPPER_SNAKE_CASE for config constants
- **React Components**: PascalCase, match filename

### TypeScript Guidelines
- Always define return types for functions, especially async ones
- Use `any` sparingly; prefer explicit types
- Use `interface` for object shapes, `type` for unions/aliases
- Example:
```typescript
export async function scrapeWebsite(url: string): Promise<string> {
  // implementation
}

interface AuditRequest {
  link: string;
  businessType: string;
  goals: string;
}
```

### Error Handling
- Use try/catch blocks for async operations with meaningful error messages
- Return appropriate HTTP status codes in API routes (401 for auth, 400 for bad input, 429 for rate limits, 500 for server errors)
- Log errors with context using `console.error` or proper logging
- Fail gracefully in parallel operations; don't let one failure crash the whole request
- Example:
```typescript
const [scrapedContent, screenshotBase64] = await Promise.all([
  scrapeWebsite(link),
  captureScreenshot(link).catch(() => null), // Fail gracefully
]);
```

### React Components
- Use `"use client"` directive only when needed (hooks, event handlers, browser APIs)
- Destructure props in function parameters when possible
- Keep components focused and small (< 100 lines preferred)
- Co-locate tests next to components: `ChatBox.tsx` and `ChatBox.test.tsx`

### Testing Guidelines
- Vitest runs in `jsdom` with React Testing Library via `src/setupTests.ts`
- Place tests next to code: `*.test.ts` or `*.test.tsx`
- Mock external dependencies using `vi.mock()`:
```typescript
vi.mock('@/services/scraper', () => ({
  scrapeWebsite: vi.fn().mockResolvedValue("Mocked content")
}));
```
- No coverage threshold configured; add tests for UI states, API branches, and storage paths

### API Routes
- Request handlers are async and return `NextResponse`
- Validate input early and return 400 for missing/invalid fields
- Return proper error messages (user-friendly, not technical)
- Rate limiting should return 429 with clear message

### Database & Persistence
- Use `saveAudit()` from `@/lib/db` for audit persistence
- Handle DB errors gracefully; don't fail the request if DB is unavailable
- Document any changes to Supabase vs local SQLite fallback behavior

## Configuration & Secrets
- Store local secrets in `.env.local` only
- Never commit live API keys (Gemini, Supabase, Stripe, Resend, PostHog) or cron credentials
- When changing persistence, document whether changes affect Supabase, local SQLite, or both

## Production Deployment (Supabase Setup)

The app automatically uses Supabase when environment variables are set, otherwise falls back to SQLite.

### Supabase Setup Steps:
1. Create a Supabase project at https://supabase.com
2. Run this SQL in the Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS audits (
  id TEXT PRIMARY KEY,
  userEmail TEXT,
  link TEXT NOT NULL,
  businessType TEXT NOT NULL,
  goals TEXT NOT NULL,
  markdownAudit TEXT NOT NULL,
  scores TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
3. Add these environment variables to Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (with admin permissions)

## Git & Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- Keep commits focused and atomic
- PRs should include: concise summary, test/lint evidence, linked issues, screenshots for UI changes

## Dependencies (Key Packages)
- **AI**: `@google/generative-ai`, `ai` (Vercel AI SDK), `@ai-sdk/google`
- **Database**: `better-sqlite3` (local), `@supabase/supabase-js`
- **Scraping**: `cheerio`, `puppeteer`
- **Testing**: `vitest`, `@testing-library/react`, `jsdom`
- **UI**: `react`, `recharts`, `react-markdown`

## Admin Panel

The admin panel is at `/admin` and requires:
1. A user account with email matching `adminEmails` in config
2. Password set in config (default: "cosmic")

### Admin Features:
- **Overview Tab**: Stats (total audits, users, last 30 days)
- **Users Tab**: View all users, their audit counts, first/last activity
- **Audits Tab**: View and delete individual audits
- **Config Tab**: All application settings (see below)

### Configuration (stored in `data/config.db`):
All settings can be configured via the admin panel UI:

| Setting | Default | Description |
|---------|---------|-------------|
| adminEmails | admin@growthauditor.ai | Comma-separated admin emails |
| authPassword | cosmic | Login password |
| baseUrl | http://localhost:3000 | Public URL |
| geminiApiKey | (empty) | AI key (users can provide their own) |
| supabaseUrl | (empty) | PostgreSQL URL (empty = SQLite) |
| supabaseKey | (empty) | Supabase service key |
| stripeSecretKey | (empty) | Payment processing (empty = disabled) |
| posthogKey | (empty) | Analytics (empty = disabled) |
| resendApiKey | (empty) | Email sending (empty = disabled) |
| enableSubscriptions | false | Show subscription options |
| enableMonthlyAudits | true | Run automatic monthly re-audits |

### Default Behavior (Free/Open Source Friendly):
- No Supabase → uses local SQLite (`data/audits.db`)
- No Stripe → no payment processing
- No PostHog → no analytics tracking
- No Resend → no email sending (users use their own Gemini keys)
- No subscription → one-time audits only
- Monthly audits run for all users with email (can be triggered manually)

### Environment Variables (alternative to config UI):
All config can also be set via environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `RESEND_API_KEY`, `CRON_SECRET`, `ADMIN_EMAILS`
- `NEXT_PUBLIC_BASE_URL`
