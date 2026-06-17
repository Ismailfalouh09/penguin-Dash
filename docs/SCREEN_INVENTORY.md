# Screen Inventory — Penguin Beauty Admin Dashboard

All screens that exist in the admin dashboard as of Task 15. Each entry documents the
route, page name, purpose, API dependencies, main components, role access, UI states,
and notes for a future visual redesign.

---

## /login

**Page:** Login Page
**File:** `src/pages/LoginPage.tsx`
**Purpose:** Authenticate an admin user and start a session.
**API dependencies:**
- `POST /auth/login` — submit credentials, receive JWT
- `GET /auth/me` — load current user after successful login
**Main components:** `LoginPage`, `GuestRoute`, React Hook Form + Zod
**Role access:** Unauthenticated only. `GuestRoute` redirects already-authenticated users away.
**UI states:** Idle form, submitting (spinner), 401 wrong-credentials inline message, generic API error
**Notes for redesign:** Replace card layout and input styling freely. Preserve: form validation, `useAuth().login` call, redirect-after-login behavior. Do not add "remember me" without backend refresh-token support.

---

## /dashboard

**Page:** Dashboard Overview
**File:** `src/pages/DashboardOverviewPage.tsx`
**Purpose:** Operational summary — recent activity, key metrics, quick navigation.
**API dependencies:** Dashboard summary/analytics endpoints (if wired); may show static cards if not yet connected.
**Main components:** `PageContainer`, `PageHeader`, metric cards, recent orders section
**Role access:** OWNER, ADMIN, STAFF (all roles)
**UI states:** Loading skeletons, populated metric cards, empty-data states
**Notes for redesign:** Dashboard overview cards and charts are the most visually replaceable section of the entire app. Keep any real API calls wired; do not replace with hardcoded fake data.

---

## /categories

**Page:** Categories List
**File:** `src/pages/catalog/CategoriesPage.tsx`
**Purpose:** Browse, search, filter, and deactivate product categories.
**API dependencies:** `GET /admin/categories`
**Main components:** `DataTable`, `DataTableToolbar`, `DataTablePagination`, `SearchInput`, `SelectFilter` (isActive), `ConfirmDialog`, `PermissionGuard`
**Role access:** OWNER, ADMIN, STAFF (all read); OWNER + ADMIN see New/Deactivate actions
**UI states:** Loading skeleton, empty state, error state, populated table, deactivate confirm dialog
**Notes for redesign:** Table styling is fully replaceable. Preserve `useListQueryState` hook wiring, deactivate confirmation, and `PermissionGuard` on write actions.

---

## /categories/new

**Page:** New Category Form
**File:** `src/pages/catalog/CategoryNewPage.tsx`
**Purpose:** Create a new product category.
**API dependencies:** `POST /admin/categories`
**Main components:** `PageHeader`, `CategoryForm`, `FormLayout`, `FormSection`, `FormActions`
**Role access:** OWNER, ADMIN only (STAFF redirected to /forbidden)
**UI states:** Clean form, submitting state, validation errors, success toast + redirect
**Notes for redesign:** Form chrome is replaceable. Preserve Zod schema, RHF wiring, submit mutation, and unsaved-changes warning.

---

## /categories/:id/edit

**Page:** Edit Category Form
**File:** `src/pages/catalog/CategoryEditPage.tsx`
**Purpose:** Edit an existing category, replace or remove its image.
**API dependencies:** `GET /admin/categories/:id`, `PATCH /admin/categories/:id`, `PUT /admin/categories/:categoryId/image`, `DELETE /admin/categories/:categoryId/image`
**Main components:** `PageHeader`, `CategoryImageUpload`, `CategoryForm`, `LoadingState`, `ErrorState`
**Role access:** OWNER, ADMIN only
**UI states:** Loading detail, error loading, image upload/preview, image delete confirm, form submitting, success toast
**Notes for redesign:** Image upload widget can be visually restyled. Preserve upload mutation, delete confirm, and query invalidation.

---

## /brands

