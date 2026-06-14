# Architecture — Penguin Beauty Admin Dashboard

## Directory Structure

```
penguin-Dash/
├── frontend-handoff/            # Backend API contract (DO NOT MODIFY)
│   ├── openapi.json             # Primary API spec (source of truth)
│   ├── openapi.yaml             # Same spec in YAML
│   ├── FRONTEND_HANDOFF.md
│   ├── PAGE_ENDPOINT_MAPPING.md
│   ├── ROLE_PERMISSION_MATRIX.md
│   └── KNOWN_LIMITATIONS.md
├── src/
│   ├── app/                     # Bootstrap: wires everything together
│   │   ├── App.tsx              # Root component (Providers + RouterProvider)
│   │   ├── router.tsx           # createBrowserRouter route definitions
│   │   └── providers.tsx        # QueryClientProvider + ReactQueryDevtools
│   ├── config/
│   │   └── env.ts               # Typed, Zod-validated env module (single source)
│   ├── features/                # Feature modules (empty in Task 1)
│   │   └── <feature>/           # auth/, products/, categories/, etc.
│   │       ├── components/      # Feature-specific React components
│   │       ├── hooks/           # Feature-specific hooks (useProducts, etc.)
│   │       └── api.ts           # Feature API calls (typed, uses generated client)
│   ├── pages/                   # Route-level page components
│   │   ├── HomePage.tsx         # Foundation confirmation page (Task 1)
│   │   └── NotFoundPage.tsx     # 404 fallback
│   ├── shared/                  # Cross-feature code
│   │   ├── components/
│   │   │   └── ui/              # shadcn/ui generated components
│   │   ├── hooks/               # Shared custom hooks
│   │   └── lib/
│   │       └── utils.ts         # cn() Tailwind class utility
│   ├── styles/
│   │   └── globals.css          # Tailwind directives + shadcn CSS variables
│   ├── test/
│   │   ├── setup.ts             # @testing-library/jest-dom + MSW server lifecycle
│   │   ├── utils/
│   │   │   └── render.tsx       # Custom render with QueryClient + MemoryRouter
│   │   └── mocks/
│   │       ├── server.ts        # MSW Node.js server
│   │       └── handlers.ts      # MSW request handlers (grows per task)
│   ├── main.tsx                 # Application entry point
│   └── vite-env.d.ts            # Vite client type reference
├── docs/
│   ├── ARCHITECTURE.md          # This file
│   ├── PROGRESS_LOG.md          # Task completion history
│   └── TEST_PLAN.md             # Testing strategy
├── public/                      # Static assets
├── AGENTS.md                    # Claude Code instructions
├── PROJECT_BRIEF.md             # Product and domain context
├── FRONTEND_ROADMAP.md          # Tasks 1–16 plan
└── README.md                    # Setup and commands
```

## Key Patterns

### 1. Centralized Environment Access (`src/config/env.ts`)

All `import.meta.env` access is isolated to this one module. It validates the environment at startup using Zod and throws a clear error if variables are missing or malformed. Components import from `@/config/env`, never from `import.meta.env` directly.

### 2. Feature Module Pattern (`src/features/<name>/`)

Each dashboard feature (auth, products, categories, etc.) is a self-contained module:
- `components/` — UI components specific to this feature
- `hooks/` — React Query hooks for data fetching
- `api.ts` — API call definitions (will use generated OpenAPI client)

This pattern keeps related code together and makes features independently replaceable.

### 3. shadcn/ui Components (`src/shared/components/ui/`)

shadcn/ui components are generated source files (not a package import). They live in `src/shared/components/ui/` and are copied verbatim from the shadcn CLI. Never edit generated component internals — create wrapper components instead.

Add new components with:
```bash
npx shadcn@latest add <component>
```

### 4. Custom Test Render (`src/test/utils/render.tsx`)

All component tests use the custom `render` from `src/test/utils/render.tsx`, which wraps components in:
- `QueryClientProvider` (with retry disabled for tests)
- `MemoryRouter` (with configurable initial entries)

This ensures tests match the real app context without requiring browser routing.

### 5. MSW for API Mocking

MSW (Mock Service Worker) intercepts network requests in tests via a Node.js server. Handlers are registered in `src/test/mocks/handlers.ts`. The server is configured with `onUnhandledRequest: 'error'` so accidental network calls in tests fail loudly.

## Future: OpenAPI Client Generation (Task 14)

The `frontend-handoff/openapi.json` will be used to generate a typed API client. The generated client will be placed in `src/shared/lib/api-client/` (or similar) and consumed by feature hooks. Manual API call code should be minimized before then.

## TypeScript Configuration

Strict mode is enforced:
- `strict: true` — all strict checks enabled
- `noUncheckedIndexedAccess: true` — array/object accesses return `T | undefined`
- `noUnusedLocals / noUnusedParameters: true` — dead code caught at compile time

Path alias `@/*` maps to `src/*` in both TypeScript and Vite.
