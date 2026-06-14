# Architecture — Penguin Beauty Admin Dashboard

## Directory Structure

```
penguin-Dash/
├── frontend-handoff/            # Backend API contract (DO NOT MODIFY)
│   ├── openapi.json             # Primary API spec (source of truth)
│   ├── openapi.yaml             # Same spec in YAML
│   ├── FRONTEND_HANDOFF.md
│   ├── PAGE_ENDPOINT_MAPPING.md
│   ├── ROLE_PERMISSION_MATRIX.md
│   └── KNOWN_LIMITATIONS.md
├── src/
│   ├── app/                     # Bootstrap: wires everything together
│   │   ├── App.tsx              # Root component (Providers + RouterProvider)
│   │   ├── router.tsx           # Route config (`routes`) + browser router
│   │   └── providers.tsx        # QueryClient + CurrentUser providers
│   ├── config/
│   │   ├── env.ts               # Typed, Zod-validated env module (single source)
│   │   ├── routes.ts            # Central route path registry
│   │   ├── route-handle.ts      # RouteHandle type (title + breadcrumb)
│   │   └── navigation.ts        # Central nav config (groups, items, role filter)
│   ├── features/                # Feature modules
│   │   └── auth/                # Role model + placeholder current user (Task 2)
│   │       ├── roles.ts         # Role, Permission, matrix, helpers
│   │       ├── types.ts         # AdminUser UI type
│   │       └── current-user.tsx # CurrentUserProvider + useCurrentUser
│   ├── pages/                   # Route-level page components
│   │   ├── DashboardOverviewPage.tsx
│   │   ├── LoginPlaceholderPage.tsx
│   │   ├── ForbiddenPage.tsx / NotFoundPage.tsx
│   │   ├── _shared/ModulePlaceholder.tsx   # Shared placeholder scaffold
│   │   ├── catalog/            # Categories, Brands, Products(+detail/form/refs), Packs, Media
│   │   ├── personalization/    # Attributes, Quiz, Recommendation rules
│   │   ├── sales/              # Orders (+ detail)
│   │   └── account/           # Profile
│   ├── shared/                  # Cross-feature code
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui generated components
│   │   │   ├── layout/         # Shell: DashboardLayout, Sidebar, Header, etc.
│   │   │   └── common/         # App building blocks + page states
│   │   ├── hooks/             # Shared hooks (use-media-query)
│   │   └── lib/utils.ts        # cn() Tailwind class utility
│   ├── styles/globals.css       # Design tokens + Tailwind directives
│   ├── test/
│   │   ├── setup.ts            # jest-dom + MSW server lifecycle
│   │   ├── utils/render.tsx     # Render with QueryClient + CurrentUser + Router
│   │   ├── utils/router.tsx     # Render real routes via memory data router
│   │   └── mocks/             # MSW server + handlers
│   ├── main.tsx                 # Application entry point
│   └── vite-env.d.ts            # Vite client type reference
├── docs/
│   ├── ARCHITECTURE.md          # This file
│   ├── DASHBOARD_CONCEPTION.md  # Sitemap, routes, navigation, role rules
│   ├── DESIGN_SYSTEM.md         # Tokens, typography, components, states
│   ├── PROGRESS_LOG.md          # Task completion history
│   └── TEST_PLAN.md             # Testing strategy
├── public/                      # Static assets
├── AGENTS.md                    # Claude Code instructions
├── PROJECT_BRIEF.md             # Product and domain context
├── FRONTEND_ROADMAP.md          # Tasks 1–16 plan
└── README.md                    # Setup and commands
```

## Key Patterns

### 1. Centralized Environment Access (`src/config/env.ts`)

All `import.meta.env` access is isolated to this one module. It validates the environment at startup using Zod and throws a clear error if variables are missing or malformed. Components import from `@/config/env`, never from `import.meta.env` directly.

### 2. Feature Module Pattern (`src/features/<name>/`)

Each dashboard feature (auth, products, categories, etc.) is a self-contained module:
- `components/` — UI components specific to this feature
- `hooks/` — React Query hooks for data fetching
- `api.ts` — API call definitions (will use generated OpenAPI client)

