# CHANGES.md

## UI Redesign — Premium AI Finance Copilot
**Date:** 2026-07-24  
**Type:** Major UI Overhaul (Frontend only — no backend changes)

---

## Overview

Complete redesign of the frontend from a generic admin dashboard into a premium, production-grade AI-first fintech SaaS application.

Design inspired by: **Stripe · Linear · Vercel · Mercury · Notion · Apple**

> **Backend is untouched.** All API calls, business logic, hooks, stores, and types remain identical.

---

## Files Changed

### Design System

#### `apps/web/src/app/globals.css` — Complete Rewrite
- Replaced dark glassmorphism design with clean enterprise light/dark theme
- Added full **dark mode** via CSS custom properties (`html.dark`)
  - Light: `#FAFAFA` background, `#FFFFFF` surfaces, `#E5E7EB` borders
  - Dark: `#09090B` background, `#18181B` surfaces, `#27272A` borders
- Dark mode persists via **localStorage** (next-themes `storageKey="finance-theme"`)
- Added 6 semantic chart color tokens (`--chart-1` through `--chart-6`) that auto-switch in dark mode
- Replaced all hardcoded colors with CSS variables throughout
- New typography scale:
  - Heading: 34px / Bold
  - Section: 22px / Semibold
  - Numbers: 40px / Bold (`tabular-nums`)
  - Body: 15px / Regular
  - Muted: 13px
- Card system: white surface, 14px radius, `#E5E7EB` border, `0 1px 2px rgba(0,0,0,.04)` shadow, `translateY(-2px)` hover
- Dashboard CSS Grid layout classes: `.dash-hero`, `.dash-charts`, `.dash-data` with full responsive breakpoints (1600px → 1440 → 1280 → 1024 → 768 → 480)
- New utility classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-icon`, `.badge`, `.progress-track`, `.skeleton`, `.chat-user`, `.chat-ai`, `.typing-dot`
- Removed: all glassmorphism, neon glows, gradient backgrounds, box-shadow glows

---

### Layout & Navigation

#### `apps/web/src/components/layout/Sidebar.tsx` — Rewrite
- Linear-style flat navigation, no blur effects
- Groups: _(root)_ / **Finance** (Transactions, Portfolio, Budget) / **Intelligence** (AI Copilot, Insights, Reports, Settings)
- Icon-only collapse mode on desktop (60px) with tooltips
- Animated active pill via `framer-motion` `layoutId`
- Dark mode via CSS variables
- Mobile overlay drawer with backdrop
- Clean user footer with avatar initial + logout

#### `apps/web/src/components/layout/TopNav.tsx` — Rewrite
- Greeting in top bar: _"Good morning, [Name]"_ (context-aware: morning/afternoon/evening)
- Inline theme toggle (Moon/Sun icon) — no separate component file needed
- Animated search expand (150ms, no janky layout shift)
- Notifications panel (click-outside to close)
- User avatar (initial letter)
- Fully dark-mode-aware

#### `apps/web/src/components/layout/MobileBottomNav.tsx` — Update
- Clean 5-tab bottom navigation bar
- Spring-animated active indicator line (top border)
- Dark mode aware via CSS variables

#### `apps/web/src/components/layout/ThemeToggle.tsx` — Simplified
- Retained for compatibility; uses `btn btn-icon` utility class

#### `apps/web/src/app/(dashboard)/layout.tsx` — Update
- Content `maxWidth` set to **1600px**
- Uses `var(--bg)` for background (dark mode automatic)
- Sidebar open state wired via `.open` CSS class

#### `apps/web/src/app/layout.tsx` — Update
- `ThemeProvider` updated: `defaultTheme="system"`, `enableSystem`, `storageKey="finance-theme"`
- Enables OS-level dark mode detection + localStorage persistence

---

### Dashboard Home Page

#### `apps/web/src/app/(dashboard)/dashboard/page.tsx` — Complete Rewrite

New 3-row layout:

**Row 1 — Hero (65% / 35% CSS Grid)**
- Left: Inline AI Copilot (`InlineCopilot.tsx`)
- Right: Financial summary panel (`PortfolioPanel.tsx`)

**Row 2 — Charts (3-column grid)**
- Net Worth Trend (area chart)
- Cash Flow (income vs expense bar chart)
- Expense Breakdown (donut chart)

**Row 3 — Data (2fr / 1fr / 1fr grid)**
- Recent Transactions (list with income/expense indicators)
- Upcoming Bills (with urgency indicators for due-in-≤3-days)
- AI Insights (bullet cards from `summary.insights`)

All sections use real API data from `useDashboardSummary` hook — no mock data.

#### `apps/web/src/app/(dashboard)/dashboard/InlineCopilot.tsx` — NEW
- Inline AI chat panel embedded in the dashboard hero
- Empty state: 6 clickable prompt cards in a 2-column grid
- Full conversation history with user/AI message bubbles
- Auto-resizing textarea (max 120px height)
- File attach button (PDF/CSV — UI ready)
- Voice input button (UI ready)
- "Full view →" link to `/assistant`
- Connects to ML service at `http://localhost:8000/api/v1/agent`

