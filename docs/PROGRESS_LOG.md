# Progress Log

## Task 16 — UI Design Handoff Documentation

**Date:** 2026-06-17
**Status:** Completed

### What Was Done

Created the complete UI design handoff documentation suite to enable a future agent or
developer to safely integrate a purchased admin template without breaking business logic,
API integration, or authorization.

**Files created:**

- `docs/UI_DESIGN_HANDOFF.md` — project purpose, frontend stack, routing, auth, roles,
  API integration, form approach, table approach, media picker, error/loading/empty states,
  and the critical redesign constraint.
- `docs/SCREEN_INVENTORY.md` — full inventory of all 30+ screens with route, page name,
  purpose, API dependencies, components, role access, UI states, and redesign notes.
- `docs/COMPONENT_INVENTORY.md` — grouped inventory of all reusable shared components
  with file path, purpose, usage, visual-replaceability, business-logic flag, and
  migration notes. Covers layout, nav, table, form, dialog, media, state, permission,
  and utility components.
- `docs/TEMPLATE_ADAPTATION_GUIDE.md` — step-by-step migration process (8 steps),
  13 strict future-agent rules, template selection checklist (14 criteria), and FAQ.

**Files updated:**

- `docs/DESIGN_SYSTEM.md` — added "Template Replacement Guide" section documenting what
  can be replaced vs. what must be preserved.
- `FRONTEND_ROADMAP.md` — marked Task 16 Completed, added Task 17 (Deployment and
  Release Readiness) as Next.

### Roadmap

- Task 16 — Completed.
- Task 17 — Next: Deployment and Release Readiness.

### Verification

Documentation only. No implementation changes, no tests run, no build run.
Git safety check confirmed: no `.env`, no credentials, no backend code, no OpenAPI
modifications, no generated file edits, no template files added.

---

## Task 15 — Final UI, Accessibility, and Security Fixes

**Date:** 2026-06-17
**Status:** Completed

### What Was Done

Documented the final UI, accessibility, security, and deployment-readiness pass across the project docs and aligned the roadmap with the release-ready dashboard MVP.

Updated coverage:
- Shell and account-page cleanup, including visible breadcrumbs, real profile data, and accessible 404 presentation.
- Accessibility polish on media, product, order, pack, and recommendation actions, including explicit labels and clearer table semantics.
- Deployment guidance covering environment variables, route fallback, session behavior, and API base URL configuration.
- Security notes confirming no fake analytics, tracking scripts, or hardcoded production numbers were introduced.
- Manual user verification reported Task 16A as working.

### Roadmap

- Task 16 - Completed.
- Admin Dashboard MVP - Completed.

### Verification

Manual production check by the user confirmed the Task 16A implementation. Standard verification commands were not rerun in Task 16C.

### Notes

- The release remains backend-driven; the dashboard and related pages only surface statistics and states exposed by the server.
- No feature tests were added in Task 16C. Follow-up test goals are documented in `docs/TEST_PLAN.md`.

---

## Task 13 — Orders

**Date:** 2026-06-17
**Status:** Completed

### What Was Done

Documented the completed order-management workflow across the project docs and aligned the roadmap with the implementation already present in the repo.

Updated coverage:
- Order list workflow, including customer and delivery summary columns, pack, total, payment status, delivery status, and created date display.
- Order detail workflow, including customer information, delivery information, ordered items, totals, and status history.
- Status-update workflow through the order-status dialog.
- OWNER, ADMIN, and STAFF permissions.
- Manual user verification reported Task 13A as working.
- Current limitations: no delivery-provider integration, no WhatsApp confirmation, no payment integration, no automatic stock deduction, and no stock reservation.

### Roadmap

- Task 13 - Completed.
- Task 14 - Next: Dashboard Overview.

### Verification

Manual test by the user confirmed the Task 13A implementation. Standard verification commands were not rerun in Task 13C.

### Notes

- The order detail page treats customer, delivery, and item payloads defensively because the backend can omit those fields in some cases.
- No feature tests were added in Task 13C. Follow-up test goals are documented in `docs/TEST_PLAN.md`.

---

## Task 12 — Recommendation Rules & Preview

**Date:** 2026-06-17
**Status:** Completed

### What Was Done

Documented the completed recommendation-rule and preview workflow across the project docs and aligned the roadmap with the implementation already present in the repo.

