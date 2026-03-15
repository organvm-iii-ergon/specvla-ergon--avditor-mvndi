# Growth Auditor AI — GEMINI.md

This file serves as the foundational context and instructional mandate for all AI interactions within the **Growth Auditor AI** project. It outlines the project's architecture, engineering standards, and operational guidelines.

## 🚀 Project Overview

**Growth Auditor AI** is a "cosmic" growth marketing tool designed to help creators and businesses audit their digital presence (websites, social media). It leverages AI to provide data-driven insights blended with a unique "astrological" branding and strategic alignment perspective.

- **Mission:** Decode digital bottlenecks and align business strategy with "cosmic" growth windows.
- **Core Value:** Automated, high-level growth audits that lead to actionable "Manifestation Paths" (Done-For-You, Done-With-You, or Consulting).

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Vanilla CSS (Global variables + CSS Modules + some `styled-jsx`)
- **AI:** Google Generative AI (`@google/generative-ai`) — Gemini 1.5 Flash
- **Language:** TypeScript (Strict mode)
- **Testing:** Vitest + React Testing Library (JSDOM environment)
- **Runtime:** Node.js v25.x

## 📂 Architecture

- `src/app/`: Next.js App Router root.
  - `api/audit/`: Core AI audit logic (POST handler).
  - `results/`: Display page for generated audits.
  - `settings/`: API key configuration (Gemini/OpenAI).
- `src/components/`: Reusable React components (Loader, UpsellCard, etc.).
- `src/types/`: Shared TypeScript definitions.
- `public/`: Static assets (SVGs, Favicon).

## ⚙️ Building and Running

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the development server at `http://localhost:3000` |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code quality issues |
| `npm run test` | Runs all Vitest tests once |
| `npm run test:watch` | Runs Vitest in interactive watch mode |

## ⚖️ Engineering Standards

### 1. Architectural Integrity
- **App Router:** Strictly adhere to Next.js App Router conventions.
- **Client/Server Split:** Use `'use client'` only when necessary (interactivity, browser APIs like `localStorage` or `sessionStorage`).
- **Thin Handlers:** Keep `src/app/api/` route handlers focused on orchestration. Move complex business logic or prompt engineering into services if they grow.

### 2. Code Quality
- **TypeScript:** Strict mode enabled. Prefer interfaces for data shapes. Avoid `any`.
- **Async/Await:** Use for all asynchronous operations.
- **Exports:** Use named exports exclusively for components and utilities.

### 3. Styling & Aesthetics
- **Theme:** "Deep Space / Cosmic" (Navy, Electric Blue, Cosmic Purple).
- **CSS:** Use the CSS variables defined in `src/app/globals.css`.
- **Design Language:** Modern, "alive," and polished. Use glassmorphism (`backdrop-filter`), gradients, and subtle animations (`fadeIn`, `pulse-slow`).

### 4. Testing
- **Convention:** Tests should be located next to the file they test, named `*.test.tsx` or `*.test.ts`.
- **Validation:** Always verify both component rendering and API logic.

## 🌌 AI Intent & Strategy

- **Prompting:** The AI acts as an "expert growth marketing consultant with a specialty in Cosmic Strategy."
- **Formatting:** Responses are returned in structured Markdown.
- **Lead Gen:** Every audit MUST include three specific CTA paths:
  1. **The Builder** (DFY)
  2. **The Vault** (DWY Templates)
  3. **The Oracle** (Consulting)

---
*"Build small digital machines that sell while you sleep."*
