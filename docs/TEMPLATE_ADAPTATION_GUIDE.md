# Template Adaptation Guide — Penguin Beauty Admin Dashboard

A guide for a future agent or developer who will integrate a purchased admin dashboard
template into this project. Follow this process carefully to avoid breaking API
integration, authentication, authorization, or business logic.

---

## Critical Warning

> **Never paste the full purchased template directly over the project.**
> **Never replace business pages without preserving API behavior.**
> **Never keep fake template data in production pages.**

Violating any of these rules will cause silent regressions: forms that appear to work
but do not save data, pages that render with fake content instead of real API responses,
and auth guards that appear to function but no longer protect routes.

---

## Rules for Future UI Redesign Agents

The following rules apply to any agent or developer performing a visual redesign:

1. **Do not modify backend code.** This project is frontend-only. The backend is a separate service.
2. **Do not modify OpenAPI files.** `frontend-handoff/openapi.json` and `frontend-handoff/openapi.yaml` are the contract. They are read-only.
3. **Do not manually edit generated API files.** `src/lib/api/generated/` is Orval output. Run `npm run api:generate` to regenerate. Never hand-edit these files.
4. **Do not remove auth guards.** `ProtectedRoute` and `GuestRoute` in `src/features/auth/` must remain on their routes.
5. **Do not remove role guards.** `RoleGuard` wraps must remain on all role-restricted routes.
6. **Do not remove backend validation handling.** Zod schemas validate forms client-side; backend errors surface via `useMutationFeedback`. Neither may be removed.
7. **Do not replace real API calls with fake template data.** Template demo pages often have hardcoded JSON arrays. Never use these as a data source for production pages.
8. **Do not introduce direct Cloudinary upload.** All media upload goes through the backend (`POST /admin/media/upload` or entity-specific endpoints). Direct browser-to-Cloudinary upload is not supported by the backend contract.
9. **Do not add analytics or tracking scripts without user approval.** No third-party tracking scripts may be added without explicit approval.
10. **Do not hardcode production API URLs.** The base URL is set in `.env` via `VITE_API_BASE_URL` and validated by `src/config/env.ts`. No URL may be hardcoded in source.
11. **Do not commit `.env`.** The `.env` file is listed in `.gitignore` and must never be committed.
12. **Do not expose tokens or secrets.** JWT tokens are stored in `sessionStorage` only. They must never appear in logs, URLs, `localStorage`, or HTML.
13. **Do not change business logic while redesigning UI.** Slug auto-generation, `isDefault` reference behavior, product archive cascade, quiz reorder payload, recommendation preview non-persistence — these are business rules, not incidental code. Leave them alone.

---

## Template Selection Checklist

Use this checklist before purchasing or adopting an admin template.

### Compatibility

- [ ] **React compatible** — the template is built for React (not Vue, Angular, or server-rendered HTML)
- [ ] **TypeScript compatible preferred** — template ships TypeScript source or has type definitions
- [ ] **Tailwind CSS compatible preferred** — template uses Tailwind v3 or can be restyled with Tailwind without major conflict
- [ ] **No forced backend** — the template does not require a specific backend, CMS, or auth service
- [ ] **No dependency conflict with current stack** — check that it does not introduce conflicting versions of React, React Router, TanStack Query, or Radix UI

### Component Quality

- [ ] **Good tables** — has a clean, responsive data table component
- [ ] **Good forms** — has form layout, labels, validation error display, and field components
- [ ] **Good dialogs/drawers** — has accessible modal dialogs and side sheets
- [ ] **Good dashboard cards** — metric cards, stat tiles, and summary panels
- [ ] **Clean sidebar navigation** — collapsible sidebar with group headings and nested items
- [ ] **Mobile responsive** — sidebar collapses to a drawer or bottom nav on small screens
- [ ] **Easy to extract components** — components are isolated enough to be used individually, not coupled to a global state manager you don't need

### Practical Concerns

- [ ] **No heavy unnecessary dependencies** — does not force chart libraries, map libraries, CMS clients, or full auth suites you will not use
- [ ] **License allows commercial use** — verify the purchased license permits use in a commercial admin tool
- [ ] **Clean demo pages** — demo pages with fake data are clearly separated from reusable component files and easy to delete

---

