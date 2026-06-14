# Progress Log

## Task 3 — Backend API Integration Foundation

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

- Verified the OpenAPI contract (`frontend-handoff/openapi.json`): OpenAPI 3.0.0,
  `bearer` JWT security scheme, 50 paths / 23 tags / 69 schemas, a real
  `ApiErrorResponse` envelope, and a public `GET /` health endpoint.
- Added **Orval** (`orval.config.ts`) generating a typed client + TanStack Query
  hooks into `src/lib/api/generated/` (239 files: per-tag endpoints + a models
  barrel). GET → `useQuery`, writes → `useMutation`. Output is deterministic.
- Built one central **HTTP client** (`src/lib/api/http-client.ts`) as Orval's
  fetch mutator: env-resolved base URL, JSON + multipart bodies, `AbortSignal`
  cancellation, and a request-interceptor registry as the Task 4 auth hook. No
  token injection added.
- Built **error normalization** (`src/lib/api/errors.ts`): `ApiError` model +
  `normalizeApiError`, `getApiErrorMessage`, `isUnauthorizedError`,
  `isForbiddenError`, `isNotFoundError`, `isValidationError`, `isNetworkError`.
- Centralized the **QueryClient** (`src/lib/api/query-client.ts`): no-retry on
  4xx, limited retry on network/5xx, no mutation retry; wired into providers.
- Added `apiBaseUrl` to the typed env module (normalized, trailing slash removed).
- Added a **dev-only diagnostics** page at `/diagnostics` showing config +
  contract metadata + an on-demand health probe (not in the sidebar).
- Extended the **MSW** foundation (`apiUrl` helper) for API-layer tests.
- Added scripts `api:generate` and `api:check`; isolated generated code from
  ESLint/Prettier and pinned LF via `.gitattributes`.
- Wrote 35 API tests (HTTP client, error normalization, query integration,
  generated exports, diagnostics) — 90 tests total passing.
- Verified lint, format:check, test, build, `api:generate`, determinism, and a
  browser check of the shell + diagnostics. OpenAPI source files unchanged.

### Key Decisions

- **Orval + custom fetch mutator** (no Axios) → a single HTTP client, native
  cancellation/multipart, and zero hand-written DTOs.
- **Generated wrapper** (`{ status, data, headers }`) is the Orval fetch-client
  standard; consumers read `response.data`.
- **No auth this task** — only a documented interceptor extension point for
  Task 4 Bearer injection.
- Generated code is isolated, deterministic, and never linted/edited by hand.

---

## Task 2 — Dashboard Conception & Design System

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

- Defined the information architecture: sitemap, route map, navigation hierarchy,
  and role visibility rules (`docs/DASHBOARD_CONCEPTION.md`).
- Established the design system — warm, professional beauty-admin palette with
  semantic status tokens, typography, spacing, radius, soft shadow scale, and
  responsive/accessibility rules (`docs/DESIGN_SYSTEM.md`, `globals.css`,
  `tailwind.config.ts`).
- Added 15 shadcn/ui components (dropdown-menu, sheet, avatar, breadcrumb, badge,
  separator, skeleton, tooltip, dialog, alert-dialog, input, select, tabs, label,
  scroll-area).
- Centralized navigation in `src/config/navigation.ts` with route constants
  (`routes.ts`) and route handles (`route-handle.ts`); role-aware filtering.
- Built the role/permission model and a **placeholder** current-user context
  (`src/features/auth/`) — clearly marked, to be replaced by `/auth/me` in Task 3.
- Built the responsive application shell: collapsible desktop sidebar, mobile
  Sheet drawer, sticky header, breadcrumbs, user menu, skip-to-content link.
- Built shared app components & page states: `AppLogo`, `PageContainer`,
  `PageHeader`, `SectionCard`, `StatusBadge`, `EmptyState`, `ErrorState`,
  `LoadingState`, `ComingSoonState`, `DesignPreview`, `PermissionGuard`.
- Created placeholder pages for every module + dashboard overview, login (design
  preview), forbidden (403), and a shell-aware not-found (404). No fake data.
- Wired the full route map (`/login`, `/dashboard`, catalog/personalization/
  sales/account routes, `/forbidden`, `*`) with titles & breadcrumbs.
- Added 40+ tests (roles, navigation filter, permission gating, page states,
  sidebar nav, shell behavior, route integration) — 55 tests total passing.
- Verified lint, format:check, test, build all pass; browser-verified the shell.
- Updated `ARCHITECTURE.md`, `README.md`, `FRONTEND_ROADMAP.md`; added
  `DASHBOARD_CONCEPTION.md` and `DESIGN_SYSTEM.md`.

### Key Decisions

- **Conception/shell before auth**: built the shell and design system first
  (prerequisites for every screen); authentication moved to Task 3.
- **Central navigation config** — single source for sidebar + mobile drawer; no
  hardcoded nav items.
- **Role-aware UI via `PermissionGuard`** — hides write actions for STAFF for
  usability; backend stays authoritative. All roles can read every page, so
  navigation is identical across roles today.
- **Placeholder current user via context** — swappable for `GET /auth/me` in
  Task 3 without touching the shell.
- **Routes exported as config** so tests run the real route tree through a memory
  data router.
- **No invented analytics** — overview metrics render as planned placeholders.

---

## Task 1 — Frontend Foundation

**Date:** 2026-06-14  
**Status:** Completed

### What Was Done

- Initialized Git repository
- Created Vite 8 + React 19 + TypeScript 5 (strict mode) project
- Installed and configured all foundation dependencies (zero vulnerabilities)
- Configured Tailwind CSS v3 with shadcn/ui CSS variable theme
- Installed shadcn/ui Button, Card, and Alert components
- Created `components.json` for shadcn CLI configuration
- Configured ESLint v9 (flat config) with TypeScript and React Hooks rules
- Configured Prettier v3 with tailwind class sorting
- Created typed, Zod-validated environment config module (`src/config/env.ts`)
- Set up React Router v7 with `createBrowserRouter`
- Set up TanStack Query v5 provider with optional DevTools
- Created HomePage (stack confirmation) and NotFoundPage
- Configured Vitest v4 with jsdom and React Testing Library
- Set up MSW v2 Node server for test isolation
- Created custom test render utility with QueryClient + MemoryRouter
- Wrote 15+ passing tests covering all foundation concerns
- Passed all verification commands: lint, format:check, test, build
- Created all documentation (README, AGENTS.md, PROJECT_BRIEF.md, FRONTEND_ROADMAP.md, docs/)
- Created `frontend-handoff/README.md` pointer file
- Created initial git commit

### Key Decisions

- **Vite 8** over Vite 6 to fix esbuild security vulnerability (GHSA-gv7w-rqvm-qjhr)
- **Tailwind v3** (not v4) for stable shadcn/ui compatibility
- **Zod v3** (not v4) as resolved by npm
- **Feature-oriented** structure with `src/features/` extension point
- **Single env module** at `src/config/env.ts` — no scattered `import.meta.env` access
- **Custom test render** utility to DRY up QueryClient + Router setup in tests
