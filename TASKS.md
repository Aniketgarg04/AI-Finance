# Project Tasks & Status

> **Last updated:** May 17, 2026

---

## Phase 1: Backend Architecture ✅ COMPLETE

- [x] PostgreSQL database schema (8 models) via Prisma
- [x] JWT Authentication (register, login, token validation)
- [x] Google OAuth (passport-google-oauth20, callback redirect)
- [x] TransactionsModule — full CRUD with Prisma
- [x] BudgetsModule — full CRUD with Prisma
- [x] GoalsModule — full CRUD with Prisma
- [x] PortfoliosModule — full CRUD with Prisma
- [x] TaxesModule — full CRUD with Prisma
- [x] AlertsModule — full CRUD with Prisma
- [x] ChatModule — full CRUD with Prisma
- [x] CORS enabled for frontend communication
- [x] Docker Compose for PostgreSQL + Redis

---

## Phase 2: Frontend Auth & Core Foundation ✅ COMPLETE

- [x] Login page — email/password + Google OAuth button
- [x] Register page — name/email/password + Google OAuth + password strength meter
- [x] Forgot Password page — email form UI
- [x] JWT token management via Zustand `persist` middleware (localStorage)
- [x] Axios API client with auto Bearer token attachment (`src/lib/api.ts`)
- [x] Zustand hydration safety (`_hasHydrated` flag)
- [x] Google OAuth flow: redirect to backend `/auth/google` → callback with token in URL
- [x] Dark/Light theme toggle with `next-themes`

---

## Phase 3: Dashboard Pages — API Integration ✅ COMPLETE

- [x] **Dashboard Home** — real KPIs from `/transactions` + `/budgets`, dynamic user greeting
- [x] **Expenses Page** — full CRUD (create/edit/delete) via `/transactions` API
- [x] **Budgets Page** — fetches from `/budgets` + `/goals` API
- [x] **Portfolio Page** — fetches from `/portfolios` API, P&L table
- [x] **Tax Assistant** — client-side Old vs New regime calculator (no mock data)
- [x] **Fraud Detection** — fetches from `/alerts` API, resolve action via `PUT /alerts/:id`
- [x] **AI Assistant** — loads chat history from `/chat`, saves new messages via `POST /chat`
- [x] **Reports Page** — report type cards with download buttons (UI templates)

---

## Phase 4: Mock Data Cleanup ✅ COMPLETE

- [x] Deleted `src/lib/mock-data.ts` (175 lines of fake data)
- [x] Removed all "Rahul Sharma" and "rahul@example.com" references
- [x] Removed "Swiggy Order" placeholder → "Grocery Shopping"
- [x] Removed hardcoded notifications from TopNav → "No new notifications"
- [x] Removed hardcoded fraud badge count (`badge: '3'`) from nav
- [x] Removed unused imports from TopNav
- [x] All pages have proper empty states for new users

---

## Phase 5: DevOps & Infrastructure ✅ COMPLETE

- [x] `start.ps1` — one-click startup (Docker → PostgreSQL → Prisma → Backend → Frontend)
- [x] `stop.ps1` — clean shutdown of all services
- [x] `docker-compose.yml` — PostgreSQL 15 + Redis 7
- [x] `DATABASE_URL` auto-configured in `apps/api/.env`
- [x] Port cleanup before server start (kills stale processes on 3000/3001)

---

## Phase 6: Next Steps (TODO — For Frontend Team)

### High Priority
- [ ] **Add Transaction Modal on Dashboard** — quick-add button for the main dashboard page
- [ ] **Budget Creation Modal** — form to create new budget categories via `POST /budgets`
- [ ] **Goal Creation Modal** — form to create savings goals via `POST /goals`
- [ ] **Portfolio Add Asset Modal** — form to add holdings via `POST /portfolios`
- [ ] **Real-time Budget Tracking** — calculate actual spending per category from transactions

### Medium Priority
- [ ] **Report Generation** — implement PDF/CSV export from actual transaction data
- [ ] **Search Functionality** — wire TopNav search to filter transactions
- [ ] **Notification System** — fetch real notifications from backend (needs new API endpoint)
- [ ] **User Profile Page** — settings, password change, account management
- [ ] **Responsive Mobile Layout** — test and polish mobile breakpoints

### Low Priority / Future
- [ ] **AI Model Integration** — connect chat to a real LLM (OpenAI/Gemini API)
- [ ] **ML Categorization** — auto-categorize transactions via the FastAPI ML service
- [ ] **Recurring Transactions** — scheduled income/expense tracking
- [ ] **Multi-currency Support** — beyond INR
- [ ] **Data Visualization** — more chart types (line, bar, area) with real data