**Page:** Brands List
**File:** `src/pages/catalog/BrandsPage.tsx`
**Purpose:** Browse, search, filter, and deactivate product brands.
**API dependencies:** `GET /admin/brands`
**Main components:** `DataTable`, `DataTableToolbar`, `DataTablePagination`, `SearchInput`, `SelectFilter` (isActive), `ConfirmDialog`
**Role access:** All roles read; OWNER + ADMIN see write actions
**UI states:** Loading, empty, error, populated table, deactivate confirm
**Notes for redesign:** Same pattern as Categories List. No brand logo upload (no backend contract).

---

## /brands/new

**Page:** New Brand Form
**File:** `src/pages/catalog/BrandNewPage.tsx`
**Purpose:** Create a new brand.
**API dependencies:** `POST /admin/brands`
**Main components:** `BrandForm`, `FormLayout`, `FormSection`, `FormActions`
**Role access:** OWNER, ADMIN only
**UI states:** Clean form, submitting, validation errors, success
**Notes for redesign:** Same pattern as New Category.

---

## /brands/:id/edit

**Page:** Edit Brand Form
**File:** `src/pages/catalog/BrandEditPage.tsx`
**Purpose:** Edit an existing brand's details.
**API dependencies:** `GET /admin/brands/:id`, `PATCH /admin/brands/:id`
**Main components:** `BrandForm`, `LoadingState`, `ErrorState`
**Role access:** OWNER, ADMIN only
**UI states:** Loading, error, form ready, submitting, success
**Notes for redesign:** No image section (no backend contract). Straightforward form page.

---

## /products

**Page:** Products List
**File:** `src/pages/catalog/ProductsPage.tsx`
**Purpose:** Browse, search, filter by status and active state, and archive products.
**API dependencies:** `GET /admin/products`
**Main components:** `DataTable`, `DataTableToolbar`, `DataTablePagination`, `SearchInput`, `SelectFilter` (status: DRAFT/ACTIVE/ARCHIVED), `SelectFilter` (isActive), `ConfirmDialog`
**Role access:** All roles read; OWNER + ADMIN see New/Edit/Archive actions
**UI states:** Loading, empty, error, populated table, archive confirm dialog
**Notes for redesign:** Status badge column uses semantic colors — preserve the tone mapping. Archive differs from deactivate (no reactivation from UI for archived products).

---

## /products/new

**Page:** New Product Form
**File:** `src/pages/catalog/ProductFormPage.tsx` (create mode)
**Purpose:** Create a new product with name, slug, pricing, category, brand, and status.
**API dependencies:** `GET /admin/categories`, `GET /admin/brands`, `POST /admin/products`
**Main components:** `ProductForm`, `FormLayout`, `FormSection`, `FormActions`, `Select` (category + brand)
**Role access:** OWNER, ADMIN only (STAFF sees `ForbiddenState` inline)
**UI states:** Form with loading selects, slug auto-generation, submitting, validation errors, success toast + redirect
**Notes for redesign:** Slug auto-generation logic lives in `ProductForm.tsx` — do not lose it during visual replacement. Brand `__none__` sentinel must be preserved for Radix Select compatibility.

---

## /products/:productId

**Page:** Product Detail (read-only)
**File:** `src/pages/catalog/ProductDetailPage.tsx`
**Purpose:** Read-only view of product info, pricing, gallery, and reference summary.
**API dependencies:** `GET /admin/products/:id`
**Main components:** `PageHeader`, `SectionCard`, `ProductGallery`, references summary table, `StatusBadge`, `PermissionGuard`
**Role access:** All roles read; OWNER + ADMIN see Edit + Archive actions + gallery write controls
**UI states:** Loading, error, product detail with gallery and references summary
**Notes for redesign:** The references summary table is not the full references list (that lives on /references). Gallery write controls require `media:manage`.

---

## /products/:productId/edit

**Page:** Edit Product Form
**File:** `src/pages/catalog/ProductFormPage.tsx` (edit mode)
**Purpose:** Edit a product's details and manage its gallery in one combined page.
**API dependencies:** `GET /admin/products/:id`, `PATCH /admin/products/:id`, gallery endpoints
**Main components:** `ProductForm`, `ProductGallery`, `FormLayout`, `FormActions`, `LoadingState`, `ErrorState`
**Role access:** OWNER, ADMIN only
**UI states:** Loading product, error, form ready + gallery, submitting form, gallery operations in progress
**Notes for redesign:** Gallery and form are on the same page. This is by design — do not split into separate pages unless re-architecting the route.

