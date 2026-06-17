# UI Design Handoff — Penguin Beauty Admin Dashboard

## Project Purpose

Penguin Beauty Admin Dashboard is an internal back-office tool for managing a beauty
e-commerce operation. It covers catalog management (categories, brands, products,
product references/SKUs, packs/bundles), personalization (attributes, quiz, recommendation
rules), sales (orders), and a shared media library.

## Admin Dashboard Role

The dashboard is the single interface used by OWNER, ADMIN, and STAFF roles to perform
all operational tasks. There is no public-facing component in this repository. The backend
is a separate service; this project is the frontend consumer of a fixed REST API contract.

## Current Frontend Stack

| Concern | Library / Version |
|---|---|
| Build tool | Vite 8 |
| Framework | React 19 |
| Language | TypeScript 5 (strict mode) |
| Routing | React Router v7 (`createBrowserRouter`) |
| Server state | TanStack Query v5 |
| API client | Orval-generated fetch client from OpenAPI 3.0 spec |
| Forms | React Hook Form v7 + Zod v3 (via `@hookform/resolvers/zod`) |
| UI components | shadcn/ui (source-copied into `src/shared/components/ui/`) |
| Styling | Tailwind CSS v3 with custom CSS variable theme |
| Icons | lucide-react |
| Testing | Vitest v4 + React Testing Library + MSW v2 |
| Package manager | npm |

## Styling System

Tailwind CSS v3 is used with a custom theme defined through CSS variables in
`src/styles/globals.css`. All color tokens are raw HSL channels consumed as
`hsl(var(--token))`. The theme is warm-neutral with a muted aubergine accent.

Design token source: `src/styles/globals.css` and `tailwind.config.ts`.

Full token reference: `docs/DESIGN_SYSTEM.md`.

## Routing Structure

All routes are defined in `src/app/router.tsx`. Route path constants live in
`src/config/routes.ts`. Every route inside the authenticated shell declares a
`handle: { title, breadcrumb }` for document-title and breadcrumb derivation.

```
/login                               — standalone, no shell
/                                    — redirects to /dashboard
/dashboard                           — overview (inside shell)
/categories, /categories/new, /categories/:id/edit
/brands, /brands/new, /brands/:id/edit
/products, /products/new, /products/:productId, /products/:productId/edit
/products/:productId/references
/product-references/:referenceId, /product-references/:referenceId/edit
/packs, /packs/new, /packs/:packId, /packs/:packId/edit
/media
/attributes, /attributes/new, /attributes/:groupId, /attributes/:groupId/edit
/quiz, /quiz/new, /quiz/:questionId/edit
/recommendation-rules, /recommendation-rules/new
/recommendation-rules/preview
/recommendation-rules/:ruleId, /recommendation-rules/:ruleId/edit
/orders, /orders/:orderId
/profile
/forbidden
/* (not found)
```

Full screen inventory: `docs/SCREEN_INVENTORY.md`.

## Authentication Behavior

- Token type: JWT access token, stored in `sessionStorage` (tab-scoped).
- On app boot, `AuthProvider` restores the session via `GET /auth/me`; if invalid the
  token is discarded and the user lands on `/login`.
- `POST /auth/login` then store token then call `GET /auth/me` then populate current-user context.
- Any 401 from any query or mutation triggers full session teardown via a global event bus
  (`src/features/auth/auth-events.ts`) and redirects to `/login`.
- On logout: token cleared from `sessionStorage`, TanStack Query cache flushed.
- No refresh token exists in the current backend contract.
- Token is injected per-request by a registered interceptor in `src/features/auth/auth-interceptor.ts`,
  never embedded in URLs or logged.

Key files:
- `src/features/auth/AuthProvider.tsx` — session lifecycle owner
- `src/features/auth/token-storage.ts` — `sessionStorage` accessors
- `src/features/auth/auth-interceptor.ts` — Bearer injection
- `src/features/auth/ProtectedRoute.tsx` — redirects unauthenticated users
- `src/features/auth/GuestRoute.tsx` — prevents authenticated users from seeing `/login`

## Role-Based Access Behavior

Three roles exist: OWNER, ADMIN, STAFF.

All roles can read every page. Write actions (create, edit, archive, deactivate, media
upload, order status update) are restricted to OWNER and ADMIN. Recommendation preview is
available to all three roles.

Role enforcement in the UI uses:
- `RoleGuard` — route-level redirect to `/forbidden` for unauthorized users
- `PermissionGuard` — inline UI guard that hides write controls for STAFF
- `src/features/auth/roles.ts` — mirrors backend permission matrix

The backend is the authoritative authorization gate. The frontend hides controls for
usability only.

Full matrix: `frontend-handoff/ROLE_PERMISSION_MATRIX.md`.

## API Integration Approach

All HTTP requests flow through one central fetch client: `src/lib/api/http-client.ts`.
This client is the Orval mutator. Components and hooks never call `fetch` directly or
build backend URLs manually.

Every API response error is normalized to an `ApiError` model by `src/lib/api/errors.ts`
before reaching the UI layer. Components never display raw HTTP error payloads.

