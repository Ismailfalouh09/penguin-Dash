# API Integration

How the admin dashboard talks to the NestJS backend. This layer is the
foundation every business feature builds on; it adds no authentication or
business logic itself.

## Overview

```
frontend-handoff/openapi.json   (committed contract — source of truth)
        │  npm run api:generate (Orval)
        ▼
src/lib/api/generated/          (generated — DO NOT EDIT)
  ├─ models/                    DTO/type definitions + barrel
  └─ endpoints/<tag>/<tag>.ts   request fns + query keys + React Query hooks
        │  every request goes through ↓
src/lib/api/http-client.ts      single fetch client (Orval mutator)
        │  errors normalized by ↓
src/lib/api/errors.ts           ApiError model + helpers
```

Handwritten foundation lives directly under `src/lib/api/`; generated output is
isolated under `src/lib/api/generated/`.

## OpenAPI source

- **Location:** `frontend-handoff/openapi.json` (the committed contract; the live
  backend is never contacted during generation).
- The matching `openapi.yaml` and `backend-version.txt` sit alongside it.
- These files are **read-only** for the frontend — never edit them here.

## Generator: Orval

[Orval](https://orval.dev) generates TypeScript models, request functions, query
keys, and TanStack Query hooks straight from the contract, so backend DTOs are
never hand-duplicated.

- **Config:** [`orval.config.ts`](../orval.config.ts)
- **Client mode:** `react-query` with a single **custom fetch mutator**
  (`customFetch`) — no Axios, one HTTP client.
- **Output mode:** `tags-split` — endpoints grouped per OpenAPI tag; all models
  in one `models/` folder with a barrel.
- GET operations generate `useQuery` hooks; POST/PATCH/DELETE generate
  `useMutation` hooks. The `AbortSignal` is threaded through automatically.
- Generation is **deterministic** (same contract + Prettier ⇒ identical output);
  `.gitattributes` pins LF on the generated tree so `api:check` is stable.

### Why this setup

- A custom **fetch** mutator keeps transport centralized with zero extra HTTP
  deps and native `AbortSignal`/`FormData` support.
- `tags-split` keeps the 23 tag groups navigable and isolates models for reuse.
- React Query hooks come for free and plug into the existing QueryClient.

## Generated output

- **Never edit** files under `src/lib/api/generated/` — they carry a
  "Do not edit manually" header and are excluded from ESLint and `format:check`.
- Import models from `@/lib/api` (re-exported) or `@/lib/api/generated/models`.
- Import hooks from `@/lib/api/generated/endpoints/<tag>/<tag>`.
- Generated functions return a typed wrapper: `{ status, data, headers }` —
  read `response.data` for the payload.

## HTTP client

[`src/lib/api/http-client.ts`](../src/lib/api/http-client.ts) is the single
transport (`customFetch`). It:

- Resolves the base URL from `apiBaseUrl` (typed env) — never hardcoded.
- Serializes JSON and passes `FormData` through untouched (multipart).
- Forwards `AbortSignal` for cancellation.
- Throws a normalized `ApiError` on failure; re-throws aborts unchanged.
- Exposes a **request interceptor registry** (`registerRequestInterceptor`) as
  the extension point for Task 4 Bearer-token injection. **No auth today.**

## Environment

- `VITE_API_BASE_URL` (validated in [`src/config/env.ts`](../src/config/env.ts))
  is the only backend URL. The schema throws clearly at startup if it is missing
  or malformed. `apiBaseUrl` is the normalized (trailing-slash-free) export used
  by the client.
- No secrets live in frontend env variables.

## Error normalization

[`src/lib/api/errors.ts`](../src/lib/api/errors.ts) maps the backend envelope
(`{ statusCode, message: string | string[], error }`) to a stable shape:

```ts
interface ApiErrorShape {
  status?: number
  title: string
  message: string
  details?: string[]   // populated from array validation messages
  code?: string
  originalError?: unknown
}
```

Helpers: `normalizeApiError`, `getApiErrorMessage`, `isApiError`,
`isUnauthorizedError`, `isForbiddenError`, `isNotFoundError`,
`isValidationError`, `isNetworkError`. Raw stack traces are never surfaced.

## TanStack Query integration

[`src/lib/api/query-client.ts`](../src/lib/api/query-client.ts) builds the shared
QueryClient:

- Queries: `staleTime` 60s, no refetch on window focus, retry network/5xx up to
  twice, **never retry 4xx** (deterministic failures fail fast).
- Mutations: no retry.
- Cancellation is automatic via the forwarded `AbortSignal`.

Guidance for feature tasks:

```
GET endpoints       → generated useQuery hooks
POST/PATCH/DELETE   → generated useMutation hooks
After a mutation    → queryClient.invalidateQueries({ queryKey: [...] })
```

Business-specific invalidation rules are added by the feature tasks that need
them — not here.

## Mocking (tests)

MSW backs the API-layer tests. The global server
([`src/test/mocks/server.ts`](../src/test/mocks/server.ts)) starts with empty
handlers and `onUnhandledRequest: 'error'`; tests register handlers per case with
`server.use(...)` and the [`apiUrl`](../src/test/mocks/api.ts) helper. MSW runs
only in tests. No full fake business implementations exist.

## Diagnostics

`/diagnostics` ([`src/pages/DiagnosticsPage.tsx`](../src/pages/DiagnosticsPage.tsx))
is a **development-only** page (not in the sidebar) showing the API base URL,
backend contract metadata, and an on-demand health probe (`GET /`) routed through
the generated client. It needs no auth and exposes no secrets.

## Generated-file rules

1. Never hand-edit anything in `src/lib/api/generated/`.
2. Change behavior via the contract + regeneration, or the handwritten
   `http-client` / `errors` / `query-client`.
3. Keep `src/lib/api/contract-info.ts` in sync when the contract version changes.

## Commands

| Command | Purpose |
|---|---|
| `npm run api:generate` | Regenerate the client from `frontend-handoff/openapi.json` |
| `npm run api:check` | Regenerate and fail if the generated output drifts from git |

## Developer workflow — updating the contract

When the backend ships a new contract:

```
1. Replace frontend-handoff/openapi.json (+ openapi.yaml) with the new versions.
2. Verify frontend-handoff/backend-version.txt and update
   src/lib/api/contract-info.ts if the version/handoff changed.
3. npm run api:generate          # regenerate the typed client
4. npm test && npm run build     # confirm nothing broke
5. Review the generated diff      # git diff src/lib/api/generated
6. Commit the contract + regenerated client together.
```

`npm run api:check` runs step 3 and fails if the committed generated output is
stale — wire it into CI to keep the client and contract in lockstep.
