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
│   │   └── providers.tsx        # QueryClient + AuthProvider
│   ├── config/
│   │   ├── env.ts               # Typed, Zod-validated env module (single source)
│   │   ├── routes.ts            # Central route path registry
│   │   ├── route-handle.ts      # RouteHandle type (title + breadcrumb)
│   │   └── navigation.ts        # Central nav config (groups, items, role filter)
│   ├── features/                # Feature modules
│   │   ├── auth/                # Full authentication system (Task 4)
│   │   ├── categories/          # Category CRUD + image upload (Task 6)
│   │   │   ├── components/      # CategoryForm, CategoryColumns, CategoryImageUpload
│   │   │   └── hooks/           # use-categories.ts (list/detail/create/update/deactivate/image)
│   │   └── brands/              # Brand CRUD (Task 6)
│   │       ├── components/      # BrandForm, BrandColumns
│   │       └── hooks/           # use-brands.ts (list/detail/create/update/deactivate)
│   │       ├── roles.ts         # Role, Permission, matrix, helpers
│   │       ├── types.ts         # AdminUser UI type + fromCurrentAdmin mapper
│   │       ├── auth-context.ts  # AuthContext + AuthContextValue + AuthStatus
│   │       ├── auth-events.ts   # Global 401 handler registry (decoupled from React)
│   │       ├── auth-interceptor.ts # Bearer-header request interceptor
│   │       ├── token-storage.ts # sessionStorage accessors (get/set/clear)
│   │       ├── login-schema.ts  # Zod schema for login form (email + password)
│   │       ├── AuthProvider.tsx # Session owner: login, logout, restore, 401 handler
│   │       ├── use-auth.ts      # useAuth() hook (reads AuthContext)
│   │       ├── current-user.tsx # CurrentUserProvider + useCurrentUser
│   │       ├── ProtectedRoute.tsx # Redirects unauthenticated users to /login
│   │       ├── GuestRoute.tsx   # Redirects authenticated users away from /login
│   │       └── RoleGuard.tsx    # Route-level role/permission redirect to /forbidden
│   ├── pages/                   # Route-level page components
│   │   ├── DashboardOverviewPage.tsx
│   │   ├── DiagnosticsPage.tsx          # Dev-only API diagnostics (/diagnostics)
│   │   ├── ComponentsDemoPage.tsx       # Dev-only shared-components demo (/components-demo)
│   │   ├── LoginPage.tsx                # Real login form (POST /auth/login)
│   │   ├── ForbiddenPage.tsx / NotFoundPage.tsx
│   │   ├── _shared/ModulePlaceholder.tsx   # Shared placeholder scaffold
│   │   ├── catalog/            # Categories (list/new/edit), Brands (list/new/edit),
│   │   │                       #   Products(+detail/form/refs), Packs, Media
│   │   ├── personalization/    # Attributes, Quiz, Recommendation rules
│   │   ├── sales/              # Orders (+ detail)
│   │   └── account/           # Profile
│   ├── lib/api/                 # API integration layer (Tasks 3–5)
│   │   ├── http-client.ts       # Single fetch client / Orval mutator
│   │   ├── errors.ts            # ApiError model + normalization helpers
│   │   ├── query-client.ts      # Shared QueryClient factory + retry policy
│   │   ├── query-state.ts       # Query-state helpers: resolveQueryViewState,
│   │   │                        #   useMutationFeedback, toErrorMessage (Task 5)
│   │   ├── contract-info.ts     # Static backend contract metadata
│   │   ├── index.ts            # Public API barrel (+ generated models)
│   │   └── generated/          # Orval output — DO NOT EDIT (models/ + endpoints/<tag>/)
│   ├── shared/                  # Cross-feature code
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui primitives + custom: table, checkbox,
│   │   │   │                   #   form (RHF), toast
│   │   │   ├── layout/         # Shell: DashboardLayout, Sidebar, Header, etc.
│   │   │   ├── common/         # App building blocks + page states + ForbiddenState
│   │   │   ├── data-table/     # Generic table system (Task 5): DataTable,
│   │   │   │                   #   DataTablePagination, DataTableToolbar, SearchInput,
│   │   │   │                   #   SelectFilter, DateFilter, RowActions, SkeletonTable,
│   │   │   │                   #   selectionColumn
│   │   │   ├── forms/          # Form layout (Task 5): FormLayout, FormSection,
│   │   │   │                   #   FormActions (+ re-exports RHF field primitives)
│   │   │   └── feedback/       # Dialogs (Task 5): ConfirmDialog, DeleteConfirmDialog
│   │   ├── hooks/              # Shared hooks: use-media-query, use-list-query-state,
│   │   │                       #   use-debounced-value, use-toast, use-confirm-dialog,
│   │   │                       #   use-unsaved-changes-warning
│   │   └── lib/
│   │       ├── utils.ts        # cn() Tailwind class utility
│   │       └── pagination.ts   # PaginationMeta type + helpers (matches backend envelope)
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

