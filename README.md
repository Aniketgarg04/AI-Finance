# 🚀 AI Finance Copilot

> A production-grade, AI-powered personal finance platform — built as a final-year BTech engineering project.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)](https://nestjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker)](https://www.docker.com/)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with hashed passwords + Google OAuth
- 💸 **Transaction Tracking** — Full CRUD: add, edit, delete, categorize expenses & income
- 📊 **Analytics Dashboard** — Real-time KPIs, balance trends, expense donut chart
- 🤖 **AI Finance Assistant** — Chat interface with conversation history persistence
- 🚨 **Fraud Detection** — View, resolve, and track suspicious activity alerts
- 📈 **Portfolio Tracker** — Track stocks & assets with P&L calculations
- 🇮🇳 **Tax Assistant** — India-focused tax estimation (Old vs New Regime calculator)
- 💰 **Smart Budgeting** — Category-based budget limits + savings goals tracker
- 📄 **Reports & Export** — Downloadable financial reports (PDF/CSV)

---

## 🏗️ Folder Structure

```
ai-finance-copilot/
├── apps/
│   ├── web/              # 🌐 Next.js 15 Frontend  (Port 3000)
│   ├── api/              # ⚙️ NestJS Backend API    (Port 3001)
│   └── ml-service/       # 🧠 Python FastAPI ML     (Port 8000)
├── packages/
│   └── database/         # 🗄️ Prisma schema & client (shared)
├── docker-compose.yml    # 🐳 PostgreSQL + Redis
├── start.ps1             # ▶️ One-click startup script (Windows)
├── stop.ps1              # ⏹️ One-click stop script
└── README.md
```

---

## 👥 Team & Ownership

| Service | Directory | Owner |
|---|---|---|
| Frontend (Next.js) | `apps/web/` | — |
| Backend API (NestJS) | `apps/api/` | — |
| ML Service (FastAPI) | `apps/ml-service/` | — |
| Database Schema (Prisma) | `packages/database/` | Shared |

---

## ⚡ Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | >= 20.x | https://nodejs.org |
| npm | >= 10.x | (bundled with Node) |
| Docker Desktop | Latest | https://docker.com |
| Git | Latest | https://git-scm.com |

---

## 🛠️ Quick Start (One Command)

The easiest way to start everything:

```powershell
# From the project root:
.\start.ps1
```

This script automatically:
1. Starts Docker Desktop (if not running)
2. Spins up the PostgreSQL database container
3. Runs Prisma migrations to sync the schema
4. Kills any stale processes on ports 3000/3001
5. Opens two terminal windows for the backend & frontend

To stop everything:
```powershell
.\stop.ps1
```

---

## 🛠️ Manual Setup (Step-by-Step)

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/ai-finance-copilot.git
cd ai-finance-copilot
npm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

> **⚠️ Never commit `.env` files.** They are in `.gitignore`.

### 3. Start the database

```bash
docker compose up -d
```
> Starts **PostgreSQL** on port `5432` and **Redis** on port `6379`.

### 4. Apply the database schema

```bash
npm run db:push
```

### 5. Start dev servers

```bash
# Terminal 1 — Backend API
npm run dev:api

# Terminal 2 — Frontend
npm run dev:web
```

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:3001 |

---

## 🧩 npm Scripts Reference

| Script | Description |
|---|---|
| `npm install` | Install all workspace dependencies |
| `npm run dev:web` | Start Next.js frontend (port 3000) |
| `npm run dev:api` | Start NestJS backend (port 3001) |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run build:web` | Build frontend for production |
| `npm run build:api` | Build backend for production |
| `npm run lint` | Lint both frontend and backend |

---

## 🌿 Branching Strategy

```
main           — always stable, production-ready
dev            — integration branch for all feature branches
feature/<name> — your work (e.g. feature/dashboard-ui)
fix/<name>     — bug fixes (e.g. fix/login-error)
```

**Workflow:**
1. Branch off `dev`: `git checkout -b feature/your-feature dev`
2. Make your changes and commit clearly.
3. Open a PR from your branch → `dev`.
4. `main` is only updated when `dev` is stable.

---

## 🐳 Database (Docker)

| Variable | Default |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `aifinancedb` |
| User | `admin` |
| Password | `password` |

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before making any changes.

For API details, see [WALKTHROUGH.md](./WALKTHROUGH.md).
## 🚀 Future Roadmap (Couchbase Integration)

As part of the continuous evolution of this platform, the following architectural upgrades are planned:
- **Migration to Couchbase Capella**: Transitioning the primary datastore from PostgreSQL to Couchbase to leverage its flexible JSON document model for dynamic financial records.
- **High-Performance Caching**: Utilizing Couchbase's built-in memory-first architecture to replace the standalone Redis instance, reducing infrastructure complexity while boosting dashboard query speeds.
- **Full-Text Search (FTS)**: Implementing Couchbase FTS to allow users to perform ultra-fast, natural language searches across thousands of their past transactions and AI chat histories.

---

## 📄 License

MIT