Updated coverage:
- Recommendation-rule list, detail, create, edit, and deactivate workflows.
- Immutable rule-code behavior in edit mode.
- Soft deactivation behavior, with inactive rules excluded from future previews and results.
- Preview workflow for customer profile IDs.
- Preview result display: algorithm version, ranked packs, match percentage, total score, reason summary, and selected items.
- OWNER, ADMIN, and STAFF permissions.
- Backend-authoritative scoring; the frontend does not reimplement ranking.
- Manual user verification reported Task 12A as working.

### Roadmap

- Task 12 - Completed.
- Task 13 - Next: Order Management.

### Verification

Manual test by the user confirmed the Task 12A implementation. Standard verification commands were not rerun in Task 12C.

### Notes

- The preview endpoint is non-persistent; it returns ranked packs for display only.
- No feature tests were added in Task 12. Follow-up test goals are documented in `docs/TEST_PLAN.md`.

---

## Task 11 — Attributes & Quiz

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

Implemented and manually verified the full attribute-group, attribute-option, and quiz-question management workflows.

**Attribute groups** (`src/features/attributes/`)
- `AttributesPage` — paginated list with search, `isActive` filter, deactivate confirm, and a write-gated New button.
- `AttributeGroupDetailPage` — loads the group and renders its attribute options with inline create/edit dialogs and a deactivate confirm.
- `AttributeGroupNewPage` / `AttributeGroupEditPage` — form pages using `AttributeGroupForm` (RHF + Zod).
- Attribute groups are deactivated, not hard-deleted.
- Attribute-group image upload is not implemented (no backend contract).

**Attribute options**
- Options are scoped to their parent attribute group and accessed through `AttributeGroupDetailPage`.
- `useAttributeOptionList(groupId, params)` fetches with group-scoped cache key `/admin/attributes/${groupId}/options`.
- Create, update, and deactivate hooks invalidate both the group-scoped option key and the top-level `/admin/attributes` key.
- Attribute-option image upload is not implemented (no backend contract).

**Quiz questions** (`src/features/quiz/`)
- `QuizPage` — paginated list with search, status, deactivate confirm, and a write-gated New button; opens `QuizReorderDialog` for step-order management.
- `QuizQuestionNewPage` / `QuizQuestionEditPage` — form pages using `QuizQuestionForm`.
- `QuizQuestionForm` — attribute group select loads all active groups; selecting a group loads its active options; options are added from the available pool and removed individually; saving replaces the full option list.
- Attribute group is immutable after creation; the field is `disabled` in edit mode and shows an explanatory note.
- `QuizReorderDialog` — up/down list UI that submits `ReorderQuizQuestionsDto` via `adminQuizControllerReorder`.
- Quiz questions are deactivated, not hard-deleted.
- Quiz-option images are not implemented (no backend contract).

**Permissions**: OWNER and ADMIN receive full write access (create, edit, deactivate, reorder). STAFF can view lists and details but does not see write actions.

**Routes added**:
- `/attributes` (group list), `/attributes/new`, `/attributes/:groupId` (detail + option list), `/attributes/:groupId/edit`
- `/quiz` (question list), `/quiz/new`, `/quiz/:questionId/edit`

### Roadmap

- Task 11 — Completed.
- Task 12 — Next: Recommendation Rules and Preview.

### Verification

Manual test by the user confirmed the implementation is working. Standard verification commands (`npm run lint`, `npm run format:check`, `npm test`, `npm run build`) were not rerun in Task 11C.

### Notes

- No feature tests were added in Task 11. Follow-up test goals are documented in `docs/TEST_PLAN.md`.
- The backend enforces one active quiz question per attribute group; the UI shows an explanatory note on the `isActive` field but does not enforce this client-side.

---

## Task 10 - Media Library

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

Documented the completed media-library workflow across the project docs and aligned the task tracker with the implementation already present in the repo.

Updated coverage:
- Shared media browsing, multipart upload, metadata editing, and soft delete/archive behavior.
- Reusable media picker with single/multi-select support and optional inline upload.
- Supported category, product, reference, and pack integrations.
- OWNER, ADMIN, and STAFF permission behavior.
- No direct browser-to-Cloudinary upload path.

### Roadmap

- Task 10 - Completed.
- Task 11 - Next: Attributes and Quiz Management.

### Verification

Task 10B had already reported the standard verification commands for the media work. They were not rerun in Task 10C:

- `npm run lint`
- `npm run format:check`
- `npm test`
- `npm run build`

