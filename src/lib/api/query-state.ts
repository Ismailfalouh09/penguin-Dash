/**
 * Reusable conventions for turning TanStack Query / mutation results into the
 * shared UI states (loading, error, empty) and for consistent mutation
 * feedback. These are deliberately entity-agnostic — feature tasks supply their
 * own query keys and data types.
 */

import type { UseMutationOptions } from '@tanstack/react-query'
import { getApiErrorMessage, normalizeApiError, type ApiError } from './errors'
import { useToast } from '@/shared/hooks/use-toast'

/** The discrete state a list/detail view can be in, derived from a query. */
export type QueryViewState = 'loading' | 'error' | 'empty' | 'ready'

interface ResolveQueryViewStateInput {
  isLoading: boolean
  isError: boolean
  /** True when the resolved data set is empty (e.g. `data.length === 0`). */
  isEmpty: boolean
  /** Keep showing existing content during a background refetch. */
  isFetching?: boolean
  hasData?: boolean
}

/**
 * Collapse a query's flags into a single view state. On a background refetch
 * with data already present, stays `ready`/`empty` instead of flashing the
 * skeleton.
 */
export function resolveQueryViewState({
  isLoading,
  isError,
  isEmpty,
  hasData = false,
}: ResolveQueryViewStateInput): QueryViewState {
  if (isLoading && !hasData) return 'loading'
  if (isError && !hasData) return 'error'
  if (isEmpty) return 'empty'
  return 'ready'
}

/** Normalize any query/mutation error into a user-facing message. */
export function toErrorMessage(error: unknown): string {
  return getApiErrorMessage(error)
}

/** Normalize any query/mutation error into the shared `ApiError` shape. */
export function toApiError(error: unknown): ApiError {
  return normalizeApiError(error)
}

export interface MutationFeedbackOptions {
  /** Toast title/description shown on success. Omit to skip the success toast. */
  success?: { title: string; description?: string }
  /** Toast title shown on error; the message comes from the normalized error. */
  errorTitle?: string
}

/**
 * Hook that returns `onSuccess`/`onError` handlers wiring a mutation to the
 * toast system with consistent copy. Spread the result into `useMutation`:
 *
 *   useMutation({ mutationFn, ...useMutationFeedback({ success: { title: 'Saved' } }) })
 *
 * Provided handlers are composed *after* the feedback toast fires, so callers
 * can still add cache invalidation, navigation, etc.
 */
export function useMutationFeedback<TData = unknown, TError = unknown, TVariables = unknown>(
  options: MutationFeedbackOptions & {
    onSuccess?: UseMutationOptions<TData, TError, TVariables>['onSuccess']
    onError?: UseMutationOptions<TData, TError, TVariables>['onError']
  } = {}
): Pick<UseMutationOptions<TData, TError, TVariables>, 'onSuccess' | 'onError'> {
  const { toast } = useToast()
  const { success, errorTitle = 'Action failed', onSuccess, onError } = options

  return {
    onSuccess: (...args: Parameters<NonNullable<typeof onSuccess>>) => {
      if (success) {
        toast({ tone: 'success', title: success.title, description: success.description })
      }
      return onSuccess?.(...args)
    },
    onError: (...args: Parameters<NonNullable<typeof onError>>) => {
      toast({ tone: 'error', title: errorTitle, description: toErrorMessage(args[0]) })
      return onError?.(...args)
    },
  }
}