### 8. Authentication System (`src/features/auth/`)

**Session ownership** — `AuthProvider` owns the full auth lifecycle: installs the
Bearer interceptor once, restores a stored session via `GET /auth/me` on startup,
exposes `login` (POST /auth/login → store token → GET /auth/me) and `logout`
(clear token + clear query cache). It sits inside `QueryClientProvider` so it can
flush the cache on logout.

**Token storage** — The access token is kept in `sessionStorage` (scoped to the
browser tab; cleared when the tab closes). It is read at request time by the
interceptor, never logged, never embedded in URLs.

**Route protection** — `ProtectedRoute` blocks unauthenticated access and
redirects to `/login`, preserving the original destination in router state so
`GuestRoute` can redirect back after sign-in. `GuestRoute` prevents
already-signed-in admins from seeing the login form.

**Role gating** — `RoleGuard` redirects unauthorized but authenticated users to
`/forbidden`. `<PermissionGuard>` hides write actions inline (usability only;
backend stays authoritative). `roles.ts` mirrors the backend matrix.

**401 handling** — `QueryClient`'s global error handlers call `notifyUnauthorized`
on any 401. `AuthProvider` registers the handler so a stale token on any request
tears down the whole session and sends the admin back to `/login`. 403 is
intentionally left to feature-level handling (session is valid, just lacks permission).

**Current user** — `CurrentUserProvider` is rendered inside `ProtectedRoute`, so
it always has a real authenticated admin from `GET /auth/me`. Tests stub
`AuthContext` directly via `AuthContext.Provider` — no real API calls, no real
token.

### 9. Shared State Patterns

- **Server state** → TanStack Query (client built by `createQueryClient` in
  `src/lib/api/query-client.ts`); business hooks come from the generated client.
- **Current user** → React context (`CurrentUserProvider`), a single source the
  whole shell reads from.
- **Local UI state** (sidebar collapsed, drawer open) → component `useState`,
  persisted to `localStorage` where it should survive reloads.
- **Route metadata** (title, breadcrumb) → route `handle`, read via `useMatches`.

### 10. API Integration Layer (`src/lib/api/`)

The typed client is **generated by Orval** from `frontend-handoff/openapi.json`
into `src/lib/api/generated/` (isolated, never hand-edited). Every request flows
through one handwritten fetch client (`http-client.ts`, the Orval mutator), and
every failure is normalized to an `ApiError` (`errors.ts`). Components never
build backend URLs or call `fetch` directly; they use generated hooks
(`useQuery`/`useMutation`).

Bearer authentication is injected per-request via `src/features/auth/auth-interceptor.ts`
using the `registerRequestInterceptor` hook in `http-client.ts`. The generated
client and `http-client.ts` were not modified for auth — the interceptor extension
point was designed for this in Task 3. Full details: [API_INTEGRATION.md](API_INTEGRATION.md).

### 11. Shared Operational Components (`src/shared/components/data-table/`, `forms/`, `feedback/`)

Task 5 added a layer of entity-agnostic components that every CRUD feature reuses. The guiding principle is **URL = source of truth for list-page state** and **components must not duplicate query-string parsing**.

#### Data Table

`DataTable<TData>` is built on TanStack Table v8 in manual (server-driven) mode — it does no client-side sorting, filtering, or pagination. It receives pre-fetched rows and reports sort intent through a controlled `sort` prop. Inline states (loading → `SkeletonTable`, empty → `EmptyState`, error → `ErrorState`) mean list pages need no conditional rendering logic.

Column definitions use the `ColumnDef<TData, unknown>` type from `@tanstack/react-table`. Mark `enableSorting: true` on a column and set its `id` equal to the backend `sortBy` field name. Optional row selection is controlled via `rowSelection`/`onRowSelectionChange`; use `selectionColumn<T>()` to prepend the select-all header and per-row checkboxes. Per-row actions go in a dedicated column using `RowActions` (always labelled — never icon-only).

#### Server-Side Pagination

`DataTablePagination` receives a `PaginationMeta` object matching the backend envelope:

```ts
{ page, pageSize, totalItems, totalPages, hasNextPage, hasPreviousPage }
```

It shows a "Showing X–Y of Z" range, a page-size `<Select>`, prev/next buttons, and numbered pages with ellipsis for direct navigation. All actions call the parent (URL state) — the component holds no internal page state. Disabled states derive from `meta`.

