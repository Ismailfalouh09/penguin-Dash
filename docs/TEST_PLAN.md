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

**Task 8 — Product References & Stock**

No dedicated Task 8 feature tests were added with the implementation. Feature integration tests should be added as follow-up work.

| Area | Goal (follow-up) |
|---|---|
| `ProductReferencesPage` | Loads product name, renders reference rows, search, isActive/inStock filters, pagination, deactivate confirm flow |
| `ReferenceDetailPage` | Loads reference, renders identity, stock, compatibility attributes, swatch image, and permission-gated actions |
| `ReferenceNewPage` | Form submit → create reference → success toast → redirect to product references list |
| `ReferenceEditPage` | Load detail, populate form, keep reference code read-only, update → navigate to detail |
| `CompatibilityEditor` | Loads backend attribute groups, adds/removes compatibility entries, validates score range |
| `ReferenceSwatchUpload` | Replace/delete call the real product-reference media endpoints with multipart upload/delete handlers |
| `StockUpdateDialog` | Manual stock submit calls update-stock endpoint with stock, reserved, and low-stock threshold fields |
| Permission behavior | OWNER/ADMIN show write, stock, and media actions; STAFF can read but cannot mutate |

MSW handlers needed: `GET /admin/products/:id`, `GET /admin/products/:id/references`, `GET /admin/product-references/:id`, `POST /admin/products/:id/references`, `PATCH /admin/product-references/:id`, `PATCH /admin/product-references/:id/deactivate`, `PATCH /admin/product-references/:id/stock`, `POST /admin/product-references/:id/media`, and `DELETE /admin/product-references/:id/media`.

Stock updates are manual. Automatic stock reservation and deduction are not implemented.

**Task 9 â€” Packs**

Pack workflows are covered by page and component tests in `src/pages/catalog/__tests__/` and `src/features/packs/__tests__/PackMediaGallery.test.tsx`.

| Area | Coverage |
|---|---|
| `PacksPage` | Loading, empty, and error states; URL state passthrough; role-gated New button; archive confirmation cancel flow |
| `PackDetailPage` | Loads pack data, renders identity, pricing, items, compatibility, and media, then archives back to the list |
| `PackFormPage` (create) | Loads product and attribute options, auto-fills the slug on blur, submits nested items and compatibility attributes, validates pricing, supports cancel, and blocks STAFF |
| `PackFormPage` (edit) | Loads the pack, pre-fills nested values, shows the media section, updates the pack, supports cancel back to detail, and blocks STAFF |
| `PackMediaGallery` | Cover upload/replace/remove, gallery add, delete confirmation, promote-to-cover, and reorder actions |
| `PackItemsEditor` / `PackCompatibilityEditor` | Active product/reference loading, selection-mode switching, score validation, and removal flows |
| Permission behavior | OWNER and ADMIN see write and media actions; STAFF can read but cannot mutate |

MSW handlers needed: `GET /admin/packs`, `GET /admin/packs/:id`, `POST /admin/packs`, `PATCH /admin/packs/:id`, `DELETE /admin/packs/:id`, `POST /admin/packs/:id/images`, `PATCH /admin/packs/:id/images/:imageId`, `PATCH /admin/packs/:id/images/reorder`, `DELETE /admin/packs/:id/images/:imageId`, `GET /admin/products`, and `GET /admin/attributes`.

**Task 10 â€” Media Library**

No dedicated Task 10 feature tests were added with the implementation. Follow-up tests should cover the shared media library and picker workflows.

| Area | Goal (follow-up) |
|---|---|
| `MediaPage` | List rendering, search, sort toggles, archived filter, pagination, upload CTA, delete confirmation, and role gating |
| `MediaUploadDialog` | JPEG/PNG/WebP and size validation, multipart upload, success/error toasts, and reset behavior |
| `MediaDetailSheet` | Loads asset metadata, edits alt text, shows soft-deleted state, and blocks STAFF mutations |
| `MediaPicker` | Search, pagination, single/multi-select, optional inline upload, and selection reset on close |
| Entity integrations | Category, product, reference, and pack flows continue to use their entity-specific media widgets and permission checks |
| Permission behavior | OWNER and ADMIN can upload/edit/archive; STAFF can list and inspect only |

