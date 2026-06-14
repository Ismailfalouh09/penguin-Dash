# Penguin Beauty Admin Dashboard

Admin dashboard frontend for the beauty-pack recommendation system. Built on React, Vite, TypeScript, and shadcn/ui.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on `src/` |
| `npm run format` | Format `src/` with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm test` | Run all tests (single run) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
VITE_API_BASE_URL=http://localhost:3000    # Backend API base URL
VITE_APP_NAME=Penguin Beauty Admin         # Application display name
VITE_ENABLE_QUERY_DEVTOOLS=true           # Show TanStack Query Devtools
```

Never commit `.env`. All environment access goes through `src/config/env.ts`.

## Backend Contract

The backend OpenAPI contract lives in `frontend-handoff/`:

- `frontend-handoff/openapi.json` — Full API specification (source of truth)
- `frontend-handoff/FRONTEND_HANDOFF.md` — Integration guide
- `frontend-handoff/PAGE_ENDPOINT_MAPPING.md` — Page-to-endpoint mapping
- `frontend-handoff/ROLE_PERMISSION_MATRIX.md` — OWNER / ADMIN / STAFF permissions

## Stack

- **React 19** + **Vite 8** + **TypeScript 5** (strict)
- **React Router v7** — client-side routing
- **TanStack Query v5** — server state management
- **TanStack Table v8** — headless data tables
- **React Hook Form v7** + **Zod v3** — forms and validation
- **Tailwind CSS v3** + **shadcn/ui** — styling and components
- **Vitest v4** + **React Testing Library** + **MSW v2** — testing
- **ESLint v9** (flat config) + **Prettier v3** — code quality

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Project structure and patterns
- [Test Plan](docs/TEST_PLAN.md) — Testing strategy
- [Progress Log](docs/PROGRESS_LOG.md) — Task completion history
- [Frontend Roadmap](FRONTEND_ROADMAP.md) — Planned tasks 1–16
