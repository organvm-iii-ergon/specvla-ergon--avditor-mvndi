# Phase 2 Implementation Plan

**Spec**: `docs/superpowers/specs/2026-03-15-phase2-product-evolution-design.md`
**Date**: 2026-03-15

## Steps

### Step 1: Landing Hero + Public Stats API
- Create `src/app/api/stats/public/route.ts` (GET, returns total audit count, no auth)
- Add hero section to `src/app/page.tsx` above existing form
- Add hero CSS to `src/app/globals.css`
- Test: unit test for stats API, E2E for hero visibility
- **Commit after step**

### Step 2: Inline API Key Component
- Create `src/components/ApiKeyInline.tsx` (collapsible, reads/writes localStorage)
- Integrate into `src/app/page.tsx` between form fields and submit button
- Test: unit test for component, update E2E audit flow
- **Commit after step**

### Step 3: SEO + OG Metadata
- Add metadata exports to `src/app/layout.tsx`, `about/page.tsx`, `examples/page.tsx`
- Wire OG image URL into metadata using `/api/og`
- Test: verify build passes (metadata is server-side)
- **Commit after step**

### Step 4: Shareable Audit Report Page
- Create `src/app/share/[id]/page.tsx` (server component, renders audit as HTML)
- Create `src/app/share/[id]/layout.tsx` (dynamic OG metadata per audit)
- Add CosmicChart rendering (needs client wrapper since recharts is client-only)
- Add CTA footer linking to homepage
- Test: unit test for page render, E2E for share URL navigation
- **Commit after step**

### Step 5: White-Label Rendering
- Modify `src/app/layout.tsx` to read config and inject CSS vars
- Audit `globals.css` for hardcoded colors, replace with var() references
- Test: verify config overrides apply (unit test config reading)
- **Commit after step**

### Step 6: Audit Comparison + Trends
- Create `src/components/TrendSparkline.tsx` (pure SVG, no deps)
- Create `src/components/DeltaBadge.tsx`
- Create `src/components/AuditCompare.tsx`
- Enhance `src/app/history/page.tsx` with grouping, sparklines, compare
- Test: unit tests for sparkline/badge, E2E for history page
- **Commit after step**

### Step 7: Email Capture Gate + Leads
- Add `leads` table to `src/lib/db.ts` (both SQLite and Supabase paths)
- Add `saveLead()` function
- Create `src/app/api/leads/route.ts` (POST endpoint)
- Create `src/components/EmailGate.tsx`
- Modify `src/app/results/page.tsx` to gate content for anonymous users
- Test: unit tests for leads API/db, E2E for gate flow
- **Commit after step**

### Step 8: Final verification + deploy
- Run full lint + test + build + E2E
- Push to origin
- Deploy to Vercel