---

## /products/:productId/references

**Page:** Product References List
**File:** `src/pages/catalog/ProductReferencesPage.tsx`
**Purpose:** List, search, filter, and manage SKU variants (references) for a product.
**API dependencies:** `GET /admin/products/:id`, `GET /admin/products/:productId/references`, `DELETE /admin/product-references/:id`
**Main components:** `DataTable`, `DataTableToolbar`, `DataTablePagination`, `SearchInput`, `SelectFilter` (isActive, inStock), `ConfirmDialog`
**Role access:** All roles read; OWNER + ADMIN see New/Edit/Stock/Deactivate actions
**UI states:** Loading product name, loading references, empty, error, reference table, deactivate confirm
**Notes for redesign:** Breadcrumb shows product name. This is a product-scoped sub-page.

---

## /product-references/:referenceId

**Page:** Reference Detail (read-only)
**File:** `src/pages/catalog/ProductReferenceDetailPage.tsx`
**Purpose:** Read-only view of a reference's details, stock, compatibility, and swatch.
**API dependencies:** `GET /admin/product-references/:id`
**Main components:** `PageHeader`, `SectionCard`, compatibility attributes display, swatch display, stock display
**Role access:** All roles read; OWNER + ADMIN see edit/deactivate/stock actions
**UI states:** Loading, error, detail view
**Notes for redesign:** Compatibility attribute list renders attribute groups with match type and score. Straightforward detail layout.

---

## /product-references/:referenceId/edit

**Page:** Edit Reference Form
**File:** `src/pages/catalog/ProductReferenceEditPage.tsx`
**Purpose:** Edit a reference's pricing, flags, compatibility attributes, and swatch.
**API dependencies:** `GET /admin/product-references/:id`, `PATCH /admin/product-references/:id`, `GET /admin/attributes`, swatch media endpoints
**Main components:** `ReferenceForm`, `CompatibilityEditor`, `ReferenceSwatchUpload`, `StockUpdateDialog`
**Role access:** OWNER, ADMIN only
**UI states:** Loading reference, error, form with compatibility editor, swatch upload, stock dialog
**Notes for redesign:** `referenceCode` is read-only in edit mode. `CompatibilityEditor` loads real attribute groups — preserve those API calls.

---

## /packs

**Page:** Packs List
**File:** `src/pages/catalog/PacksPage.tsx`
**Purpose:** Browse, search, filter, and archive product bundles.
**API dependencies:** `GET /admin/packs`
**Main components:** `DataTable`, `DataTableToolbar`, `DataTablePagination`, `SearchInput`, `SelectFilter` (status, isActive, priceMode), `ConfirmDialog`
**Role access:** All roles read; OWNER + ADMIN see New/Edit/Archive actions
**UI states:** Loading, empty, error, populated table, archive confirm
**Notes for redesign:** Packs have a `priceMode` filter (FIXED, CALCULATED) in addition to status/active filters.

---

## /packs/new

**Page:** New Pack Form
**File:** `src/pages/catalog/PackFormPage.tsx` (create mode)
**Purpose:** Create a new bundle with identity, pricing, pack items, and compatibility attributes.
**API dependencies:** `GET /admin/products`, `GET /admin/attributes`, `POST /admin/packs`
**Main components:** `PackForm`, `PackItemsEditor`, `PackCompatibilityEditor`, `FormLayout`, `FormActions`
**Role access:** OWNER, ADMIN only
**UI states:** Loading product/attribute data, form ready, submitting, validation errors, success
**Notes for redesign:** Pack items editor loads active products + their active references. Compatibility editor loads product attribute groups. Both depend on real API calls.

---

## /packs/:packId

**Page:** Pack Detail
**File:** `src/pages/catalog/PackDetailPage.tsx`
**Purpose:** Read-only view of a pack's details, items, compatibility, and media gallery.
**API dependencies:** `GET /admin/packs/:id`
**Main components:** `PageHeader`, `SectionCard`, `PackMediaGallery`, pack items table, compatibility attributes display
**Role access:** All roles read; OWNER + ADMIN see Edit/Archive actions + gallery write controls
**UI states:** Loading, error, detail with gallery
**Notes for redesign:** Gallery write controls require both `write` and `media:manage`. Same gallery pattern as products.

