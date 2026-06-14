# Test Plan — Penguin Beauty Admin Dashboard

## Philosophy

- Tests verify behavior, not implementation
- No test touches the real backend, database, or internet
- MSW intercepts any accidental network calls and fails loudly (`onUnhandledRequest: 'error'`)
- The custom render utility (`src/test/utils/render.tsx`) provides a consistent test environment

## Test Types

### Unit Tests
For pure functions, utilities, and Zod schemas. No React setup needed.

Examples:
- `src/config/__tests__/env.test.ts` — validates env schema parsing
- `src/shared/lib/__tests__/utils.test.ts` — cn() utility

### Component Tests
For React components in isolation. Use the custom render utility.

Examples:
- `src/pages/__tests__/HomePage.test.tsx`
- `src/pages/__tests__/NotFoundPage.test.tsx`
- `src/shared/components/ui/__tests__/button.test.tsx`

### Integration Tests (future)
For feature workflows that span multiple components and API calls.
MSW handlers will simulate backend responses.

## Coverage Goals (Task 1)

| Area | Coverage Goal |
|---|---|
| Foundation pages | 100% |
| shadcn UI components | Render + behavior tests |
| Env config schema | All valid/invalid cases |
| App providers | QueryClient + Router integration |

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
      HomePage.test.tsx
  features/
    products/
      __tests__/
        ProductList.test.tsx
```

Co-locate tests with the code they test. Never put all tests in a single `tests/` root directory.
