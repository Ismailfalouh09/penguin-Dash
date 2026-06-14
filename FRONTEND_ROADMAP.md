# Frontend Roadmap — Penguin Beauty Admin Dashboard

## Status

| Task | Description | Status |
|---|---|---|
| **Task 1** | Foundation — Vite + React + TypeScript + Router + Query + Tailwind + shadcn + Testing | ✅ **Completed** |
| **Task 2** | Dashboard Conception & Design System — sitemap, routes, navigation config, responsive shell, design tokens, shared UI states, placeholder pages | ✅ **Completed** |
| **Task 3** | Authentication — Login page, JWT storage, `GET /auth/me`, protected routes, real current-user | ⏳ **Next** |
| Task 4 | Categories — List, create, edit, delete, image upload |
| Task 5 | Brands — List, create, edit, delete |
| Task 6 | Attributes & Options — Attribute groups, options, deactivation |
| Task 7 | Products — List, create, edit, image gallery management |
| Task 8 | Product References — SKU variants, stock management, swatch images |
| Task 9 | Packs — Bundle management, pack image gallery |
| Task 10 | Quiz — Question list, create, edit, reorder |
| Task 11 | Recommendation Rules — Rule builder, preview engine |
| Task 12 | Orders — Order list, order detail, status updates |
| Task 13 | Media Library — Generic media upload, entity-specific image management |
| Task 14 | OpenAPI Client Generation — Generate typed API client from openapi.json |
| Task 15 | Role-Based Access Control — Enforce STAFF restrictions across modules |
| Task 16 | Polish & Production Readiness — Error boundaries, route guards, a11y audit |

> Note: the original Task 1 plan listed authentication as Task 2 and the shell as
> Task 3. During Task 2 the conception/design system and shell were built first
> (they are prerequisites for every screen), so authentication moved to Task 3.

## Architecture Notes

Each task builds incrementally on the foundation and shell:
- New features are added as modules inside `src/features/<feature-name>/`.
- Pages live in `src/pages/` (grouped by section) and render inside the shell.
- Navigation is centralized in `src/config/navigation.ts`; routes in
  `src/config/routes.ts`.
- Role-aware UI uses `PermissionGuard` + `src/features/auth/roles.ts`; the
  backend stays authoritative.
- The API client (Task 14) will be generated from `frontend-handoff/openapi.json`.
- Authentication (Task 3) will gate all admin routes and replace the placeholder
  current user.
