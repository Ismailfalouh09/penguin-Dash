# Frontend Roadmap — Penguin Beauty Admin Dashboard

## Status

| Task | Description | Status |
|---|---|---|
| **Task 1** | Foundation — Vite + React + TypeScript + Router + Query + Tailwind + shadcn + Testing | ✅ **Completed** |
| **Task 2** | Dashboard Conception & Design System — sitemap, routes, navigation config, responsive shell, design tokens, shared UI states, placeholder pages | ✅ **Completed** |
| **Task 3** | Backend API Integration Foundation — Orval-generated typed client, central HTTP client, error normalization, TanStack Query integration, MSW foundation, diagnostics | ✅ **Completed** |
| **Task 4** | Authentication — Login page, JWT storage, `GET /auth/me`, Bearer injection, protected routes, real current-user | ✅ **Completed** |
| **Task 5** | Shared operational components — data table, pagination, search/filters, URL state, form layout, dialogs, toasts | ✅ **Completed** |
| **Task 6** | Categories & Brands — List, create, edit, deactivate, image upload (categories); list, create, edit, deactivate (brands) | ✅ **Completed** |
| **Task 7** | Products — List, create, edit, archive, cover + gallery image management, detail view, references placeholder | ✅ **Completed** |
| **Task 8** | Product References & Stock — SKU variants, manual stock management, compatibility attributes, swatch images | ✅ **Completed** |
| **Task 9** | Packs — Bundle management, pack items, compatibility attributes, archive, and media gallery | ✅ **Completed** |
| **Task 11** | Attributes & Quiz — Attribute groups, attribute options, quiz questions, step ordering, option replacement | ✅ **Completed** |
| Task 12 | Recommendation Rules — Rule builder, preview engine | **Next** |
| Task 13 | Orders — Order list, order detail, status updates |
| Task 14 | Role-Based Access Control — Enforce STAFF restrictions across modules |
| Task 15 | Polish & Production Readiness — Error boundaries, route guards, a11y audit |

> Current milestone: Task 11 is complete. Attribute-group and attribute-option management, quiz-question CRUD with attribute binding and option replacement, step-order reorder dialog, and OWNER/ADMIN/STAFF permission enforcement are all live.
> Task 12 is next: Recommendation Rules and Preview.
>
> Ordering note: authentication and the OpenAPI client were originally sketched
> elsewhere in the plan. In practice the conception/shell (Task 2) and the typed
> API foundation (Task 3) were built first because every screen depends on them,
> so authentication is Task 4 and the generated client now ships as part of
> Task 3.

## Architecture Notes

Each task builds incrementally on the foundation, shell, and API layer:
- New features are added as modules inside `src/features/<feature-name>/` and
  consume the generated hooks from `@/lib/api/generated/endpoints/<tag>/<tag>`.
- Pages live in `src/pages/` (grouped by section) and render inside the shell.
- Navigation is centralized in `src/config/navigation.ts`; routes in
  `src/config/routes.ts`.
- Role-aware UI uses `PermissionGuard` + `src/features/auth/roles.ts`; the
  backend stays authoritative.
- All HTTP goes through `src/lib/api/http-client.ts`; errors are normalized via
  `src/lib/api/errors.ts`. No raw API calls in components.
- Authentication (Task 4) will register a request interceptor to inject the
  Bearer token, gate routes, and replace the placeholder current user.
