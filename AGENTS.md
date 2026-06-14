# AGENTS.md — Claude Code Instructions

This file provides instructions for Claude Code agents working on the Penguin Beauty Admin dashboard.

## Project Overview

Admin dashboard frontend for a beauty-pack recommendation system. Backend API contract is in `frontend-handoff/`. All tasks build on the foundation established in Task 1.

## Key Conventions

### File Organization
- Features go in `src/features/<feature-name>/` — each feature owns its own components, hooks, and queries
- Shared, reusable code goes in `src/shared/`
- Route-level pages go in `src/pages/`
- All bootstrap code (providers, router) goes in `src/app/`

### Environment Variables
- Never access `import.meta.env` directly in components or hooks
- All env access goes through `src/config/env.ts`
- Add new variables to `.env.example` and update the Zod schema in `src/config/env.ts`

### TypeScript
- Strict mode is enforced — never use `any`, never disable TypeScript errors with comments
- `noUncheckedIndexedAccess` is enabled — always handle potentially-undefined array/object accesses

### shadcn/ui
- The `components.json` file configures the CLI; always use `npx shadcn@latest add <component>`
- Components land in `src/shared/components/ui/`
- Never modify generated shadcn component internals — wrap them instead

### API Client (future)
- OpenAPI client will be generated from `frontend-handoff/openapi.json`
- Do not manually recreate DTOs or copy Prisma models
- Do not modify `frontend-handoff/` files

### Testing
- Tests live in `__tests__/` folders co-located with the code they test
- Use the custom `render` from `src/test/utils/render.tsx` for component tests (includes QueryClient + MemoryRouter)
- MSW handlers go in `src/test/mocks/handlers.ts`
- Tests must not hit the real backend, database, or internet

### Code Quality
- Always run `npm run lint` and `npm run format:check` before committing
- Run `npm test` and `npm run build` to verify no regressions

## Backend Contract Location

```
frontend-handoff/openapi.json      # Primary source of truth
frontend-handoff/openapi.yaml      # Same spec in YAML
frontend-handoff/FRONTEND_HANDOFF.md
frontend-handoff/PAGE_ENDPOINT_MAPPING.md
frontend-handoff/ROLE_PERMISSION_MATRIX.md
frontend-handoff/KNOWN_LIMITATIONS.md
```

## Do Not

- Do not push or merge automatically
- Do not commit `.env` (only `.env.example`)
- Do not implement business features before their task
- Do not use Redux or Next.js
- Do not modify `frontend-handoff/` files
