import { QueryClient } from '@tanstack/react-query'
import { isApiError } from './errors'

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
 * Create the application QueryClient with shared defaults. Business-specific
 * cache invalidation is intentionally left to the feature tasks that add it.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
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
