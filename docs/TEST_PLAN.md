# Test Plan — Penguin Beauty Admin Dashboard

## Philosophy

- Tests verify behavior, not implementation
- No test touches the real backend, database, internet, real JWT, or real account
- MSW intercepts any accidental network calls and fails loudly (`onUnhandledRequest: 'error'`)
- `src/test/utils/render.tsx` renders components with QueryClient + CurrentUser
  (role configurable) + MemoryRouter; `src/test/utils/router.tsx` renders the real
  routes through a memory **data** router for route-level tests
- Small role fixtures (`makeTestUser(role)`) drive permission/visibility tests

## Test Types

### Unit Tests
For pure functions, utilities, and Zod schemas. No React setup needed.

Examples:
- `src/config/__tests__/env.test.ts` — env schema parsing
- `src/config/__tests__/navigation.test.ts` — nav config & role filtering
- `src/features/auth/__tests__/roles.test.ts` — permission matrix

### Component Tests
For React components in isolation. Use the custom render utility.

Examples:
- `src/shared/components/common/__tests__/PermissionGuard.test.tsx` — role gating
- `src/shared/components/common/__tests__/states.test.tsx` — empty/error/loading
- `src/shared/components/layout/__tests__/SidebarNav.test.tsx` — nav rendering
- `src/shared/components/layout/__tests__/DashboardLayout.test.tsx` — shell, drawer, collapse
- `src/pages/__tests__/module-pages.test.tsx` — placeholders & permission actions
- `src/shared/components/ui/__tests__/button.test.tsx`

Both `render` and `renderWithRouter` stub the `AuthContext` directly so tests
never hit real API calls and never need a real token. Pass `{ unauthenticated: true }`
to `renderWithRouter` for guest-session tests (e.g. the login page).

### Route Integration Tests
Exercise the real route tree through a memory data router.

Examples:
- `src/app/__tests__/App.test.tsx` — routes, redirect, nested params, 404/403, login page

### API Layer Tests
Exercise the generated client + HTTP client + error model against MSW.

Examples:
- `src/lib/api/__tests__/errors.test.ts` — error normalization (validation, 401/403/404, network, unknown)
- `src/lib/api/__tests__/http-client.test.ts` — base URL, JSON & multipart, cancellation, no auth header, interceptors
- `src/lib/api/__tests__/query-integration.test.tsx` — generated query with the app QueryClient, retry policy
- `src/lib/api/__tests__/generated.test.ts` — generated exports, models barrel, do-not-edit header
- `src/pages/__tests__/DiagnosticsPage.test.tsx` — config/contract display, probe success & normalized error

### Feature Integration Tests (future)
For feature workflows spanning components and API calls. MSW handlers simulate
backend responses; register them with `server.use(...)` + the `apiUrl` helper.

## Coverage Goals

**Task 1 — Foundation**

| Area | Goal |
|---|---|
| Env config schema | All valid/invalid cases |
| shadcn UI components | Render + behavior |
| App providers | QueryClient + Router integration |

**Task 2 — Conception & shell**

| Area | Goal |
|---|---|
| Role/permission model | Full matrix |
| Navigation config | Structure + role filtering |
| Permission gating | OWNER shows / STAFF hides write actions |
| Page states | Empty, Error (+retry), Loading (a11y), Coming-soon |
| Application shell | Renders, mobile drawer opens, sidebar collapses, skip link |
| Routing | Every placeholder route, nested params, 404 (in shell), 403, login (standalone) |
| Accessibility | Nav landmark, skip-to-content, keyboard-operable controls |

**Task 3 — API integration**

| Area | Goal |
|---|---|
| Error normalization | Validation (array→details), 401/403/404/409/5xx, network, abort, unknown |
| HTTP client | Base URL, JSON + multipart, cancellation, no auth header, interceptors |
| TanStack Query | Generated query success + normalized error; 4xx no-retry policy; isolated caches |
| Generated client | Functions/hooks exported, models barrel, do-not-edit header, mutator wiring |
| Diagnostics | Shows API URL + contract version; success & error probe; no secrets |

**Task 4 — Authentication**

| Area | Goal |
|---|---|
| Token storage | get/set/clear in sessionStorage; handles SSR/privacy-mode |
| Auth interceptor | Bearer header injected when token present; skipped when absent |
| 401 event system | `setUnauthorizedHandler` / `notifyUnauthorized` wiring |
| Login schema | Email required/format, password required |
| `AuthProvider` | Session restore, login flow, logout + cache clear, 401 teardown |
| `ProtectedRoute` | Loading state, unauthenticated redirect (with `from`), authenticated render |
| `GuestRoute` | Redirect authenticated users to dashboard / requested route |
| `RoleGuard` | Redirects unauthorized role/permission to /forbidden |
| `LoginPage` | Form validation errors, submit flow, 401 error message |

> Authentication tests stub `AuthContext` — no real tokens, no real API calls.
> API-layer tests never need a running backend, DB, real JWT, internet, or
> Cloudinary — MSW intercepts everything.

**Task 5 — Shared Operational Components**

