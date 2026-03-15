# Phase 3 Implementation Plan

## Steps

### Step 1: Streaming audit generation
- Create new `src/app/api/audit/stream/route.ts` using Vercel AI SDK `streamText`
- Modify `src/app/results/page.tsx` to consume streaming response
- Keep existing `/api/audit` as fallback for non-streaming clients
- Test: unit test for stream route

### Step 2: Admin leads view
- Add leads tab to admin page
- Create `getLeads()` function in db.ts
- Add leads fetch to admin API routes
- Test: unit test for leads API

### Step 3: Scheduled audit config UI
- Create `/settings/schedules` or add section to settings page
- API endpoint to save/list scheduled audit configs
- Enhance cron route to read from config instead of re-auditing all users

### Step 4: Multi-provider AI
- Create `src/services/aiProvider.ts` abstraction layer
- Support: Gemini (existing), OpenAI, Claude
- Settings page: provider selector + key input per provider
- Audit route uses selected provider

### Step 5: PDF export overhaul
- Replace html2pdf.js with server-side Puppeteer PDF generation
- New API route `POST /api/pdf` that renders audit HTML and returns PDF
- Cleaner output with light theme for print

### Step 6: Notification system
- Create `src/services/email.ts` abstraction over Resend
- Templates: audit-complete, monthly-delta, lead-alert
- Wire into: audit completion, cron job, leads API
- Admin gets email on new lead capture