#### URL Query State

`useListQueryState(options?)` in `src/shared/hooks/use-list-query-state.ts` is the **single parser and serializer** for list-page URL params. Components never parse `useSearchParams` themselves.

Recognised params: `page`, `limit`, `search`, `sortBy`, `sortOrder`. Any other non-reserved key is treated as a feature filter and surfaced via `state.filters`. Invalid values fall back safely (bad page/limit → defaults; bad sortOrder → default). `page=1` and the default limit are pruned from the URL to keep it clean. Any setter except `setPage` resets to page 1. Browser back/forward restores table state automatically because everything is in the URL.

Usage:

```ts
const list = useListQueryState({ defaultSortBy: 'createdAt', defaultSortOrder: 'desc' })
// list.page, list.limit, list.search, list.sortBy, list.sortOrder, list.filters
// list.setSearch(q)  list.setPage(n)  list.setLimit(n)  list.setSort(col)
// list.setFilter('status', 'active')  list.clearFilters()
```

#### Search and Filters

`SearchInput` debounces keystrokes (300 ms default) against a local draft state and emits the settled value via `onChange`. It synchronizes with external value changes (browser back/clear-all) without clobbering active typing.

`SelectFilter` maps null/'' to a sentinel `__all__` value (Radix Select disallows empty strings) and emits `null` for "no filter". It is entirely generic — no business-specific option values are baked in.

`DateFilter` uses the native `<input type="date">` for zero-dep keyboard- and screen-reader support. Emits `null` when cleared.

Compose them inside `DataTableToolbar`:

```tsx
<DataTableToolbar
  hasActiveFilters={list.hasActiveFilters}
  onClearFilters={list.clearFilters}
  search={<SearchInput value={list.search} onChange={list.setSearch} />}
  filters={<SelectFilter label="Status" value={list.filters.status ?? null} onChange={(v) => list.setFilter('status', v)} options={[...]} />}
  actions={<Button>New</Button>}
/>
```

#### Form Layout

Form pages use React Hook Form (with `@hookform/resolvers/zod`) and the `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` primitives from `src/shared/components/ui/form.tsx`. These wire accessible `aria-describedby`/`aria-invalid` attributes and surface errors automatically.

Wrap the form tree with `FormLayout` (width-constrained column), group related fields in `FormSection` (renders as a `SectionCard`), and close with `FormActions` (submit + cancel + optional secondary slot):

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormLayout>
      <FormSection title="Details">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel required>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </FormSection>
      <FormActions submitLabel="Save" onCancel={() => navigate(-1)} isSubmitting={isPending} />
    </FormLayout>
  </form>