These components are generic and contain no business logic, so the coverage goal for Task 5 itself is narrow. Coverage grows as each CRUD feature task adds integration tests. No comprehensive unit tests were added in Task 5.

| Area | Goal (added in feature tasks) |
|---|---|
| `useListQueryState` | Param parsing, fallbacks, sort toggle, filter/clear, page reset |
| `DataTable` | Column rendering, sort header click, empty/error/loading states |
| `DataTablePagination` | Range text, prev/next disabled states, page-size change |
| `SearchInput` | Debounce delay, external-value sync, clear button |
| `SelectFilter` | null ↔ ALL sentinel mapping |
| `ConfirmDialog` | Open/close, `isPending` blocking, confirm callback |
| `useMutationFeedback` | Success toast, error toast, composed callbacks |
| `FormActions` | Submit spinner when `isSubmitting`, cancel click |
| Form field primitives | `aria-invalid` when error, `aria-describedby` wiring |

**Task 6 — Categories & Brands**

No dedicated unit or component tests were added in Task 6 (the shared component layer from Task 5 already covers the generic building blocks). Feature integration tests for the list and form flows should be added as follow-up work. Expected patterns:

| Area | Goal (follow-up) |
|---|---|
| `CategoriesPage` | List renders rows, search filters, status filter, deactivate confirm flow |
| `CategoryNewPage` | Form submit → create mutation → success toast → redirect |
| `CategoryEditPage` | Load detail, populate form, update mutation, image replace/delete |
| `BrandsPage` | List renders rows, search/status filter, deactivate confirm |
| `BrandNewPage` / `BrandEditPage` | Create and update mutation flows |
| `useCategoryDeactivate` / `useBrandDeactivate` | Invalidates list and detail query keys |
| `CategoryImageUpload` | Replace triggers multipart upload; delete triggers confirm → delete endpoint |

Use the MSW handler pattern in the existing [handler section](#msw-handler-pattern-feature-tasks) — register `GET /admin/categories`, `GET /admin/brands`, `PATCH /admin/categories/:id/deactivate`, etc.

**Task 7 — Products**

No dedicated unit or component tests were added in Task 7. Feature integration tests should be added as follow-up work.

| Area | Goal (follow-up) |
|---|---|
| `ProductsPage` | List renders rows, thumbnail column, search, status/isActive filters, archive confirm flow |
| `ProductDetailPage` | Loads product, renders info/pricing/gallery/refs summary, archive navigates to list |
| `ProductFormPage` (create) | Form submit → create → success toast → redirect to list |
| `ProductFormPage` (edit) | Load detail, populate form, update → navigate to detail |
| `ProductGallery` | Cover upload replaces cover; gallery add appends; delete confirm flow; promote-to-cover updates role |
| `ProductReferencesPage` | Loads product name, renders ComingSoonState placeholder |
| `useProductArchive` | Calls archive endpoint, invalidates list and detail keys |
| `useProductImageUpload / Delete` | Calls upload/delete endpoints, invalidates detail key only |

MSW handlers needed: `GET /admin/products`, `GET /admin/products/:id`, `POST /admin/products`, `PATCH /admin/products/:id`, `POST /admin/products/:id/archive`, `POST /admin/products/:id/media`, `DELETE /admin/products/:id/media/:imageId`, `PATCH /admin/products/:id/media/:imageId`.

Use `apiUrl('/admin/products')` from `src/test/mocks/api.ts`. The paginated list response must match the backend envelope (`{ data: [...], meta: { page, pageSize, totalItems, totalPages, hasNextPage, hasPreviousPage } }`).

## Running Tests

```bash
npm test               # Single run (CI)
npm run test:watch     # Watch mode (development)
npm run test:coverage  # Coverage report
```

## MSW Handler Pattern (feature tasks)

When adding feature tests that need API responses, register handlers with `server.use(...)`:

```ts
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'

// Paginated list — matches the backend PaginationMeta envelope
server.use(
  http.get(apiUrl('/admin/categories'), () =>
    HttpResponse.json({
      data: [{ id: '1', name: 'Serums', slug: 'serums' }],
      meta: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    })
  )
)

// Mutation success
server.use(
  http.delete(apiUrl('/admin/categories/:id'), () =>
    HttpResponse.json({ id: '1' })
  )
)

// Error response
server.use(
  http.post(apiUrl('/admin/categories'), () =>
    HttpResponse.json({ statusCode: 409, message: 'Slug already exists', error: 'Conflict' }, { status: 409 })
  )
)
```

The `apiUrl` helper prefixes the configured base URL. Use `server.use(...)` inside individual test cases (or `beforeEach`) to override the default handlers for that test. Handlers registered with `server.use` are reset after each test by the `afterEach(() => server.resetHandlers())` in `test/setup.ts`.

## Test File Naming

```
src/
  pages/
    __tests__/
      module-pages.test.tsx
  features/
    products/
      __tests__/
        ProductList.test.tsx
```

Co-locate tests with the code they test. Never put all tests in a single `tests/` root directory.
