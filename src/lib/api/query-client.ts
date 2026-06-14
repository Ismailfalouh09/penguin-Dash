import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { notifyUnauthorized } from '@/features/auth/auth-events'
import { isApiError, isUnauthorizedError } from './errors'

/**
 * Shared TanStack Query retry policy.
 *
 * Client errors (4xx) are deterministic — retrying won't help — so they fail
 * fast. Network/server errors are retried a couple of times. Request
 * cancellation is handled automatically because the generated client forwards
 * the AbortSignal TanStack Query provides.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isApiError(error) && typeof error.status === 'number') {
    if (error.status >= 400 && error.status < 500) return false
  }
  return failureCount < 2
}

/**
 * Global handler for failed authenticated requests.
 *
 * A `401` on any query or mutation means the stored token is missing, expired,
 * or rejected — the session is dead, so we trigger a global logout + redirect.
 * `403` is deliberately ignored here: the session is still valid, the user just
 * lacks permission, and feature code surfaces that locally (e.g. /forbidden).
 */
function handleGlobalRequestError(error: unknown): void {
  if (isUnauthorizedError(error)) {
    notifyUnauthorized()
  }
}

/**
 * Create the application QueryClient with shared defaults. Business-specific
 * cache invalidation is intentionally left to the feature tasks that add it.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleGlobalRequestError }),
    mutationCache: new MutationCache({ onError: handleGlobalRequestError }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