## Recommended Adaptation Process

### Step 1 — Inspect the Purchased Template

Before writing any code:

1. Read the template's README and license.
2. Identify which parts are reusable layout/component code and which are demo pages with fake data.
3. Confirm the template does not introduce React Router v6/v7 conflicts or replace TanStack Query with a different state manager.
4. List every template component you intend to reuse.
5. List every template component you will not use (mark these for deletion after extraction).

Do not install the template into the project yet.

### Step 2 — Identify Reusable Layout and Components

From the template, identify which components can replace current visual-only components:

**High-value replacements:**
- Sidebar layout → replaces `Sidebar.tsx`, `SidebarNav.tsx`, `MobileNav.tsx`
- Header layout → replaces `Header.tsx`
- Dashboard cards/metric tiles → replaces the overview page card components
- Table chrome (borders, row styling, header) → wraps `DataTable.tsx`
- Dialog/sheet appearances → wraps `ConfirmDialog.tsx` and `MediaDetailSheet.tsx`
- Button, Input, Select, Checkbox components → replaces shadcn/ui primitives

**Do not replace:**
- `DataTable.tsx` core logic (TanStack Table server-driven wiring)
- `DataTablePagination.tsx` pagination calculation
- `useListQueryState` hook
- Auth components (`ProtectedRoute`, `GuestRoute`, `RoleGuard`)
- Permission components (`PermissionGuard`)
- Form wiring primitives (`FormField`, `FormControl`, `FormMessage`)
- `useMutationFeedback`

### Step 3 — Map Template Components to Existing Components

Before writing code, create a mapping table like this:

| Current component | Template replacement | Action |
|---|---|---|
| `Sidebar.tsx` | `TemplateSidebar` | Replace visual chrome; keep `getNavigationForRole` call |
| `Button` (shadcn) | `TemplateButton` | Replace; same props API preferred |
| `DataTable` chrome | `TemplateTable` styles | Restyle only; keep TanStack wiring |
| `ConfirmDialog` | `TemplateModal` | Replace appearance; keep `isPending` logic |
| `StatusBadge` | `TemplateBadge` | Replace appearance; keep tone → color mapping |
| `EmptyState` | `TemplateEmpty` | Replace appearance |
| `LoadingState` | Template skeleton | Replace; keep `role="status" aria-busy` |

Document this mapping before implementing. It prevents accidental logic loss.

### Step 4 — Replace Visual Components Gradually

Migrate one component type at a time. Never do a big-bang swap.

Recommended order:
1. Global typography and color tokens (`globals.css`, `tailwind.config.ts`)
2. Layout shell (Sidebar, Header, MobileNav)
3. Shared primitive components (Button, Input, Card, Badge)
4. Table chrome (keep logic, replace styling)
5. Dialog/sheet appearances
6. Page state components (EmptyState, LoadingState, ErrorState)
7. Dashboard overview cards
8. Feature-specific visual components (gallery, media picker appearance)

After each group: run `npm run build` and `npm test` to verify nothing broke.

### Step 5 — Keep API, Auth, Routing, and Business Logic Unchanged

At every step, verify:
- All list pages still call `useListQueryState` and pass params to query hooks.
- All form pages still use `useForm` + Zod schema + `useMutationFeedback`.
- All route definitions still have `ProtectedRoute`, `RoleGuard`, and `GuestRoute` where applicable.
- `PermissionGuard` still wraps every write-action button.
- `useAuth().logout` is still called from the user menu sign-out.
- Upload flows still call entity-specific backend endpoints; no direct Cloudinary calls added.

### Step 6 — Verify Each Module Manually

After migrating the shell and shared components, verify each module end-to-end:

- [ ] Login → session starts, redirect to dashboard
- [ ] Dashboard → loads without errors
- [ ] Categories → list loads, search works, deactivate works, image upload works
- [ ] Brands → list loads, create/edit works
- [ ] Products → list loads, create with slug auto-gen, edit + gallery, archive
- [ ] Product References → reference list, create, edit, stock update, swatch
- [ ] Packs → list, create with items + compatibility, edit, archive, media gallery
- [ ] Media Library → browse, upload, edit alt text, soft delete
- [ ] Attributes → group list, group detail with options, quiz questions
- [ ] Recommendation Rules → list, create, edit, preview
- [ ] Orders → list, detail, status update
- [ ] Profile → shows current user
- [ ] Forbidden page → accessible via `/forbidden`
- [ ] Not found page → accessible via any unknown route
- [ ] Role behavior → STAFF cannot see write controls; ADMIN/OWNER can