MSW handlers needed: `GET /admin/media`, `GET /admin/media/:id`, `POST /admin/media/upload`, `PATCH /admin/media/:id`, and `DELETE /admin/media/:id`.

Uploads are backend-mediated only; tests should not assume a direct browser-to-Cloudinary flow. The reusable picker is intentionally shared, but it is not yet wired into the entity pages.

**Task 11 — Attributes & Quiz**

No dedicated Task 11 feature tests were added with the implementation. Feature integration tests should be added as follow-up work.

| Area | Goal (follow-up) |
|---|---|
| `AttributesPage` | List renders attribute groups, search, isActive filter, pagination, deactivate confirm flow |
| `AttributeGroupDetailPage` | Loads group, renders option list, inline create/edit dialogs, deactivate confirm |
| `AttributeGroupNewPage` / `AttributeGroupEditPage` | Create and update mutation flows, navigate on success |
| `AttributeOptionForm` | Name/code/label validation, create and update mutations |
| `QuizPage` | List renders questions, attribute-group and status filters, deactivate confirm, reorder dialog opens |
| `QuizQuestionNewPage` | Group selection loads options, option add/remove, create mutation, navigate on success |
| `QuizQuestionEditPage` | Group field is disabled in edit mode, existing options pre-loaded, update mutation |
| `QuizReorderDialog` | Up/down buttons reorder list, save sends correct stepOrder sequence, cancel reverts |
| Permission behavior | OWNER/ADMIN show write actions; STAFF sees read-only lists with no create/edit/deactivate buttons |

MSW handlers needed: `GET /admin/attributes`, `GET /admin/attributes/:groupId`, `POST /admin/attributes/groups`, `PATCH /admin/attributes/groups/:groupId`, `PATCH /admin/attributes/groups/:groupId/deactivate`, `GET /admin/attributes/:groupId/options`, `POST /admin/attributes/:groupId/options`, `PATCH /admin/attributes/options/:id`, `PATCH /admin/attributes/options/:id/deactivate`, `GET /admin/quiz/questions`, `GET /admin/quiz/questions/:id`, `POST /admin/quiz/questions`, `PATCH /admin/quiz/questions/:id`, `PATCH /admin/quiz/questions/:id/deactivate`, and `PATCH /admin/quiz/questions/reorder`.

Attribute-group image upload and quiz-option image upload are not in scope; do not add MSW handlers or assertions for those endpoints.

**Task 12 — Recommendation Rules & Preview**

No dedicated Task 12 feature tests were added with the implementation. Feature integration tests should be added as follow-up work.

| Area | Goal (follow-up) |
|---|---|
| `RecommendationRulesPage` | List renders rows, search, `isActive`/`targetType`/`conditionType` filters, pagination, row actions, and deactivate confirm flow |
| `RecommendationRuleForm` | Create and edit flows, immutable code in edit mode, active/inactive toggle, cancel navigation |
| `RecommendationRuleDetailPage` | Loads rule, renders identity and scoring fields, and shows the write-gated edit button |
| `RecommendationRulePreviewPage` | Runs backend preview with a customer profile ID, renders ranked packs, handles empty results, and shows algorithm version / score metadata |
| Permission behavior | OWNER/ADMIN show create/edit/deactivate; OWNER/ADMIN/STAFF can preview; backend scoring stays authoritative |

MSW handlers needed: `GET /admin/recommendation-rules`, `GET /admin/recommendation-rules/:id`, `POST /admin/recommendation-rules`, `PATCH /admin/recommendation-rules/:id`, `DELETE /admin/recommendation-rules/:id`, and `POST /admin/recommendation-rules/preview`.

Preview results are non-persistent. The tests should assert that the frontend displays the backend response and does not model stored recommendation history or reimplement scoring.

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
