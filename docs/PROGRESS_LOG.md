# Progress Log

## Task 5 — Shared Operational Components

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

Built the reusable component and hook layer that all CRUD feature tasks (6–14) will consume. No business entities were touched; no backend API calls were added.

**Data table system** (`src/shared/components/data-table/`):
- `DataTable<TData>` — TanStack Table v8 in manual (server-driven) mode. Accepts `columns`, `data`, `sort` (controlled server sort), optional `rowSelection`/`onRowSelectionChange`, `onRowClick`, and renders inline loading (`SkeletonTable`), empty (`EmptyState`) and error (`ErrorState`) states. Responsive via `overflow-x-auto`. Row selection column via `selectionColumn<T>()`.
- `DataTablePagination` — shows range text ("Showing X–Y of Z"), page-size `<Select>`, prev/next + numbered pages with ellipsis; all derived from `PaginationMeta`; no internal state.
- `DataTableToolbar` — composable toolbar with search/filters left, actions right, shared "Clear filters" button.
- `SearchInput` — debounced (300 ms default), local draft for snappy typing, syncs with external value changes; clear button.
- `SelectFilter` — generic single-select filter; null = no filter (ALL sentinel for Radix compatibility).
- `DateFilter` — native `<input type="date">`, keyboard/a11y friendly, zero new deps.
- `RowActions` — labeled dropdown trigger (never icon-only), supports destructive items, separators, stopPropagation.
- `SkeletonTable` — skeleton placeholder shaped like the real table; announces busy state.

**Pagination types** (`src/shared/lib/pagination.ts`):
- `PaginationMeta` — mirrors the backend envelope (`page`, `pageSize`, `totalItems`, `totalPages`, `hasNextPage`, `hasPreviousPage`).
- `buildPaginationMeta`, `describePageRange`, `DEFAULT_PAGE_SIZE_OPTIONS`.

**URL query state** (`src/shared/hooks/use-list-query-state.ts`):
- `useListQueryState(options?)` — single source for parsing/serializing `page`, `limit`, `search`, `sortBy`, `sortOrder`, and arbitrary feature filters. URL is the source of truth; browser back/forward restores state. Invalid values fall back safely. `page=1` and default limit pruned from URL. All setters except `setPage` reset to page 1. `setSort(col)` toggles asc/desc when the column is already active.

**UI primitives** (`src/shared/components/ui/`):
- `table.tsx` — shadcn-style `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`/`TableCaption`.
- `checkbox.tsx` — accessible checkbox on a native input (no new Radix dep); supports `indeterminate` state for select-all.
- `form.tsx` — React Hook Form field wiring: `Form`, `FormField`, `FormItem`, `FormLabel` (required `*`), `FormControl`, `FormDescription`, `FormMessage`. A11y `aria-describedby`/`aria-invalid` wired automatically.
- `toast.tsx` — lightweight context-based toast system (`ToastProvider`, viewport, `ToastItem`); tones: default, success, error, warning, info; auto-dismiss; accessible (`role="region"`, `role="status"`, `aria-live`). No external dep (no Sonner).

**Form layout** (`src/shared/components/forms/`):
- `FormLayout` — max-width-constrained single-column form container.
- `FormSection` — renders a `SectionCard` wrapping a vertical field stack.
- `FormActions` — submit (with `Loader2` spinner), cancel (optional), secondary slot; stacks on mobile.

**Feedback** (`src/shared/components/feedback/`):
- `ConfirmDialog` — accessible `AlertDialog`, `isPending` keeps dialog open during async confirm.
- `DeleteConfirmDialog` — specialises with delete/archive copy and destructive confirm button.

**Hooks**:
- `use-toast.ts` — `useToast()`, throws if used outside `ToastProvider`.
- `use-confirm-dialog.ts` — `useConfirmDialog<T>()`, manages open + target.
- `use-debounced-value.ts` — `useDebouncedValue(value, delay)`.
- `use-unsaved-changes-warning.ts` — `useUnsavedChangesWarning(when)`, wires `beforeunload`.