---

## /packs/:packId/edit

**Page:** Edit Pack Form
**File:** `src/pages/catalog/PackFormPage.tsx` (edit mode)
**Purpose:** Edit a pack's identity, items, compatibility attributes, and gallery.
**API dependencies:** `GET /admin/packs/:id`, `PATCH /admin/packs/:id`, pack media endpoints
**Main components:** `PackForm`, `PackItemsEditor`, `PackCompatibilityEditor`, `PackMediaGallery`
**Role access:** OWNER, ADMIN only
**UI states:** Loading pack, error, form + gallery, submitting, success
**Notes for redesign:** Combined form + gallery page, same design principle as ProductFormPage.

---

## /media

**Page:** Media Library
**File:** `src/pages/catalog/MediaPage.tsx`
**Purpose:** Browse, upload, inspect, and soft-delete shared media assets.
**API dependencies:** `GET /admin/media`, `POST /admin/media/upload`, `GET /admin/media/:id`, `PATCH /admin/media/:id`, `DELETE /admin/media/:id`
**Main components:** Media grid/list, `MediaUploadDialog`, `MediaDetailSheet`, `SearchInput`, pagination
**Role access:** All roles can list/inspect; OWNER + ADMIN can upload, edit metadata, and delete
**UI states:** Loading grid, empty, error, asset grid, upload dialog, detail sheet, delete confirm
**Notes for redesign:** Soft-delete behavior — deleted assets are hidden from the list unless `includeDeleted` is toggled. The `MediaDetailSheet` edits alt text only; it does not re-upload images.

---

## /attributes

**Page:** Attribute Groups List
**File:** `src/pages/personalization/AttributesPage.tsx`
**Purpose:** Browse, search, filter, and deactivate attribute groups.
**API dependencies:** `GET /admin/attributes`
**Main components:** `DataTable`, `DataTableToolbar`, `SearchInput`, `SelectFilter` (isActive), `ConfirmDialog`
**Role access:** All roles read; OWNER + ADMIN see New/Deactivate actions
**UI states:** Loading, empty, error, table, deactivate confirm
**Notes for redesign:** Standard list page pattern. No image upload for attribute groups.

---

## /attributes/:groupId

**Page:** Attribute Group Detail (with attribute options)
**File:** `src/pages/personalization/AttributeGroupDetailPage.tsx`
**Purpose:** View an attribute group's details and manage its options inline.
**API dependencies:** `GET /admin/attributes/:id`, `GET /admin/attributes/:attributeGroupId/options`, option write endpoints
**Main components:** `SectionCard`, `DataTable` (for options), inline create/edit dialogs
**Role access:** All roles read; OWNER + ADMIN can create/edit/deactivate options
**UI states:** Loading group, loading options, error, detail + option table
**Notes for redesign:** Options are managed inline on the detail page, not on separate form pages.

---

## /attributes/new

**Page:** New Attribute Group Form
**File:** `src/pages/personalization/AttributeGroupNewPage.tsx`
**Purpose:** Create a new attribute group.
**API dependencies:** `POST /admin/attributes`
**Main components:** `AttributeGroupForm`, `FormLayout`, `FormSection`, `FormActions`
**Role access:** OWNER, ADMIN only
**UI states:** Clean form, submitting, success
**Notes for redesign:** Standard form page pattern.

---

## /attributes/:groupId/edit

**Page:** Edit Attribute Group Form
**File:** `src/pages/personalization/AttributeGroupEditPage.tsx`
**Purpose:** Edit an existing attribute group's code and name.
**API dependencies:** `GET /admin/attributes/:id`, `PATCH /admin/attributes/:id`
**Main components:** `AttributeGroupForm`, `LoadingState`, `ErrorState`
**Role access:** OWNER, ADMIN only
**UI states:** Loading, error, form ready, submitting
**Notes for redesign:** Standard edit form page.

---

## /quiz

