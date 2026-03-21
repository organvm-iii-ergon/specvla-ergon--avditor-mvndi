# Growth Auditor AI — Technical Documentation

## 🚀 Architecture Overview

Growth Auditor AI is a full-stack Next.js application designed for cosmic growth marketing audits. It features a multi-tenant architecture supporting individual creators and professional agencies (Teams).

### Core Components
- **Frontend:** Next.js 16 (App Router), React 19, Vanilla CSS (Cosmic Theme).
- **Backend:** Next.js API Routes (Edge-ready where applicable).
- **Database:** SQLite (local development) / Supabase (production).
- **AI Integration:** Multi-provider support via Vercel AI SDK (Gemini, OpenAI, Claude).
- **Scraper:** Cheerio-based recursive scraper with multi-page support for Pro users.
- **Reporting:** Server-side PDF generation using Puppeteer.
- **Payments:** Stripe integration for "Basic" and "Pro" subscription tiers.

## 🛠️ Tech Stack & Services

| Service | Purpose |
| :--- | :--- |
| **Google Gemini** | Primary AI model for growth audits. |
| **Puppeteer** | Web screenshots and server-side PDF generation. |
| **Resend** | Transactional email notifications. |
| **Stripe** | Subscription management and billing. |
| **Recharts** | Data visualization for growth trends. |
| **NextAuth.js** | Authentication and session management. |

## 📂 Project Structure

- `src/app/api/`: REST API endpoints for audits, teams, subscriptions, and crons.
- `src/app/teams/`: Team management and collaboration UI.
- `src/app/pricing/`: Subscription tier selection.
- `src/components/`: Reusable UI components (Cosmic Charts, Pro Badges, etc.).
- `src/services/`: Core business logic (AI factory, Scraper, Vision, Email).
- `src/lib/`: Shared utilities (Database abstraction, config, environment).

## 🔒 Security & Multi-Tenancy

- **Data Isolation:** All audits and schedules are isolated by `userEmail` and `teamId`.
- **RBAC:** Team members have roles (`owner`, `admin`, `member`) governing access to shared assets and invites.
- **Subscription Gating:** Advanced features (Scheduled audits, 3-page analysis, branding) are gated via the `isPro` flag in the session JWT.
- **Credential Safety:** API keys for standard users are stored in the browser's `localStorage` and never touch our database. Pro features use server-side environment variables.

## 📈 Advanced Features

### 1. Recursive Scraping
Pro users benefit from a deep-crawl of their digital assets. The scraper follows internal links (depth 1, max 3 pages) to provide a holistic view of the brand's manifestation.

### 2. Cosmic Trend Analytics
The history page visualizes the evolution of the four cosmic pillars:
- **Mercury (Communication):** Content quality and clarity.
- **Venus (Aesthetic):** Visual appeal and branding.
- **Mars (Drive):** Calls to action and conversion energy.
- **Saturn (Structure):** Technical SEO and site performance.

### 3. White-Label Reporting
Agencies can upload their custom logo in Settings. This logo is automatically injected into the server-side PDF generation process for professional client delivery.

## ⚙️ Deployment & Crons

### Environment Variables
Required for production:
- `DATABASE_URL`: Supabase connection string.
- `STRIPE_SECRET_KEY`: For processing payments.
- `RESEND_API_KEY`: For notifications.
- `CRON_SECRET`: To secure the daily audit trigger.

### Recurring Audits
A cron job at `/api/cron` runs daily to check for due recurring audits. It iterates through the `scheduled_audits` table, performs the re-audit, and notifies the relevant users/teams via email.

---
*"Aligning digital potential with cosmic timing."*