**Query-state helpers** (`src/lib/api/query-state.ts`):
- `resolveQueryViewState` — collapses query flags to `'loading' | 'error' | 'empty' | 'ready'`.
- `toErrorMessage` / `toApiError` — normalize thrown values.
- `useMutationFeedback` — composes `onSuccess`/`onError` handlers with toasts; spread into `useMutation`.

**Common components** (`src/shared/components/common/`):
- Added `ForbiddenState` — inline "access denied" state for embedding inside a page section (distinct from the full-page `ForbiddenPage`).

**Providers**:
- `ToastProvider` added inside `QueryClientProvider`, wrapping `AuthProvider`, so mutation feedback hooks can raise toasts from anywhere.

**Demo page**:
- `src/pages/ComponentsDemoPage.tsx` — dev-only at `/components-demo` (not in sidebar). Static sample data (labeled non-production). Exercises table, pagination, search, status filter, column sorting, row selection, row actions, empty state, delete confirmation dialog, success/error toasts, and form layout with field errors.

### Results

- **Build**: `npm run build` green — 1 888 modules, 0 type errors.
- **Lint**: 0 errors; 1 pre-existing `react-refresh/only-export-components` warning in `form.tsx` (inherent to the shadcn RHF pattern; same as other ui/ files).
- **Tests**: 90 passed / 0 failed (16 test files) — no regressions.
- No business CRUD pages added. Generated API files unchanged. `.env` not staged. `frontend-handoff/` not modified.

### Key Decisions

- **URL = source of truth for list state**: `useListQueryState` is the only URL parser; components never call `useSearchParams` themselves.
- **No Sonner**: built a lightweight context-based toast (100 lines) rather than adding a new dependency; same behavior, same API surface.
- **No Radix Checkbox**: native `<input type="checkbox">` with visually-hidden appearance and Tailwind peer styling; supports `indeterminate` via a ref effect; no new dep.
- **Manual (server-driven) table throughout**: `DataTable` does zero client-side sorting/filtering/pagination, so it works equally against any real backend list endpoint.
- **`ConfirmDialog` stays open during async**: `preventDefault` on the action button + `isPending` prop prevent auto-close; the caller controls closure on completion.
- **`useMutationFeedback` uses `...args` spread**: TanStack Query v5's mutation callbacks changed to 4-argument signatures; spread avoids the TS arity error without casting.
- **Demo uses clearly labeled static data**: no fake production entities, no backend calls, not in the sidebar.

---

## Task 4 — Authentication

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

- Replaced the Task 2 placeholder current-user with a full authentication system
  built entirely in `src/features/auth/`.
- Built **token storage** (`token-storage.ts`): `sessionStorage`-backed
  `getStoredToken` / `setStoredToken` / `clearStoredToken`. Tab-scoped, handles
  SSR and privacy-mode gracefully. Token is never logged, never in a URL.
- Built the **Bearer-header interceptor** (`auth-interceptor.ts`): calls
  `registerRequestInterceptor` on the single HTTP client; reads the token at
  request time so login/logout take effect immediately without re-installing.
- Built the **global 401 event bus** (`auth-events.ts`): a module-level handler
  registry that lets the `QueryClient` (which lives outside React) trigger an
  auth teardown without importing React or the context directly.
- Updated the **QueryClient** (`query-client.ts`): added global `QueryCache` and
  `MutationCache` error handlers that call `notifyUnauthorized()` on any 401.
  403 is intentionally ignored — the session is valid; the UI handles it locally.
- Built **`AuthProvider`** (`AuthProvider.tsx`): installs the interceptor once,
  restores a stored session on startup via `GET /auth/me` (or discards an
  invalid/expired token), exposes `login` (POST → store token → GET /auth/me) and
  `logout` (clear token, set `admin = null`, flush the query cache). Registers the
  global 401 handler to the same teardown as manual logout.