**Page:** Quiz Questions List
**File:** `src/pages/personalization/QuizPage.tsx`
**Purpose:** Browse, search, filter, deactivate, and reorder quiz questions.
**API dependencies:** `GET /admin/quiz/questions`, `PATCH /admin/quiz/questions/reorder`
**Main components:** `DataTable`, `DataTableToolbar`, `SearchInput`, `SelectFilter` (status), `ConfirmDialog`, `QuizReorderDialog`
**Role access:** All roles read; OWNER + ADMIN see New/Deactivate/Reorder actions
**UI states:** Loading, empty, error, question table, deactivate confirm, reorder dialog
**Notes for redesign:** Reorder dialog uses up/down list UI and submits a full reorder payload. Preserve the reorder mutation.

---

## /quiz/new

**Page:** New Quiz Question Form
**File:** `src/pages/personalization/QuizQuestionNewPage.tsx`
**Purpose:** Create a new quiz question linked to an attribute group.
**API dependencies:** `GET /admin/attributes`, `GET /admin/attributes/:groupId/options`, `POST /admin/quiz/questions`
**Main components:** `QuizQuestionForm`, `FormLayout`, `FormSection`, `FormActions`
**Role access:** OWNER, ADMIN only
**UI states:** Loading attribute groups, cascading option load on group selection, submitting
**Notes for redesign:** Attribute group selection loads options from the backend dynamically. Preserve that cascade.

---

## /quiz/:questionId/edit

**Page:** Edit Quiz Question Form
**File:** `src/pages/personalization/QuizQuestionEditPage.tsx`
**Purpose:** Edit a quiz question's text and linked options. Attribute group is immutable after creation.
**API dependencies:** `GET /admin/quiz/questions/:id`, `PATCH /admin/quiz/questions/:id`
**Main components:** `QuizQuestionForm`, `LoadingState`, `ErrorState`
**Role access:** OWNER, ADMIN only
**UI states:** Loading question, error, form with disabled attribute group field
**Notes for redesign:** The attribute group field is visually disabled in edit mode by design — do not remove that constraint.

---

## /recommendation-rules

**Page:** Recommendation Rules List
**File:** `src/pages/personalization/RecommendationRulesPage.tsx`
**Purpose:** Browse, search, filter by isActive/targetType/conditionType, deactivate rules, and launch preview.
**API dependencies:** `GET /admin/recommendation-rules`
**Main components:** `DataTable`, `DataTableToolbar`, `SearchInput`, `SelectFilter` (isActive, targetType, conditionType), `ConfirmDialog`
**Role access:** All roles read; OWNER + ADMIN see New/Edit/Deactivate; all roles see Preview action
**UI states:** Loading, empty, error, rules table, deactivate confirm
**Notes for redesign:** Three separate `SelectFilter` components for isActive, targetType, and conditionType. Preview button appears for all roles.

---

## /recommendation-rules/new

**Page:** New Recommendation Rule Form
**File:** `src/pages/personalization/RecommendationRuleNewPage.tsx`
**Purpose:** Create a new recommendation rule.
**API dependencies:** `POST /admin/recommendation-rules`
**Main components:** `RecommendationRuleForm`, `FormLayout`, `FormSection`, `FormActions`
**Role access:** OWNER, ADMIN only
**UI states:** Clean form, submitting, success
**Notes for redesign:** Rule `code` is set on create and immutable thereafter — this is a backend constraint, not UI choice.

---

## /recommendation-rules/preview

**Page:** Recommendation Rule Preview
**File:** `src/pages/personalization/RecommendationRulePreviewPage.tsx`
**Purpose:** Preview recommendation results for a customer profile without creating a persistent session.
**API dependencies:** `POST /admin/recommendation-rules/preview`
**Main components:** `PageHeader`, profile ID input, results panel (ranked packs, match%, total score, reason summary, selected items)
**Role access:** OWNER, ADMIN, STAFF (all roles)
**UI states:** Input form, previewing (loading), results display, error
**Notes for redesign:** Preview is non-persistent. Do not reimplement scoring in the frontend. Results come from the backend response as-is.

---

## /recommendation-rules/:ruleId