The base URL is resolved from the typed env module `src/config/env.ts` (Zod-validated
at startup). No production URLs are hardcoded anywhere in source.

## Generated API Client Usage

The typed API client is generated by Orval from `frontend-handoff/openapi.json` into
`src/lib/api/generated/`. This directory is never manually edited.

To regenerate: `npm run api:generate`.

Generated output: one file per tag with `useQuery` hooks for GET endpoints and
`useMutation` hooks for write endpoints, plus a `models/` barrel.

Feature hooks in `src/features/<name>/hooks/` wrap the generated hooks to add
cache-invalidation, UI feedback, and business rules on top.

## TanStack Query Usage

TanStack Query v5 is used for all server state. The QueryClient is created by
`src/lib/api/query-client.ts` which configures:
- No retry on 4xx responses
- Limited retry on network/5xx errors
- Global 401 handler that triggers auth teardown

List pages use `useListQueryState` (URL as source of truth) to supply query params to
the generated list hooks. Detail pages use the generated `useQuery` detail hooks.

Mutations call generated imperative functions and then invalidate relevant query keys.
Invalidation keys match the Orval-generated query-key shape.

## Form Approach

All forms use React Hook Form v7 with Zod v3 validation via `@hookform/resolvers/zod`.

Standard form structure:
1. Define Zod schema (in `<feature>/`).
2. `useForm<T>({ resolver: zodResolver(schema) })`.
3. Wrap with `<Form>` then `<FormLayout>` then `<FormSection>` then fields then `<FormActions>`.
4. Use `useUnsavedChangesWarning(formState.isDirty)` to protect unsaved changes.
5. Submit via `useMutation` + `useMutationFeedback` for automatic toast feedback.

Form field primitives (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)
are in `src/shared/components/ui/form.tsx` and wire accessible `aria-describedby` and
`aria-invalid` automatically.

## Table Approach

`DataTable<TData>` in `src/shared/components/data-table/` is the universal list table.
It uses TanStack Table v8 in server-driven mode — no client-side sorting, filtering, or
pagination. It receives pre-fetched rows and delegates all list state to the URL via
`useListQueryState`.

Inline states (loading, empty, error) are rendered by the component itself. List pages
need no conditional rendering logic.

`DataTablePagination` shows range text, page-size selector, prev/next, and numbered
pages — all derived from a `PaginationMeta` object that mirrors the backend envelope.

`DataTableToolbar` composes `SearchInput` + `SelectFilter` / `DateFilter` + action buttons.

## Media Picker Approach

`MediaPicker` (`src/features/media/`) is the shared asset selector. It supports search,
pagination, single or multi-select, and optional inline upload.

Entity-specific media widgets are still used for catalog attachments:
- Category: `CategoryImageUpload` (cover replace/delete)
- Product: `ProductGallery` (cover + gallery upload, delete, promote, reorder)
- Product reference: `ReferenceSwatchUpload` (single swatch)
- Pack: `PackMediaGallery` (cover + gallery)

All upload flows call entity-specific backend endpoints (multipart). The browser never
uploads directly to Cloudinary.

## Error / Loading / Empty State Approach

Every module uses the shared state components from `src/shared/components/common/`:

| State | Component | Notes |
|---|---|---|
| Loading | `LoadingState` | Variants: `page`, `table`, `cards`, `inline`; announces `role="status" aria-busy` |
| Empty | `EmptyState` | Icon + title + explanation + optional action button |
| Error | `ErrorState` | Friendly message + optional retry; `role="alert"`; never raw stack trace |
| Forbidden | `ForbiddenState` (inline) / `ForbiddenPage` (full page) | 403 states |
| Not found | `NotFoundPage` | 404 inside the shell |

Query state is resolved via `resolveQueryViewState({ isLoading, isError, isEmpty })` from
`src/lib/api/query-state.ts` to a `'loading' | 'error' | 'empty' | 'ready'` discriminant.

Toast notifications use `useToast()` from `src/shared/components/ui/toast.tsx`. Mutation
results surface toasts automatically via `useMutationFeedback`.

---

## Critical Constraint for Future Redesign

The future redesign must preserve business logic and API integration.
**Only the visual layer, layouts, and reusable UI components should be replaced.**

What must never be changed during a visual redesign:
- API calls and their URL shapes
- Auth guards (`ProtectedRoute`, `GuestRoute`, `RoleGuard`)
- Permission guards (`PermissionGuard`)
- Zod validation schemas
- TanStack Query hooks and cache-invalidation keys
- Form submission logic and error handling
- Route structure (unless intentionally migrated)
- `sessionStorage` token handling
- 401 global handler
- OpenAPI files
- Orval-generated files

What may be visually replaced:
- Buttons, inputs, selects, checkboxes
- Cards, dialogs, sheets, drawers
- Sidebar layout and nav appearance
- Dashboard overview cards and charts
- Table styling (not table logic)
- Form layout chrome (not field wiring)
- Toast appearance
- Typography, spacing, colors, shadows

See `docs/TEMPLATE_ADAPTATION_GUIDE.md` for a safe step-by-step migration process.
