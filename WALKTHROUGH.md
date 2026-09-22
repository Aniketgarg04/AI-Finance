# Backend API Guide (For Frontend Team)

> **Last updated:** May 17, 2026  
> **Status:** All backend services are **LIVE** with real Prisma/PostgreSQL queries. No mock data.

---

## 🚀 Running the Full Stack

### One-Click Start (Recommended)
```powershell
.\start.ps1
```
This starts Docker, PostgreSQL, runs migrations, and launches both servers.

### Manual Start
```bash
docker compose up -d          # Start PostgreSQL
npm run db:push               # Sync schema
npm run dev:api               # Backend on port 3001
npm run dev:web               # Frontend on port 3000
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| PostgreSQL | localhost:5432 |

---

## 🔐 Authentication & Authorization

All API routes (except `/auth/*`) are protected by JWT. The frontend must include:
```
Authorization: Bearer <access_token>
```

### How the Auth Store Works (Frontend)
The token is managed by Zustand with `persist` middleware (`localStorage`).
- **Store location:** `apps/web/src/store/auth.store.ts`
- **API client:** `apps/web/src/lib/api.ts` — automatically attaches the Bearer token
- **Hydration:** The store has a `_hasHydrated` flag. All dashboard pages wait for hydration before making API calls.

### Auth Endpoints (No JWT required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/auth/register` | `{ name, email, password }` | `{ access_token, user }` |
| `POST` | `/auth/login` | `{ email, password }` | `{ access_token, user }` |
| `GET` | `/auth/google` | — | Redirects to Google OAuth |
| `GET` | `/auth/google/callback` | — | Redirects to frontend with `?token=...&userId=...&name=...&email=...` |

---

## 📡 API Endpoints (All JWT-Protected)

Every endpoint below requires `Authorization: Bearer <token>` header.  
All services use **real Prisma queries** against PostgreSQL — no mock data.

### 💸 Transactions (`/transactions`)
| Method | Path | Body Fields | Notes |
|---|---|---|---|
| `GET` | `/transactions` | — | Returns all transactions for the authenticated user |
| `POST` | `/transactions` | `{ amount, type, category, description?, date? }` | `type` = `"INCOME"` or `"EXPENSE"` |
| `GET` | `/transactions/:id` | — | Single transaction |
| `PUT` | `/transactions/:id` | `{ amount?, type?, category?, description?, date? }` | Partial update |
| `DELETE` | `/transactions/:id` | — | Deletes a transaction |

### 📊 Budgets (`/budgets`)
| Method | Path | Body Fields |
|---|---|---|
| `GET` | `/budgets` | — |
| `POST` | `/budgets` | `{ category, limit, month, year }` |
| `GET` | `/budgets/:id` | — |
| `PUT` | `/budgets/:id` | `{ category?, limit?, month?, year? }` |
| `DELETE` | `/budgets/:id` | — |

### 🎯 Goals (`/goals`)
| Method | Path | Body Fields |
|---|---|---|
| `GET` | `/goals` | — |
| `POST` | `/goals` | `{ name, targetAmount, currentAmount?, deadline? }` |
| `GET` | `/goals/:id` | — |
| `PUT` | `/goals/:id` | `{ name?, targetAmount?, currentAmount?, deadline? }` |
| `DELETE` | `/goals/:id` | — |

### 📈 Portfolios (`/portfolios`)
| Method | Path | Body Fields |
|---|---|---|
| `GET` | `/portfolios` | — |
| `POST` | `/portfolios` | `{ assetSymbol, assetName, quantity, buyPrice, currentPrice? }` |
| `GET` | `/portfolios/:id` | — |
| `PUT` | `/portfolios/:id` | `{ assetSymbol?, assetName?, quantity?, buyPrice?, currentPrice? }` |
| `DELETE` | `/portfolios/:id` | — |

### 🇮🇳 Taxes (`/taxes`)
| Method | Path | Body Fields |
|---|---|---|
| `GET` | `/taxes` | — |
| `POST` | `/taxes` | `{ year, taxableIncome, estimatedTax, deductions? }` |
| `GET` | `/taxes/:id` | — |
| `PUT` | `/taxes/:id` | `{ year?, taxableIncome?, estimatedTax?, deductions? }` |
| `DELETE` | `/taxes/:id` | — |

### 🚨 Fraud Alerts (`/alerts`)
| Method | Path | Body Fields |
|---|---|---|
| `GET` | `/alerts` | — |
| `POST` | `/alerts` | `{ transactionId?, reason, resolved? }` |
| `GET` | `/alerts/:id` | — |
| `PUT` | `/alerts/:id` | `{ reason?, resolved? }` |
| `DELETE` | `/alerts/:id` | — |

### 🤖 AI Chat (`/chat`)
| Method | Path | Body Fields |
|---|---|---|
| `GET` | `/chat` | — |
| `POST` | `/chat` | `{ prompt, response }` |
| `GET` | `/chat/:id` | — |
| `PUT` | `/chat/:id` | `{ prompt?, response? }` |
| `DELETE` | `/chat/:id` | — |

---

## 🗄️ Database Schema

All models are defined in `packages/database/prisma/schema.prisma`.

| Model | Key Fields | Purpose |
|---|---|---|
| `User` | id, email, password?, googleId?, name | Authentication |
| `Transaction` | amount, type, category, description, date | Income/Expense tracking |
| `Budget` | category, limit, month, year | Monthly budget limits |
| `Goal` | name, targetAmount, currentAmount, deadline | Savings targets |
| `Portfolio` | assetSymbol, assetName, quantity, buyPrice, currentPrice | Investment tracking |
| `TaxRecord` | year, taxableIncome, estimatedTax, deductions | Tax calculations |
| `FraudAlert` | transactionId, reason, resolved | Suspicious activity flags |
| `AIChat` | prompt, response | Chat conversation history |

### Using Prisma Types in Frontend
```typescript
import type { Transaction, Budget } from '@ai-finance/database';
```

---

## 🧭 Frontend Architecture (Current State)

### Pages & API Integration Status

| Page | Route | API Endpoints Used | Status |
|---|---|---|---|
| Login | `/login` | `POST /auth/login`, `GET /auth/google` | ✅ Complete |
| Register | `/register` | `POST /auth/register`, `GET /auth/google` | ✅ Complete |
| Forgot Password | `/forgot-password` | — | ✅ UI only |
| Dashboard | `/dashboard` | `GET /transactions`, `GET /budgets` | ✅ Wired |
| Expenses | `/expenses` | `GET/POST/PUT/DELETE /transactions` | ✅ Full CRUD |
| Budgets | `/budgets` | `GET /budgets`, `GET /goals` | ✅ Wired |
| Portfolio | `/portfolio` | `GET /portfolios` | ✅ Wired |
| Tax Assistant | `/tax` | — (client-side calculator) | ✅ Complete |
| Fraud Detection | `/fraud` | `GET /alerts`, `PUT /alerts/:id` | ✅ Wired |
| AI Assistant | `/assistant` | `GET /chat`, `POST /chat` | ✅ Wired |
| Reports | `/reports` | — (UI templates only) | ✅ UI Complete |

### Key Frontend Files

| File | Purpose |
|---|---|
| `src/lib/api.ts` | Axios client — auto-attaches JWT, points to `localhost:3001` |
| `src/store/auth.store.ts` | Zustand auth store with `persist` + hydration tracking |
| `src/lib/constants.ts` | Nav items, categories, chart colors, chat suggestions |
| `src/lib/utils.ts` | Currency formatting, date utils, P&L helpers |
| `src/types/index.ts` | Frontend TypeScript interfaces |

---

## ⚠️ Important Notes for Frontend Developers

1. **No Mock Data:** The file `src/lib/mock-data.ts` has been **deleted**. All pages fetch real data from the backend API.

2. **Empty States:** Every page handles the "zero data" scenario gracefully — new users see helpful empty state messages instead of broken charts.

3. **Hydration Safety:** All dashboard pages use `_hasHydrated` from the auth store before making API calls. This prevents token-less requests during Next.js hydration.

4. **API Error Handling:** The API interceptor does NOT auto-logout on 401 errors. Each page handles errors in its own `try/catch` block.

5. **Port Configuration:**
   - Frontend runs on **port 3000**
   - Backend runs on **port 3001**
   - Google OAuth callback redirects to `localhost:3000/login?token=...`