This pattern keeps related code together and makes features independently replaceable.

### 3. shadcn/ui Components (`src/shared/components/ui/`)

shadcn/ui components are generated source files (not a package import). They live in `src/shared/components/ui/` and are copied verbatim from the shadcn CLI. Never edit generated component internals — create wrapper components instead.

Add new components with:
```bash
npx shadcn@latest add <component>
```

### 4. Custom Test Render (`src/test/utils/`)

Component tests use `render` from `src/test/utils/render.tsx`, which wraps the
tree in:
- `QueryClientProvider` (retry disabled)
- `CurrentUserProvider` (role configurable via the `role` option — drives
  permission-gated UI in tests)
- `MemoryRouter` (configurable initial entries)

Route-level tests use `renderWithRouter` from `src/test/utils/router.tsx`, which
mounts the real `routes` through a `createMemoryRouter` data router so
data-router hooks (`useMatches`, `Outlet`) work.

### 5. MSW for API Mocking

MSW (Mock Service Worker) intercepts network requests in tests via a Node.js server. Handlers are registered in `src/test/mocks/handlers.ts`. The server is configured with `onUnhandledRequest: 'error'` so accidental network calls in tests fail loudly.

### 6. Application Shell (`src/shared/components/layout/`)

`DashboardLayout` is the parent route element for the entire authenticated area.
It composes:

- `Sidebar` — persistent desktop navigation (`≥ lg`), collapsible to an icon
  rail; collapse state persisted in `localStorage`.
- `MobileNav` — a Radix `Sheet` drawer for `< lg`, opened from the header.
- `Header` — sticky top bar with the drawer/collapse triggers, breadcrumbs, and
  the user menu.
- `Breadcrumbs` — derived from matched routes' `handle.breadcrumb` via
  `useMatches()`.
- `<Outlet />` — the routed page, inside a focusable `#main-content` target with
  a skip-to-content link.

`SidebarNav` is rendered by both the desktop sidebar and the mobile drawer, so
there is a single source of nav rendering.

### 7. Central Navigation Config (`src/config/navigation.ts`)

All sidebar items are declared once as ordered `NavGroup[]`. Nothing hardcodes
nav items in components. `getNavigationForRole(role)` filters items by their
`requiredPermission` and drops empty groups, so navigation is role-aware and
testable. Route paths come from `src/config/routes.ts`; titles/breadcrumbs come
from each route's `handle` (`src/config/route-handle.ts`).

### 8. Role-Aware UI Strategy (`src/features/auth/`)

`roles.ts` mirrors the backend permission matrix as coarse capabilities
(`read`, `write`, `media:manage`, `orders:update-status`,
`recommendations:preview`). The current user flows through `CurrentUserProvider`
/ `useCurrentUser`; in Task 2 it returns an obvious **placeholder** OWNER and
will be swapped for `GET /auth/me` in Task 3.

UI gating uses `<PermissionGuard permission=… roles=…>` to hide actions the user
cannot perform. This is **usability only** — the backend stays authoritative.
Because all roles can `read` every page, navigation is identical across roles
today; the split appears on write actions (hidden for STAFF).

### 9. Shared State Patterns

- **Server state** → TanStack Query (configured in `providers.tsx`); business
  hooks arrive with the features that need them.
- **Current user** → React context (`CurrentUserProvider`), a single source the
  whole shell reads from.
- **Local UI state** (sidebar collapsed, drawer open) → component `useState`,
  persisted to `localStorage` where it should survive reloads.
- **Route metadata** (title, breadcrumb) → route `handle`, read via `useMatches`.

## Future: OpenAPI Client Generation (Task 14)

The `frontend-handoff/openapi.json` will be used to generate a typed API client. The generated client will be placed in `src/shared/lib/api-client/` (or similar) and consumed by feature hooks. Manual API call code should be minimized before then.

## TypeScript Configuration

Strict mode is enforced:
- `strict: true` — all strict checks enabled
- `noUncheckedIndexedAccess: true` — array/object accesses return `T | undefined`
- `noUnusedLocals / noUnusedParameters: true` — dead code caught at compile time

Path alias `@/*` maps to `src/*` in both TypeScript and Vite.
