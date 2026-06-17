# Component Inventory — Penguin Beauty Admin Dashboard

Inventory of all reusable shared components as of Task 15. Grouped by type. For each
component: file path, purpose, where used, whether it can be visually replaced, whether
it contains business logic, and notes for template migration.

---

## Layout Components

### DashboardLayout
**File:** `src/shared/components/layout/DashboardLayout.tsx`
**Purpose:** Parent route element for the entire authenticated area. Composes Sidebar, MobileNav, Header, Breadcrumbs, and Outlet.
**Used by:** Root authenticated route in `src/app/router.tsx`
**Can be replaced visually:** Yes — layout chrome (sidebar width, header height, padding) is purely visual.
**Contains business logic:** No. Layout composition only.
**Migration note:** Replace layout chrome freely. Ensure `<Outlet />` still renders inside `#main-content` with a skip-to-content link for accessibility.

### Sidebar
**File:** `src/shared/components/layout/Sidebar.tsx`
**Purpose:** Persistent desktop sidebar (≥ lg breakpoint). Renders `SidebarNav`, collapse toggle. Collapse state in `localStorage`.
**Used by:** `DashboardLayout`
**Can be replaced visually:** Yes — the entire visual sidebar can be swapped with a template sidebar.
**Contains business logic:** No, but consumes `getNavigationForRole(role)` from the nav config.
**Migration note:** The replacement sidebar must still consume `src/config/navigation.ts` to stay role-aware. Do not hardcode nav items in the component.

### MobileNav
**File:** `src/shared/components/layout/MobileNav.tsx`
**Purpose:** Sheet drawer for mobile (< lg). Contains `SidebarNav`. Opened from the Header hamburger button.
**Used by:** `DashboardLayout`
**Can be replaced visually:** Yes.
**Contains business logic:** No.
**Migration note:** Replace with the template's mobile drawer. Must still render the nav config filtered by role.

### Header
**File:** `src/shared/components/layout/Header.tsx`
**Purpose:** Sticky top bar. Contains drawer trigger, sidebar collapse trigger, breadcrumbs, and user menu.
**Used by:** `DashboardLayout`
**Can be replaced visually:** Yes.
**Contains business logic:** No.
**Migration note:** Breadcrumbs are derived from route `handle.breadcrumb` via `useMatches`. Must preserve that hook call or breadcrumbs will break.

### SidebarNav
**File:** `src/shared/components/layout/SidebarNav.tsx`
**Purpose:** Renders navigation groups and items. Used inside both the desktop sidebar and the mobile drawer.
**Used by:** `Sidebar`, `MobileNav`
**Can be replaced visually:** Yes.
**Contains business logic:** Reads `getNavigationForRole(role)` — role-aware filtering is here.
**Migration note:** Any replacement nav renderer must call `getNavigationForRole` from `src/config/navigation.ts`. Never remove the role-filtering call.

### Breadcrumbs
**File:** `src/shared/components/layout/Breadcrumbs.tsx`
**Purpose:** Renders the breadcrumb trail derived from matched route handles.
**Used by:** `Header`
**Can be replaced visually:** Yes.
**Contains business logic:** No (reads route handles, no API).
**Migration note:** Keep the `useMatches` call that reads `handle.breadcrumb` from each matched route.

---

## Navigation Components

### UserMenu
**File:** `src/shared/components/layout/UserMenu.tsx`
**Purpose:** Dropdown in the header showing current user name/role and sign-out.
**Used by:** `Header`
**Can be replaced visually:** Yes.
**Contains business logic:** Calls `useAuth().logout` on sign-out. Must preserve that call.
**Migration note:** Replace dropdown appearance freely. Do not stub logout with a no-op.

### NavGroup / NavItem (inline in SidebarNav)
**Purpose:** Visual rendering of nav group headers and individual nav items.
**Can be replaced visually:** Yes.
**Migration note:** Must still receive items from `getNavigationForRole(role)` config.

---

## Table Components

### DataTable
**File:** `src/shared/components/data-table/DataTable.tsx`
**Purpose:** Generic server-driven table using TanStack Table v8. Accepts columns and data, renders inline loading, empty, and error states.
**Used by:** Every list page in the dashboard.
**Can be replaced visually:** Yes — the table chrome (borders, row hover, header styles) can be replaced.
**Contains business logic:** No — it is deliberately presentation-only and server-driven. No client-side sorting/filtering.
**Migration note:** If replacing with a template table component, it must remain in server-driven mode. The column definitions and data-fetching hooks must not change.

### DataTablePagination
**File:** `src/shared/components/data-table/DataTablePagination.tsx`
**Purpose:** Pagination control reading from `PaginationMeta`. No internal page state.
**Used by:** Every list page.
**Can be replaced visually:** Yes.
**Contains business logic:** No. Derives all state from `PaginationMeta`.
**Migration note:** Preserve `PaginationMeta` interface. Do not add client-side pagination logic.