</Form>
```

`useUnsavedChangesWarning(formState.isDirty && !formState.isSubmitting)` triggers the browser `beforeunload` prompt when there are unsaved changes.

#### Confirmation Dialogs

`ConfirmDialog` wraps the accessible `AlertDialog` primitive (focus-trapped, escape-closeable). Pass `isPending={true}` to keep the dialog open while an async mutation runs (the dialog closes only when the caller is done). `DeleteConfirmDialog` specialises it with delete/archive copy and a destructive confirm button.

Manage dialog state with `useConfirmDialog<T>()`:

```ts
const confirm = useConfirmDialog<Category>()
// confirm.open(category)  confirm.close()  confirm.isOpen  confirm.target
```

#### Toast Notifications

`ToastProvider` (in `app/providers.tsx`) owns a lightweight toast queue and renders the viewport fixed to the bottom-right. `useToast()` exposes `{ toast, dismiss }`. Call `toast({ tone, title, description })` from anywhere inside the provider tree; tones: `default`, `success`, `error`, `warning`, `info`.

`useMutationFeedback({ success, errorTitle, onSuccess, onError })` in `src/lib/api/query-state.ts` returns `onSuccess`/`onError` handlers that raise a toast automatically, composable with feature-specific cache invalidation:

```ts
const mutation = useMutation({
  mutationFn: deleteCategory,
  ...useMutationFeedback({
    success: { title: 'Deleted', description: 'Category removed.' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  }),
})
```

#### How Future CRUD Tasks Should Use These Components

A standard list page:

1. Call `useListQueryState(...)` at the top.
2. Pass `{ page, limit, search, sortBy, sortOrder, filters }` to the TanStack Query list hook.
3. Resolve a view state with `resolveQueryViewState({ isLoading, isError, isEmpty })`.
4. Render `<DataTableToolbar>` + `<DataTable sort={...}>` + `<DataTablePagination meta={...}>`.
5. Wire delete/archive through `useConfirmDialog` + `DeleteConfirmDialog` + `useMutationFeedback`.

A standard form page:

1. `useForm<T>({ resolver: zodResolver(schema) })`.
2. Wrap with `<Form>` → `<FormLayout>` → `<FormSection>` → fields → `<FormActions>`.
3. Use `useUnsavedChangesWarning(formState.isDirty)`.
4. Submit with `useMutation` + `useMutationFeedback`.

Never duplicate URL query-string parsing. Never re-implement pagination or search debouncing. Never show raw API errors — use `toErrorMessage` or `useMutationFeedback`.

#### Accessibility Expectations

- Every icon-only interactive element must have a visible or `sr-only` label (`aria-label`).
- Sort headers use `aria-sort` (`ascending`/`descending`/`none`).
- Table loading state uses `role="status" aria-busy="true"` with an `sr-only` label.
- `ConfirmDialog` is focus-trapped and escape-closeable via Radix `AlertDialog`.
- Toast viewport has `role="region" aria-label="Notifications"`; items use `role="status" aria-live="polite"`.
- `FormLabel` with `required` renders an accessible `*` indicator (hidden from screen readers as decoration; field's `aria-required` comes from the underlying input).
- All custom interactive controls (`Checkbox`, sort buttons, search-clear) are keyboard-navigable with visible focus rings.

### 12. Feature CRUD Pattern (established in Task 6)

Every catalog CRUD feature follows a consistent three-layer structure:

**Feature hooks** (`src/features/<name>/hooks/use-<name>.ts`):
- `use<Name>List(params)` — wraps the generated `useQuery` hook for the paginated list endpoint.
- `use<Name>Detail(id)` — wraps `useQuery` for the single-entity endpoint.
- `use<Name>Create()` / `use<Name>Update(id)` / `use<Name>Deactivate()` — manual `useState`-based mutation wrappers that call the generated imperative function, then call `queryClient.invalidateQueries` for the list and (where applicable) detail query keys. Returns `{ mutate, isPending }`.
- Cache-invalidation keys match the Orval-generated query-key shape: `['/admin/<entities>']` for lists, `getAdmin<Name>ControllerFindOneQueryKey(id)` for detail.

**Feature components** (`src/features/<name>/components/`):
- `<Name>Columns.tsx` — `useBrandColumns` / `useCategoryColumns` hooks return `ColumnDef[]`; accept `{ onDeactivate }` callback. Render `RowActions` with Edit (navigate) and Deactivate (open confirm dialog) options. OWNER/ADMIN only see write actions via `PermissionGuard`-style guards.
- `<Name>Form.tsx` — RHF + Zod form accepting `defaultValues`, `onSubmit`, `isSubmitting`, and `mode: 'create' | 'edit'`. Renders `FormLayout` → `FormSection` → fields → `FormActions`.

**Page components** (`src/pages/catalog/`):
- `<Name>sPage.tsx` — list page; calls `useListQueryState`, renders `SearchInput` + `SelectFilter` (isActive), `DataTable`, `DataTablePagination`, `ConfirmDialog` for deactivation, `PermissionGuard`-wrapped "New" button.
- `<Name>NewPage.tsx` — create page; renders `PageHeader` + `<Name>Form mode="create"`.
- `<Name>EditPage.tsx` — edit page; fetches detail via `use<Name>Detail`, renders loading/error states, then `PageHeader` + `<Name>Form mode="edit"`.

**Routes** (`src/app/router.tsx`):
Each entity uses nested routes: `<entity>` (index → list), `<entity>/new`, `<entity>/:entityId/edit`. Each nested route has its own `handle({ title, breadcrumb })`.

**Deactivation, not deletion**:
Categories and brands are never hard-deleted from the UI. The list page offers a "Deactivate" action that calls the backend deactivate endpoint and marks the entity inactive. The `isActive` field is filterable via `SelectFilter`. The entity can be reactivated by editing the form's `isActive` checkbox.

**Category image workflow** (`CategoryImageUpload`):
Displayed on the `CategoryEditPage` (edit mode only, above the form). Shows the current image (`currentImage.urls.card`), previews the selected file locally before upload, calls `categoryMediaControllerReplace` (multipart), and calls `categoryMediaControllerDelete` with a confirm dialog for removal. Invalidates both the detail and list queries after each operation. Brand logo upload is **not implemented** — no backend contract exists for it in the current OpenAPI spec.

## TypeScript Configuration

Strict mode is enforced:
- `strict: true` — all strict checks enabled
- `noUncheckedIndexedAccess: true` — array/object accesses return `T | undefined`
- `noUnusedLocals / noUnusedParameters: true` — dead code caught at compile time

Path alias `@/*` maps to `src/*` in both TypeScript and Vite.