Reported result: passing.

### Notes

- The reusable picker is intentionally shared, but it is not yet wired into the entity pages; category, product, reference, and pack screens still use their entity-specific media widgets.

## Task 9 — Packs

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

Recorded the completed pack bundle-management workflow across the project docs and aligned the task tracker with the implementation already present in the repo.

Updated coverage:
- Pack list, detail, create, and edit routes.
- Pack item composition with product and reference selection modes.
- Compatibility attributes sourced from backend attribute groups.
- Pack media gallery with cover management, gallery uploads, deletion, promotion, and reordering.
- Archive flow and STAFF permission handling.

### Roadmap

- Task 9 — Completed.
- Task 10 — Next.

### Notes

- Feature and page tests already exist under `src/features/packs/__tests__/` and `src/pages/catalog/__tests__/`.

---

## Task 8 — Product References & Stock

**Date:** 2026-06-14
**Status:** Completed

### Task 8B Documentation Results

Documented the completed Task 8 product-reference and stock workflows across the project docs. Task 8A implementation was already present; Task 8B did not add features or refactor working code.

Updated coverage:
- Reference list, detail, create, and edit workflows.
- Immutable `referenceCode` behavior after creation.
- `isDefault` behavior, with the backend enforcing one default reference per product.
- Compatibility attributes loaded from backend attribute groups and saved as replacement reference attribute inputs.
- Swatch image upload/replace/remove through the real product-reference media API.
- Manual stock updates through the update-stock endpoint.
- Reference deactivation, with no hard-delete UI; product archive still cascades to references on the backend.
- OWNER, ADMIN, and STAFF permission behavior.

Stock updates are manual. Automatic stock reservation and deduction are not implemented.

### Verification

- **Lint**: passed with 0 errors and 4 existing fast-refresh warnings.
- **Format check**: failed; Prettier reported 32 source files needing formatting. No bulk formatting was run because Task 8B is limited to documentation and commit safety.
- **Tests**: passed after rerunning outside the sandbox due to a Windows `spawn EPERM` while loading Vite config in the sandbox — 21 files / 138 tests passed.
- **Build**: passed after rerunning outside the sandbox due to the same `spawn EPERM` issue. Vite emitted a large-chunk warning only.

### Roadmap

- Task 8 — Completed.
- Task 9 — Next.

### Remaining Limitations

- No dedicated Task 8 feature tests were added with the implementation; follow-up integration tests are documented in `docs/TEST_PLAN.md`.
- Automatic stock reservation and deduction are not implemented.
- Manual stock updates require admin action.

---

## Task 7 — Products

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

Implemented full product CRUD management including a product list page, product detail view, combined create/edit form page, a media gallery component, and a placeholder references page.

**Products feature** (`src/features/products/`):
- `use-products.ts` — hooks: `useProductList`, `useProductDetail`, `useProductCreate`, `useProductUpdate`, `useProductArchive`, `useProductImageUpload`, `useProductImageDelete`, `useProductImageReorder`. All write hooks use the manual `useState`/`useCallback` pattern (same as Task 6). `useProductArchive` takes the product ID as an argument (not scoped at construction time) so a single hook instance handles any product from the list. Image hooks are scoped to a `productId` at construction time and invalidate only the detail key. Create/update/archive invalidate the list key `['/admin/products']`; update and archive also invalidate `getAdminProductsControllerFindOneQueryKey(id)`.
- `ProductColumns.tsx` — `useProductColumns({ onArchive })` returns column definitions. Columns: cover thumbnail, name + slug, category, brand, base price + currency, reference count (with icon), status badge, row actions. Row actions: View (always), Edit + Archive (OWNER/ADMIN only). Archive action is hidden when `product.status === 'ARCHIVED'`. Uses `useCurrentUser().can('write')` for role checks.
- `ProductForm.tsx` — RHF + Zod for `name`, `slug`, `description`, `categoryId`, `brandId`, `basePrice`, `costPrice`, `currency`, `status`, `isActive`. Loads category and brand lists inline via `useCategoryList` / `useBrandList`. Brand is optional with a `__none__` sentinel. Slug auto-generates from name on blur (create mode only, when slug is empty). Cancel navigates to `/products`.
- `ProductGallery.tsx` — self-contained cover + gallery management. Cover: upload, replace, remove. Gallery: add images, delete individual images, promote to cover (via `productMediaControllerUpdate` role update). All three operations (upload, delete, update) go through separate hooks and invalidate the product detail query. Requires `canWrite` prop (caller combines `can('write') && can('media:manage')`).