### DataTableToolbar
**File:** `src/shared/components/data-table/DataTableToolbar.tsx`
**Purpose:** Composable toolbar row for search, filters, and actions.
**Used by:** Every list page.
**Can be replaced visually:** Yes.
**Contains business logic:** No.
**Migration note:** Template may have its own toolbar layout; replace the visual wrapper only, keep the composed children.

### SearchInput
**File:** `src/shared/components/data-table/SearchInput.tsx`
**Purpose:** 300ms debounced search input. Syncs with external URL state.
**Used by:** All list pages via `DataTableToolbar`.
**Can be replaced visually:** Yes.
**Contains business logic:** Debounce logic must be preserved — do not replace with a naïve onChange that fires on every keystroke.
**Migration note:** If replacing the input component, keep `useDebouncedValue` wired.

### SelectFilter
**File:** `src/shared/components/data-table/SelectFilter.tsx`
**Purpose:** Generic single-select filter. Null maps to "all" sentinel for Radix compatibility.
**Used by:** All list pages.
**Can be replaced visually:** Yes.
**Contains business logic:** Null ↔ `__all__` sentinel conversion. Must be preserved.
**Migration note:** The sentinel conversion is required for Radix Select. Preserve the mapping.

### DateFilter
**File:** `src/shared/components/data-table/DateFilter.tsx`
**Purpose:** Native `<input type="date">` filter.
**Used by:** Any list page with date filtering.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### RowActions
**File:** `src/shared/components/data-table/RowActions.tsx`
**Purpose:** Dropdown menu for per-row table actions. Never icon-only — always labeled.
**Used by:** All list pages via column definitions.
**Can be replaced visually:** Yes.
**Contains business logic:** No. Action callbacks are injected by the caller.
**Migration note:** The labeled-trigger rule is an accessibility requirement. Do not remove labels.

### SkeletonTable
**File:** `src/shared/components/data-table/SkeletonTable.tsx`
**Purpose:** Loading placeholder shaped like the real table. Announces `role="status" aria-busy`.
**Used by:** `DataTable` during loading state.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### selectionColumn
**File:** `src/shared/components/data-table/selectionColumn.tsx`
**Purpose:** Factory that returns the select-all header + per-row checkbox column definition.
**Used by:** List pages that need row selection.
**Can be replaced visually:** The checkbox appearance can be replaced.
**Contains business logic:** No. Pure column definition.

---

## Form Components

### FormLayout
**File:** `src/shared/components/forms/FormLayout.tsx`
**Purpose:** Width-constrained single-column form container.
**Used by:** All form pages.
**Can be replaced visually:** Yes — template may have its own form container width system.
**Contains business logic:** No.

### FormSection
**File:** `src/shared/components/forms/FormSection.tsx`
**Purpose:** Groups related fields under a section card with a title.
**Used by:** All form pages.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### FormActions
**File:** `src/shared/components/forms/FormActions.tsx`
**Purpose:** Submit + cancel buttons row with pending spinner. Stacks on mobile.
**Used by:** All form pages.
**Can be replaced visually:** Yes.
**Contains business logic:** No. Receives `isSubmitting` and `onCancel` as props.
**Migration note:** `isSubmitting` controls the spinner and disabled state — must be wired to RHF `formState.isSubmitting`.

### Form / FormField / FormItem / FormLabel / FormControl / FormMessage
**File:** `src/shared/components/ui/form.tsx`
**Purpose:** React Hook Form field wiring. Auto-wires `aria-describedby`, `aria-invalid`, error messages.
**Used by:** Every form field in the entire dashboard.
**Can be replaced visually:** The error message and label styling can be replaced.
**Contains business logic:** Accessibility wiring for form validation — must not be stripped.
**Migration note:** These primitives wire a11y attributes automatically. If replacing, ensure the replacement still sets `aria-invalid` and `aria-describedby` on inputs.

---

## Dialog Components

### ConfirmDialog
**File:** `src/shared/components/feedback/ConfirmDialog.tsx`
**Purpose:** Accessible `AlertDialog` wrapper. Focus-trapped, escape-closeable. Stays open while `isPending`.
**Used by:** All deactivate/archive/delete actions throughout the dashboard.
**Can be replaced visually:** Yes — title, message, button labels can be restyled.
**Contains business logic:** `isPending` keeps dialog open during async mutation — must be preserved.
**Migration note:** The `isPending` prop is required to prevent premature close during API calls. Any replacement must honor it.

### DeleteConfirmDialog
**File:** `src/shared/components/feedback/DeleteConfirmDialog.tsx`
**Purpose:** Specialized `ConfirmDialog` for deactivation/archive/delete with destructive button styling.
**Used by:** Deactivation flows across all modules.
**Can be replaced visually:** Yes.
**Contains business logic:** No — delegates to `ConfirmDialog`.

