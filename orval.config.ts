import { defineConfig } from 'orval'

/**
 * Orval configuration — generates the typed API client + TanStack Query hooks
 * from the backend OpenAPI contract.
 *
 * Why Orval: it produces TypeScript models, request functions, query keys, and
 * React Query hooks directly from the contract, so backend DTOs are never
 * hand-duplicated. We use a single custom fetch mutator (no Axios) as the one
 * HTTP client, keeping transport logic centralized.
 *
 * Generation rules:
 *  - Source: the committed handoff contract (never the live backend).
 *  - Output is isolated under src/lib/api/generated and must NOT be edited by
 *    hand (see api:generate / api:check scripts).
 *  - Endpoints are split per tag; all models live in one models folder.
 */
export default defineConfig({
  penguin: {
    input: {
      target: './frontend-handoff/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/lib/api/generated/endpoints',
      schemas: './src/lib/api/generated/models',
      client: 'react-query',
      clean: true,
      indexFiles: true,
      override: {
        mutator: {
          path: './src/lib/api/http-client.ts',
          name: 'customFetch',
        },
        query: {
          // Let Orval map GET → useQuery and POST/PATCH/DELETE → useMutation.
          useQuery: true,
          signal: true,
          version: 5,
        },
      },
    },
    hooks: {
      // Format generated output with the project's Prettier config so
      // regeneration is deterministic (api:check relies on a clean git diff).
      afterAllFilesWrite: ['prettier --write'],
    },
  },
})