**Pages** (`src/pages/catalog/`):
- `ProductsPage.tsx` — list page with `SearchInput`, `SelectFilter` for `status` (DRAFT/ACTIVE/ARCHIVED), `SelectFilter` for `isActive` (boolean), `DataTable`, `DataTablePagination`, `PermissionGuard`-wrapped "New product" button, `ConfirmDialog` for archive. Replaces the Task 2 `ModulePlaceholder`.
- `ProductDetailPage.tsx` — read-only detail view. Shows product info, pricing, `ProductGallery` (full CRUD if `can('write') && can('media:manage')`), and a references summary table (code/name/SKU/stock/status). "Edit" and "Archive" buttons are `PermissionGuard`-wrapped. Archive navigates to the products list on success.
- `ProductFormPage.tsx` — unified create + edit page. Determines mode from the `productId` route param. In edit mode: loads detail, shows loading/error states, then form + gallery. In create mode: form only (no gallery until product exists). `STAFF` users see an inline `ForbiddenState` rather than a redirect.
- `ProductReferencesPage.tsx` — placeholder page for Task 8. Loads the product detail to show the product name in the page header, then renders `ComingSoonState` listing the planned reference/stock features.

**Routing** (`src/app/router.tsx`, `src/config/routes.ts`):
- Products nested-route group: index (list), `new`, `:productId` (detail), `:productId/edit`, `:productId/references`.
- Route constants: `ROUTES.products`, `ROUTES.productNew`, `ROUTES.product(id)`, `ROUTES.productEdit(id)`, `ROUTES.productReferences(id)`.

**Cache-invalidation conventions**:
- List key: `['/admin/products']` — invalidated by create, update, archive.
- Detail key: `getAdminProductsControllerFindOneQueryKey(id)` — invalidated by update, archive, and every image operation (upload, delete, update).

**Role behavior**:
- OWNER, ADMIN, STAFF all see the product list, search, filters, detail view, and gallery thumbnails.
- "New product" button is `<PermissionGuard permission="write">`-gated (STAFF does not see it).
- Edit and Archive row actions are conditionally rendered when `can('write')`.
- `ProductFormPage` renders `ForbiddenState` inline for STAFF (write check before rendering).
- Gallery write controls (upload, delete, promote) are controlled by `canWrite = can('write') && can('media:manage')`.

### Results

- **Build**: green — no type errors.
- **Lint**: 0 errors.
- **No new tests added** — follow-up integration tests are planned (see TEST_PLAN.md Task 7 section).
- Generated API files unchanged. `.env` not staged. `frontend-handoff/` not modified. No backend code added.

### Key Decisions

- **Archive over deactivate**: products use the `archive` endpoint (not `deactivate`). The UI reflects this: `status === 'ARCHIVED'` hides the Archive action; there is no "restore" from the UI.
- **Unified form page**: a single `ProductFormPage` handles both create and edit rather than two separate page files. The mode is derived from the presence of `productId` in the route params. This reduces duplication and keeps the form component ignorant of routing.
- **Gallery on detail + form pages**: `ProductGallery` is rendered on both `ProductDetailPage` (for quick access) and `ProductFormPage` (in edit mode). The gallery always operates on the real product ID, never on unsaved state.
- **`media:manage` permission for gallery writes**: gallery controls require `can('media:manage')` in addition to `can('write')`, matching the backend role matrix.
- **References page is a placeholder**: `ProductReferencesPage` intentionally renders `ComingSoonState` to reserve the route and make navigation consistent. Full CRUD arrives in Task 8.
- **Nullable Orval guard**: `sku` is typed `string | null` in the generated types; the detail page and columns use `typeof ref.sku === 'string' ? ref.sku : '—'` rather than nullish coalescing to satisfy TypeScript strict mode.

---

## Task 6 — Categories & Brands

**Date:** 2026-06-14
**Status:** Completed

### What Was Done

Implemented full CRUD management for the Categories and Brands catalog modules. Both modules consume the Task 5 shared component layer without modification to shared code.

