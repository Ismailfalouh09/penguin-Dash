# Frontend Roadmap — Penguin Beauty Admin Dashboard

## Status

| Task | Description | Status |
|---|---|---|
| **Task 1** | Foundation — Vite + React + TypeScript + Router + Query + Tailwind + shadcn + Testing | ✅ **Completed** |
| **Task 2** | Authentication — Login page, JWT storage, protected routes, auth context | ⏳ **Next** |
| Task 3 | Dashboard Shell — Sidebar navigation, header, layout, role-based menu |
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
| Task 15 | Role-Based Access Control — STAFF restrictions, permission-aware UI |
| Task 16 | Polish & Production Readiness — Error boundaries, loading states, empty states, a11y |

## Architecture Notes

All tasks build incrementally on the foundation from Task 1:
- New features are added as modules inside `src/features/<feature-name>/`
- Shared utilities and components go in `src/shared/`
- API client (Task 14) will be generated from `frontend-handoff/openapi.json`
- Authentication (Task 2) will gate all admin routes