- Built **`useAuth`** (`use-auth.ts`): typed accessor for `AuthContext`.
- Built **`ProtectedRoute`** (`ProtectedRoute.tsx`): shows a full-page loader
  while the session is being restored; redirects unauthenticated users to `/login`
  with `state.from` preserved; renders `<CurrentUserProvider>` + `<Outlet />`
  for authenticated users.
- Built **`GuestRoute`** (`GuestRoute.tsx`): prevents authenticated admins from
  landing on `/login`; redirects to `state.from` (the originally requested route)
  or `/dashboard` after login.
- Built **`RoleGuard`** (`RoleGuard.tsx`): route-level authorization redirect to
  `/forbidden` for authenticated users lacking the required role or permission.
  Can wrap a route branch (via `<Outlet />`) or a single element (via `children`).
- Built the **login page** (`src/pages/LoginPage.tsx`): React Hook Form + Zod
  (`login-schema.ts`), delegates to `useAuth().login`, shows a `401` "Incorrect
  email or password" message or a generic API error message; navigation is handled
  by `GuestRoute` on session change.
- Built `FullPageLoader` (`src/shared/components/common/FullPageLoader.tsx`): a
  centred spinner used by `ProtectedRoute` and `GuestRoute` during session restore.
- Updated **`CurrentUserProvider`** (`current-user.tsx`): added a real
  `ProviderFromAuth` path that reads the signed-in admin from `useAuth()` (used in
  the app); the explicit-user override path (used in tests and previews) is
  preserved unchanged.
- Updated **`UserMenu`** (`UserMenu.tsx`): now calls `useAuth().logout` + navigates
  to `/login` on sign-out instead of being a static placeholder.
- Updated **`ProfilePage`** (`ProfilePage.tsx`): shows real admin data from
  `useCurrentUser()` instead of placeholder text.
- Removed `src/pages/LoginPlaceholderPage.tsx` (replaced by the real login page).
- Wired the router (`router.tsx`) with `GuestRoute` wrapping `/login` and
  `ProtectedRoute` wrapping all authenticated routes. `providers.tsx` replaced
  `CurrentUserProvider` with `AuthProvider`.
- Updated test utilities (`render.tsx`, `router.tsx`) to stub `AuthContext`
  directly so tests never depend on a real token or API call. Added
  `unauthenticated` option to `renderWithRouter` for guest-session tests.
- Updated the login route test (`App.test.tsx`) to verify the real login form
  instead of the removed design-preview placeholder.
- **Test result**: 90 tests, 90 passed, 0 failed (all 16 test files passing).
- **Build**: TypeScript + Vite production build clean, 0 type errors.
- **Lint**: 0 errors, 3 pre-existing shadcn/ui fast-refresh warnings (unchanged).

### Key Decisions

- **`sessionStorage` over `localStorage`**: tab-scoped, cleared on tab close —
  safer default for an admin tool. No "remember me" requirement.
- **No refresh-token flow**: the backend issues a single access token with no
  refresh endpoint in the current OpenAPI contract. When the token expires, a 401
  on any request tears down the session and redirects to `/login`.
- **Interceptor reads token at request time**: avoids stale captures; login and
  logout take effect for the very next request without re-registering.
- **`AuthContext` stubbed in tests**: both `render` and `renderWithRouter` supply a
  pre-built `AuthContextValue`; no `AuthProvider` boot cycle runs in tests, so
  tests are fast and deterministic.
- **`CurrentUserProvider` only inside `ProtectedRoute`**: keeps the "guaranteed
  non-null admin" invariant in the type system rather than null-checking everywhere.
- **403 not handled globally**: a Forbidden response means the session is valid;
  only the requesting feature or route handles it (e.g. `RoleGuard → /forbidden`).

---

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