**Categories feature** (`src/features/categories/`):
- `use-categories.ts` — hooks: `useCategoryList`, `useCategoryDetail`, `useCategoryCreate`, `useCategoryUpdate`, `useCategoryDeactivate`, `useCategoryImageReplace`, `useCategoryImageDelete`. All write hooks use a manual `useState`/`useCallback` pattern (not `useMutation`) and invalidate relevant TanStack Query keys after success.
- `CategoryForm.tsx` — RHF + Zod form for `code`, `name`, `description`, `isActive`. Accepts `mode: 'create' | 'edit'` and `defaultValues`. Cancel navigates to `/categories`.
- `CategoryColumns.tsx` — `useCategoryColumns({ onDeactivate })` returns column definitions; trailing `RowActions` column with Edit (navigates to `/categories/:id/edit`) and Deactivate (opens confirm dialog).
- `CategoryImageUpload.tsx` — shown on the edit page only. Displays current image (`image.urls.card`), shows a local preview while uploading, calls `categoryMediaControllerReplace` (multipart), and `categoryMediaControllerDelete` with a `ConfirmDialog`. Invalidates detail + list queries on success.

**Brands feature** (`src/features/brands/`):
- `use-brands.ts` — hooks: `useBrandList`, `useBrandDetail`, `useBrandCreate`, `useBrandUpdate`, `useBrandDeactivate`. Same pattern as categories; no image hooks (brand logo not in contract).
- `BrandForm.tsx` — RHF + Zod form for `name`, `description`, `isActive`.
- `BrandColumns.tsx` — `useBrandColumns({ onDeactivate })` with Edit + Deactivate row actions.

**Pages** (`src/pages/catalog/`):
- `CategoriesPage.tsx` — list with `SearchInput`, `SelectFilter` (isActive: Active/Inactive/All), `DataTable`, `DataTablePagination`, `PermissionGuard`-wrapped "New category" button, `ConfirmDialog` for deactivation. Replaces the Task 2 `ModulePlaceholder`.
- `CategoryNewPage.tsx` — create form page; success navigates to `/categories`.
- `CategoryEditPage.tsx` — edit page; loads detail, shows `LoadingState`/`ErrorState` while loading, renders `CategoryImageUpload` + `CategoryForm`.
- `BrandsPage.tsx` — same pattern as `CategoriesPage`; replaces the Task 2 `ModulePlaceholder`.
- `BrandNewPage.tsx` / `BrandEditPage.tsx` — same pattern as category pages; no image section.

**Routing** (`src/app/router.tsx`, `src/config/routes.ts`):
- Categories and brands are now nested-route groups with index (list), `new`, and `:id/edit` children.
- New route constants: `ROUTES.categoryNew`, `ROUTES.categoryEdit(id)`, `ROUTES.brandNew`, `ROUTES.brandEdit(id)`.

**Cache-invalidation conventions**:
- List key: `['/admin/categories']` or `['/admin/brands']` — invalidated by create, update, deactivate, and image operations.
- Detail key: `getAdminCategoriesControllerFindOneQueryKey(id)` / `getAdminBrandsControllerFindOneQueryKey(id)` — invalidated by update, deactivate, and image operations.

**Role behavior**:
- All roles (OWNER, ADMIN, STAFF) see list, search, and status-filter UI.
- "New category / New brand" button is gated with `<PermissionGuard permission="write">` — STAFF does not see it.
- Edit and Deactivate row actions are conditionally rendered per the column definitions when permission is `write`.

### Results

- **Build**: green — no type errors.
- **Lint**: 0 errors; pre-existing fast-refresh warnings unchanged.
- **No new tests added** — follow-up integration tests are planned (see TEST_PLAN.md Task 6 section).
- Generated API files unchanged. `.env` not staged. `frontend-handoff/` not modified. No backend code added.

### Key Decisions

- **Deactivation over deletion**: the backend exposes a `PATCH /deactivate` endpoint rather than DELETE. The UI reflects this — there is no hard-delete action. Deactivated entities are filterable by `isActive=false`.
- **Manual mutation hooks (not `useMutation`)**: `useState`/`useCallback` wrappers were used for mutations to avoid the `useMutation` v5 arity issue and allow direct `await` in page handlers without composing `onSuccess`/`onError`.
- **Category image on edit page only**: image upload requires a real `categoryId`, so it is only shown on the `CategoryEditPage`, not on the create form.
- **No brand logo**: the current OpenAPI contract has no brand image endpoint. The feature is not implemented to avoid an unsupported backend contract.
- **URL state reuse**: both list pages use `useListQueryState` exactly as documented in AGENTS.md — no direct `useSearchParams` calls anywhere in feature code.

---

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