#### `apps/web/src/app/(dashboard)/dashboard/PortfolioPanel.tsx` — NEW
- Right-side financial summary widget
- Sections: Net Worth · Investments · Cash (with trend badges)
- Monthly Budget progress bar
- Emergency Fund savings goal progress bar
- Monthly Savings (color-coded green/red)
- Market summary: NIFTY 50, SENSEX, Gold (static reference values)

---

### AI Copilot Full Page

#### `apps/web/src/app/(dashboard)/assistant/page.tsx` — Rewrite
- Empty state with 6 prompt suggestion cards (2-col grid)
- Welcome message always shown above conversation
- ChatGPT-quality message bubbles (user = blue, AI = white card)
- Animated typing indicator (3-dot pulse)
- Human-in-the-loop approval box (amber left-border, Approve/Reject buttons)
- Auto-resizing textarea with Shift+Enter support
- File attach + Voice input buttons (UI scaffolded)
- "New chat" button clears conversation
- Disclaimer footer
- Full dark mode support

---

### Dashboard Components

#### `apps/web/src/components/dashboard/StatCard.tsx` — Rewrite
- Renamed interface prop: `title` → `label` (breaking change within codebase — also fixed in portfolio page)
- Typography-first design: large number is the hero, no colored icon backgrounds
- Trend badge: green (↑ good) / red (↓ bad) with correct sign logic
- Static sparkline (no `Math.random()` — prevents Next.js hydration mismatch)
- Dark mode via CSS variables

#### `apps/web/src/components/dashboard/BalanceChart.tsx` — Update
- Uses `var(--chart-1)` for stroke/fill — automatically switches in dark mode
- Removed hardcoded `#2563EB` color
- Subtle fill gradient (0% → 15% opacity)

#### `apps/web/src/components/dashboard/IncomeVsExpenseBar.tsx` — Update
- Uses `var(--chart-2)` for income, `var(--chart-5)` for expense
- 8px bar width, rounded tops (`radius={[4,4,0,0]}`)
- Minimal grid (horizontal lines only, no vertical)

#### `apps/web/src/components/dashboard/CategoryDonutChart.tsx` — Update
- Uses `var(--chart-1)` through `var(--chart-6)` color tokens
- Center label shows total amount
- Inline legend with category name + amount
- Dark mode aware

#### `apps/web/src/components/dashboard/RecentTransactions.tsx` — Update
- List-style rows with dividers (no card wrappers)
- Income = green arrow-down, Expense = neutral arrow-up
- Category shown as subtitle text (no emojis)

---

### Bug Fixes

- **`dashboard/page.tsx` line 171**: Fixed unescaped apostrophe in single-quoted string `'month's average'` → switched to double quotes
- **`portfolio/page.tsx`**: Fixed `StatCard` prop name from `title` → `label` + removed removed `iconColor`/`iconBg` props that no longer exist
- **`dashboard/page.tsx`**: Fixed TypeScript error — added `as 'credit' | 'debit'` type assertion on transaction type mapping
- **`globals.css`**: Removed `input` override that was accidentally styling checkboxes/radios

---

## What Was NOT Changed

- All API routes and controllers (`apps/api/`)
- All database schema (`packages/database/`)
- All ML service code (`apps/ml-service/`)
- All Zustand stores (`auth.store.ts`, `ui.store.ts`)
- All custom hooks (`useDashboardSummary.ts`)
- All TypeScript types (`types/index.ts`, `types/dashboard.ts`)
- All utility functions (`lib/utils.ts`, `lib/api.ts`, `lib/constants.ts`)
- Login / Register / Onboarding pages
- Portfolio page business logic
- Expenses / Budgets / Reports / Tax / Fraud pages (styles inherit from new design system)

---

## Design Principles Applied

| Principle | Implementation |
|---|---|
| No glassmorphism | Removed all `backdrop-blur`, `rgba` glow effects |
| No gradient backgrounds | Pure `var(--surface)` white/dark cards only |
| No decorative elements | Every element has a functional purpose |
| Typography-first | Numbers are the visual hero, not icons |
| Generous whitespace | 24px card padding, 24px grid gaps, 8px spacing system |
| Dark mode complete | All CSS variables switch via `html.dark` class |
| Responsive | 5 breakpoints: 1600 → 1280 → 1024 → 768 → 480 |
| AI is the product | Inline Copilot is the dashboard hero (65% of Row 1) |
| 150ms animations only | `fade`, `scale`, `slide` — no bounce, no spring for layout |
