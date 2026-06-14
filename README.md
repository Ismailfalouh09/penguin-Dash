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

## Current status

- **Task 1 — Foundation**: ✅ tooling, strict TS, router, query, Tailwind, shadcn, testing.
- **Task 2 — Conception & design system**: ✅ responsive dashboard shell, central
  navigation config, design tokens, shared UI/page states, placeholder pages.
- **Task 3 — API integration foundation**: ✅ Orval-generated typed client +
  TanStack Query hooks, one central HTTP client, error normalization, dev
  diagnostics, MSW foundation.
- **Task 4 — Authentication**: ✅ login page, JWT storage (sessionStorage), session
  restoration via `GET /auth/me`, Bearer-header injection, protected and guest
  routes, requested-route redirect, role guards, `401`/`403` handling, logout +
  query-cache cleanup. No refresh-token flow (single access token only).
- **Task 5 — Shared operational components**: ✅ generic data table (TanStack Table
  v8, server-side sort/pagination/filtering, loading/empty/error states, row
  selection, row actions), pagination control, search/filter toolbar, URL
  query-state hook, form-layout components (RHF wiring, field errors, required
  indication, submit loading), confirmation and delete dialogs, toast notification
  system, `ForbiddenState` inline component, pagination types matching the backend
  envelope. A dev-only demo at `/components-demo` exercises all components.
- **Task 6 — Categories & Brands**: ✅ list, create, edit, deactivate, image
  upload/remove for categories; list, create, edit, deactivate for brands. Both
  modules reuse the Task 5 shared component layer (data table, pagination, search,
  filters, form layout, confirmation dialogs, toasts, URL state). Brand logo
  upload is not in scope (no backend contract for it).
- **Task 7 — Products**: ✅ product list (search, status/isActive filters,
  server-side sort/pagination), product detail view (info, pricing, cover + gallery,
  references summary), product create/edit form (category + brand selection, slug
  auto-generation, pricing, status, isActive), cover image upload/replace/remove,
  gallery image upload/delete/promote-to-cover, product archive (cascades to
  references on the backend). Product references and stock management are deferred
  to Task 8.
- **Task 8 — Product References & Stock**: ⏳ next.

The full authentication system is live. Every route behind `/` requires a valid
admin session; unauthenticated visitors are sent to `/login` with the original
destination preserved for redirect after sign-in. The shared component layer is
used by all CRUD feature tasks (6–14).

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
| `npm run api:generate` | Regenerate the typed API client from the OpenAPI contract |
| `npm run api:check` | Fail if the generated client is out of sync with the contract |

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
- **Orval** — typed API client + query hooks generated from OpenAPI
- **React Hook Form v7** + **Zod v3** — forms and validation
- **Tailwind CSS v3** + **shadcn/ui** — styling and components
- **Vitest v4** + **React Testing Library** + **MSW v2** — testing
- **ESLint v9** (flat config) + **Prettier v3** — code quality

## API integration

All backend calls go through one generated, typed client. See
[docs/API_INTEGRATION.md](docs/API_INTEGRATION.md). Regenerate after a contract
change with `npm run api:generate`. Generated code lives in
`src/lib/api/generated/` and must never be hand-edited.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Project structure, shell, and patterns
- [API Integration](docs/API_INTEGRATION.md) — Generated client, HTTP client, errors, query
- [Dashboard Conception](docs/DASHBOARD_CONCEPTION.md) — Sitemap, routes, navigation, role rules
- [Design System](docs/DESIGN_SYSTEM.md) — Tokens, typography, components, states
- [Test Plan](docs/TEST_PLAN.md) — Testing strategy
- [Progress Log](docs/PROGRESS_LOG.md) — Task completion history
- [Frontend Roadmap](FRONTEND_ROADMAP.md) — Planned tasks 1–16
