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

### Route Integration Tests
Exercise the real route tree through a memory data router.

Examples:
- `src/app/__tests__/App.test.tsx` — routes, redirect, nested params, 404/403, login

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

> API-layer tests never need a running backend, DB, real JWT, internet, or
> Cloudinary — MSW intercepts everything.

## Running Tests

```bash
npm test               # Single run (CI)
npm run test:watch     # Watch mode (development)
npm run test:coverage  # Coverage report
```

## MSW Handler Pattern (future tasks)

When adding feature tests that need API responses:

```ts
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:3000/admin/products', () => {
    return HttpResponse.json({ data: [], meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } })
  }),
]
```

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
