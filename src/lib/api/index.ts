/**
 * Public entry point for the API layer.
 *
 * Handwritten foundation (HTTP client, error model, query client, contract
 * metadata) plus the generated TypeScript models. Generated React Query hooks
 * are imported directly from `@/lib/api/generated/endpoints/<tag>/<tag>` by the
 * features that use them.
 */

// Error model & helpers
export * from './errors'

// Central HTTP client (single transport / Orval mutator)
export {
  customFetch,
  buildRequestUrl,
  registerRequestInterceptor,
  clearRequestInterceptors,
  type OutgoingRequest,
} from './http-client'

// Shared TanStack Query client factory
export { createQueryClient } from './query-client'

// Backend contract metadata (for diagnostics)
export { API_CONTRACT, type ApiContractInfo } from './contract-info'

// Generated DTO/model types
export * from './generated/models'