### Step 7 — Remove Unused Template Demo Pages and Fake Data

After migration:
1. Delete all template demo pages (calendar, invoice, user management, etc.) that are not part of this application.
2. Delete any static JSON fixture files from the template.
3. Delete unused template components.
4. Search the codebase for any hardcoded template data that might have crept in: `grep -r "Lorem ipsum\|fake\|mock data\|demo" src/pages/`.
5. Verify `npm run build` produces no import errors from deleted files.

### Step 8 — Update Documentation and Commit

1. Update `docs/DESIGN_SYSTEM.md` with the new template's color tokens, typography, and spacing.
2. Update `docs/COMPONENT_INVENTORY.md` to reflect which components were replaced.
3. Update `docs/SCREEN_INVENTORY.md` if any route changed.
4. Run `npm run build` → clean.
5. Run `npm test` → all tests pass.
6. Commit: `git commit -m "feat: replace UI shell with [template name]"`.

---

## What Can Be Replaced vs. What Must Be Preserved

### Can be replaced

| Category | Examples |
|---|---|
| Buttons | Appearance, hover states, loading spinners |
| Cards | Background, border, shadow, padding |
| Tables | Row styling, header appearance, cell borders |
| Sidebar layout | Width, collapse animation, section headers |
| Dashboard cards | Metric tile layout and chart components |
| Dialog visuals | Modal backdrop, border radius, header styling |
| Form styling | Field borders, focus rings, label positioning |
| Toast appearance | Position, animation, icon, colors |
| Color tokens | Primary, secondary, accent, background colors |
| Typography | Font family, sizes, weights |
| Spacing scale | If template uses a different spacing system |
| Loading skeletons | Shape and animation |
| Empty state illustrations | Icon or image, layout |
| Error state illustrations | Icon, layout |
| Badge appearance | Colors, border, dot style |

### Must be preserved

| Category | Reason |
|---|---|
| `ProtectedRoute` | Session required for all admin routes |
| `GuestRoute` | Prevents re-login loops |
| `RoleGuard` | Route-level authorization |
| `PermissionGuard` | Write action visibility control |
| `useAuth().login` | Backend login mutation + token storage |
| `useAuth().logout` | Token clear + cache flush |
| `AuthProvider` | Session lifecycle owner |
| `src/lib/api/http-client.ts` | Single HTTP client, auth interceptor |
| `src/lib/api/errors.ts` | Error normalization |
| `src/lib/api/generated/` | Generated API client (never edit) |
| Zod schemas | Form validation |
| `useListQueryState` | URL-synced list state |
| `useMutationFeedback` | Automatic toast on mutation result |
| TanStack Query keys | Cache invalidation correctness |
| `sessionStorage` token | Tab-scoped, secure token storage |
| Route structure | Unless intentionally re-architected |
| `src/config/env.ts` | Typed, validated env access |
| `src/config/navigation.ts` | Role-aware nav config |

---

## Frequently Asked Questions

**Can I replace React Router with the template's built-in router?**
No. The routing is already established with React Router v7 data router features (`useMatches`, route handles for breadcrumbs, nested layouts). Replacing it would require a full route migration.

**Can I replace TanStack Query with the template's data-fetching approach?**
No. All feature hooks and the Orval-generated client depend on TanStack Query v5. Replacing it would break every data hook in the application.

**Can I use the template's auth system instead of the current one?**
No. The auth system is tightly coupled to the backend JWT contract (`POST /auth/login`, `GET /auth/me`, Bearer injection). The template's auth must be removed and the existing `AuthProvider` preserved.

**Can I add a new page from the template (e.g., a calendar or analytics page)?**
Only if it uses real backend endpoints or is explicitly a dev/demo page marked non-production. Never add a page that renders hardcoded fake data and presents it as real.

**Can I change the route paths?**
Only if you update `src/config/routes.ts`, `src/app/router.tsx`, and all navigation references simultaneously, and if you do not remove any existing routes.
