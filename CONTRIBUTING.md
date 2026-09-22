# Contributing to AI Finance Copilot

## Getting Started

1. Clone the repository and run `npm install`
2. Start the dev environment: `.\start.ps1`
3. Make your changes on a feature branch
4. Test locally, then open a PR to `dev`

## Branch Naming

```
feature/<name>   — new features (e.g. feature/budget-modal)
fix/<name>       — bug fixes (e.g. fix/login-redirect)
```

## Commit Messages

Use clear, descriptive commit messages:
```
feat: add budget creation modal
fix: resolve login redirect loop
docs: update API endpoint table
```

## Key Rules

- **Never commit `.env` files** — they are in `.gitignore`
- **No mock data** — all pages must use real API calls
- **Test with a fresh account** — ensure empty states work for new users
- **Keep the backend on port 3001** and frontend on port **3000**

## Project Structure

| What | Where |
|---|---|
| Frontend pages | `apps/web/src/app/` |
| Frontend components | `apps/web/src/components/` |
| API client | `apps/web/src/lib/api.ts` |
| Auth store | `apps/web/src/store/auth.store.ts` |
| Backend modules | `apps/api/src/` |
| Database schema | `packages/database/prisma/schema.prisma` |

## Need Help?

- Read [WALKTHROUGH.md](./WALKTHROUGH.md) for the full API guide
- Read [TASKS.md](./TASKS.md) for current task status and TODOs
- Read [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the architecture overview