### useConfirmDialog
**File:** `src/shared/hooks/use-confirm-dialog.ts`
**Purpose:** Manages open/close state and typed target for confirm dialogs.
**Used by:** All list pages with deactivate/archive.
**Can be replaced visually:** N/A — hook, no visual output.
**Contains business logic:** Minimal — state management only.

---

## Media Components

### ProductGallery
**File:** `src/features/products/components/ProductGallery.tsx`
**Purpose:** Cover image and gallery management for products. Upload, delete, promote, reorder.
**Used by:** `ProductDetailPage`, `ProductFormPage`
**Can be replaced visually:** Yes — grid layout and image card appearance.
**Contains business logic:** Yes — calls upload, delete, and promote API endpoints. Requires `canWrite` prop.
**Migration note:** Write controls gate on `can('write') && can('media:manage')`. Preserve permission checks.

### PackMediaGallery
**File:** `src/features/packs/components/PackMediaGallery.tsx`
**Purpose:** Same as ProductGallery but for packs. Includes reorder.
**Used by:** `PackDetailPage`, `PackFormPage`
**Can be replaced visually:** Yes.
**Contains business logic:** Yes — multiple API calls per operation.
**Migration note:** Same permission pattern as ProductGallery.

### CategoryImageUpload
**File:** `src/features/categories/components/CategoryImageUpload.tsx`
**Purpose:** Single image upload/replace/delete for categories.
**Used by:** `CategoryEditPage`
**Can be replaced visually:** Yes.
**Contains business logic:** Yes — calls replace and delete media endpoints.
**Migration note:** Edit-page only (requires a real entity ID). Preserve delete confirm dialog.

### ReferenceSwatchUpload
**File:** `src/features/product-references/components/ReferenceSwatchUpload.tsx`
**Purpose:** Single swatch image upload/replace/delete for product references.
**Used by:** `ProductReferenceEditPage`
**Can be replaced visually:** Yes.
**Contains business logic:** Yes — calls swatch media endpoints.

### MediaPicker
**File:** `src/features/media/components/MediaPicker.tsx`
**Purpose:** Shared media asset selector with search, pagination, single/multi-select, optional inline upload.
**Used by:** Any page that needs an asset picker.
**Can be replaced visually:** Yes.
**Contains business logic:** Yes — queries media list, optional upload.
**Migration note:** Currently not wired into entity pages; entity-specific widgets are still used. Future integration should use this component.

### MediaUploadDialog
**File:** `src/features/media/components/MediaUploadDialog.tsx`
**Purpose:** Multipart upload dialog for unassigned media assets.
**Used by:** `MediaPage`
**Can be replaced visually:** Yes.
**Contains business logic:** Yes — calls `POST /admin/media/upload`.

### MediaDetailSheet
**File:** `src/features/media/components/MediaDetailSheet.tsx`
**Purpose:** Side sheet showing asset metadata. Allows alt text edit for OWNER/ADMIN.
**Used by:** `MediaPage`
**Can be replaced visually:** Yes.
**Contains business logic:** Calls `PATCH /admin/media/:id` for alt text update.

---

## State Components

### LoadingState
**File:** `src/shared/components/common/LoadingState.tsx`
**Purpose:** Loading skeleton with variants: `page`, `table`, `cards`, `inline`. Announces busy state.
**Used by:** Every module while data is loading.
**Can be replaced visually:** Yes.
**Contains business logic:** No.
**Migration note:** Preserve `role="status" aria-busy` for accessibility.

### EmptyState
**File:** `src/shared/components/common/EmptyState.tsx`
**Purpose:** Empty result state with icon, title, explanation, optional action button.
**Used by:** Every list module.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### ErrorState
**File:** `src/shared/components/common/ErrorState.tsx`
**Purpose:** Error display with friendly message and optional retry. Never shows raw API errors.
**Used by:** All pages that can fail to load data.
**Can be replaced visually:** Yes.
**Contains business logic:** No — message normalization is in `toErrorMessage` in `query-state.ts`.
**Migration note:** Preserve `role="alert"` announcement.

### ComingSoonState
**File:** `src/shared/components/common/ComingSoonState.tsx`
**Purpose:** Placeholder for unimplemented features.
**Used by:** Placeholder pages during development.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### ForbiddenState
**File:** `src/shared/components/common/ForbiddenState.tsx`
**Purpose:** Inline "access denied" state for embedding inside a page section (not a full-page redirect).
**Used by:** `ProductFormPage` for STAFF users.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

---

## Permission Components