**Page:** Recommendation Rule Detail
**File:** `src/pages/personalization/RecommendationRuleDetailPage.tsx`
**Purpose:** Read-only view of a rule's code, name, target, condition, score, weight, and status.
**API dependencies:** `GET /admin/recommendation-rules/:id`
**Main components:** `PageHeader`, `SectionCard`, `StatusBadge`, `PermissionGuard`
**Role access:** All roles read; OWNER + ADMIN see Edit action
**UI states:** Loading, error, rule detail
**Notes for redesign:** Standard detail page.

---

## /recommendation-rules/:ruleId/edit

**Page:** Edit Recommendation Rule Form
**File:** `src/pages/personalization/RecommendationRuleEditPage.tsx`
**Purpose:** Edit an existing recommendation rule. Rule code is immutable.
**API dependencies:** `GET /admin/recommendation-rules/:id`, `PATCH /admin/recommendation-rules/:id`
**Main components:** `RecommendationRuleForm`, `LoadingState`, `ErrorState`
**Role access:** OWNER, ADMIN only
**UI states:** Loading rule, error, form with read-only code field
**Notes for redesign:** Rule code rendered read-only in edit mode — preserve that constraint.

---

## /orders

**Page:** Orders List
**File:** `src/pages/sales/OrdersPage.tsx`
**Purpose:** Browse, search, and filter orders; update order status from list.
**API dependencies:** `GET /admin/orders`
**Main components:** `DataTable`, `DataTableToolbar`, `SearchInput`, `SelectFilter` (paymentStatus, deliveryStatus), `UpdateOrderStatusDialog`
**Role access:** All roles read; OWNER + ADMIN see status-update action
**UI states:** Loading, empty, error, orders table, status-update dialog
**Notes for redesign:** Order columns include customer summary, delivery summary, pack, totals, and status badges. Two separate status columns (payment + delivery).

---

## /orders/:orderId

**Page:** Order Detail
**File:** `src/pages/sales/OrderDetailPage.tsx`
**Purpose:** Full order detail — customer info, delivery info, ordered items, totals, and status history timeline.
**API dependencies:** `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status`
**Main components:** `PageHeader`, `SectionCard`, order items table, status history timeline, `UpdateOrderStatusDialog`
**Role access:** All roles read; OWNER + ADMIN see status-update action
**UI states:** Loading, error, full order detail
**Notes for redesign:** Sections are shown defensively — if the backend omits customer or delivery data, those sections hide rather than crash. Timeline is a key UX element; preserve it.

---

## /profile

**Page:** Admin Profile
**File:** `src/pages/account/ProfilePage.tsx`
**Purpose:** Show the current admin user's details (name, email, role).
**API dependencies:** `GET /auth/me` (via `useCurrentUser()` context)
**Main components:** `PageContainer`, `PageHeader`, `SectionCard`, user info fields
**Role access:** All roles (authenticated users only)
**UI states:** Profile data display (no edit form in current implementation)
**Notes for redesign:** Profile data comes from `useCurrentUser()` which reads from the auth context. No separate API call needed.

---

## /forbidden

**Page:** Forbidden (403)
**File:** `src/pages/ForbiddenPage.tsx`
**Purpose:** Tell the user they lack permission for the requested page.
**API dependencies:** None
**Main components:** `PageContainer`, icon, message, back-to-dashboard link
**Role access:** Any authenticated user who hits a `RoleGuard` redirect
**UI states:** Static
**Notes for redesign:** Should remain inside the dashboard shell (with sidebar). Visual replacement is straightforward.

---

## /* (not found)

**Page:** Not Found (404)
**File:** `src/pages/NotFoundPage.tsx`
**Purpose:** Catch all unmatched routes and guide the user back.
**API dependencies:** None
**Main components:** `PageContainer`, icon, message, back-to-dashboard link
**Role access:** Any user (including unauthenticated)
**UI states:** Static
**Notes for redesign:** Rendered inside the shell for authenticated sessions. Simple page.

---

## Dev-only Pages (not in sidebar, not in production navigation)

| Route | File | Purpose |
|---|---|---|
| `/diagnostics` | `src/pages/DiagnosticsPage.tsx` | API config + health probe for development |
| `/components-demo` | `src/pages/ComponentsDemoPage.tsx` | Live demo of all shared UI components |