### PermissionGuard
**File:** `src/shared/components/common/PermissionGuard.tsx`
**Purpose:** Hides children when the current user lacks the required permission.
**Used by:** Every write action (New button, Edit, Archive, Deactivate, media controls).
**Can be replaced visually:** N/A — renders nothing when permission is denied.
**Contains business logic:** Yes — reads `useCurrentUser().can(permission)`.
**Migration note:** Never remove `PermissionGuard` wrappers from write actions. The backend enforces authorization; the guard is for usability only.

### RoleGuard
**File:** `src/features/auth/RoleGuard.tsx`
**Purpose:** Route-level redirect to `/forbidden` for unauthorized users.
**Used by:** Routes requiring specific permissions (write-only routes).
**Can be replaced visually:** N/A — redirect component.
**Contains business logic:** Yes — reads auth context and redirects based on permission.
**Migration note:** Never remove `RoleGuard` from route definitions. Required for authorization correctness.

### ProtectedRoute
**File:** `src/features/auth/ProtectedRoute.tsx`
**Purpose:** Blocks unauthenticated access and redirects to `/login`.
**Used by:** Root of all authenticated routes in `src/app/router.tsx`.
**Can be replaced visually:** N/A — redirect component.
**Contains business logic:** Yes — checks auth status, handles session restore loading state.
**Migration note:** Never remove from the router. It wraps `CurrentUserProvider`.

### GuestRoute
**File:** `src/features/auth/GuestRoute.tsx`
**Purpose:** Prevents authenticated users from landing on `/login`.
**Used by:** Login route in `src/app/router.tsx`.
**Can be replaced visually:** N/A.
**Contains business logic:** Yes — redirects authenticated users to `state.from` or `/dashboard`.
**Migration note:** Never remove.

---

## Utility Components

### PageContainer
**File:** `src/shared/components/common/PageContainer.tsx`
**Purpose:** `max-w-7xl` centered content container with standard page padding.
**Used by:** Every page component.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### PageHeader
**File:** `src/shared/components/common/PageHeader.tsx`
**Purpose:** Page title + optional description + optional action button(s) row.
**Used by:** Every page.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### SectionCard
**File:** `src/shared/components/common/SectionCard.tsx`
**Purpose:** Titled card container for a page section.
**Used by:** Detail pages, form sections.
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### StatusBadge
**File:** `src/shared/components/common/StatusBadge.tsx`
**Purpose:** Accessible status pill mapping a `tone` to color + text + optional dot.
**Used by:** All list pages and detail pages with status display.
**Can be replaced visually:** Yes — appearance can change.
**Contains business logic:** Tone-to-color mapping. Color is never the only signal (text accompanies it).
**Migration note:** Ensure the replacement still pairs color with text — no color-only status.

### AppLogo
**File:** `src/shared/components/common/AppLogo.tsx`
**Purpose:** Application logo mark. Used in the sidebar header.
**Used by:** `Sidebar`
**Can be replaced visually:** Yes — replace with the purchased template's logo component or the real brand logo.

### FullPageLoader
**File:** `src/shared/components/common/FullPageLoader.tsx`
**Purpose:** Centered spinner shown during session restore in `ProtectedRoute` and `GuestRoute`.
**Used by:** `ProtectedRoute`, `GuestRoute`
**Can be replaced visually:** Yes.
**Contains business logic:** No.

### ToastProvider / ToastItem / ToastViewport
**File:** `src/shared/components/ui/toast.tsx`
**Purpose:** Lightweight context-based toast queue. Renders notifications fixed to bottom-right.
**Used by:** Wired in `src/app/providers.tsx`. Consumed via `useToast()` throughout the app.
**Can be replaced visually:** Yes — toast appearance can be replaced.
**Contains business logic:** Toast queue management, auto-dismiss. `useMutationFeedback` depends on `useToast()`.
**Migration note:** If replacing with a template toast system, ensure `useToast()` from `src/shared/hooks/use-toast.ts` still works or update all callers. Do not break `useMutationFeedback`.

---

## Key Hooks

| Hook | File | Purpose | Business logic? |
|---|---|---|---|
| `useListQueryState` | `src/shared/hooks/use-list-query-state.ts` | URL-synced list-page state (page, limit, search, sort, filters) | Yes — URL parsing |
| `useToast` | `src/shared/hooks/use-toast.ts` | Toast notifications | No |
| `useConfirmDialog` | `src/shared/hooks/use-confirm-dialog.ts` | Confirm dialog open/close + typed target | No |
| `useDebouncedValue` | `src/shared/hooks/use-debounced-value.ts` | Debounce value changes | No |
| `useUnsavedChangesWarning` | `src/shared/hooks/use-unsaved-changes-warning.ts` | `beforeunload` guard for unsaved forms | No |
| `useAuth` | `src/features/auth/use-auth.ts` | Read auth context (login, logout, status) | Yes |
| `useCurrentUser` | `src/features/auth/current-user.tsx` | Read current admin user + `can(permission)` | Yes |
