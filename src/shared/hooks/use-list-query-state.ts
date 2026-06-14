import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_PAGE_SIZE } from '@/shared/lib/pagination'

/**
 * Centralized URL state for list pages.
 *
 * The URL query string is the single source of truth for list-page controls.
 * This hook is the ONLY place that parses and serializes those params, so
 * feature components never duplicate query-string handling. Browser back /
 * forward naturally restores table state because everything lives in the URL.
 *
 * Recognized params: page, limit, search, sortBy, sortOrder, plus arbitrary
 * feature filters (any other key).
 */

export type SortOrder = 'asc' | 'desc'

export interface ListQueryState {
  page: number
  limit: number
  search: string
  sortBy: string | null
  sortOrder: SortOrder
  /** All non-reserved params, treated as feature filters. */
  filters: Record<string, string>
}

const RESERVED_KEYS = new Set(['page', 'limit', 'search', 'sortBy', 'sortOrder'])

export interface ListQueryStateOptions {
  /** Page size used when the URL has none or an invalid value. */
  defaultLimit?: number
  /** Allowed page sizes; invalid values fall back to `defaultLimit`. */
  allowedLimits?: readonly number[]
  /** Default sort column applied when the URL specifies none. */
  defaultSortBy?: string | null
  /** Default sort direction. */
  defaultSortOrder?: SortOrder
}

/** Parse a positive integer, falling back to `fallback` on any invalid input. */
function parsePositiveInt(raw: string | null, fallback: number): number {
  if (raw === null) return fallback
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

export interface UseListQueryStateResult extends ListQueryState {
  /** Update one or more controls. `null` removes a param. Page resets to 1 on
   *  any change except an explicit `page` update. */
  setState: (next: Partial<ListQueryState>) => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  /** Toggle/replace sort. Passing the active column flips the direction. */
  setSort: (column: string) => void
  setFilter: (key: string, value: string | null) => void
  /** Clear search + all filters (keeps sort and resets to page 1). */
  clearFilters: () => void
  /** True when any search term or filter is active. */
  hasActiveFilters: boolean
}

export function useListQueryState(
  options: ListQueryStateOptions = {}
): UseListQueryStateResult {
  const {
    defaultLimit = DEFAULT_PAGE_SIZE,
    allowedLimits,
    defaultSortBy = null,
    defaultSortOrder = 'desc',
  } = options

  const [searchParams, setSearchParams] = useSearchParams()

  const state = useMemo<ListQueryState>(() => {
    let limit = parsePositiveInt(searchParams.get('limit'), defaultLimit)
    if (allowedLimits && !allowedLimits.includes(limit)) {
      limit = defaultLimit
    }

    const rawOrder = searchParams.get('sortOrder')
    const sortOrder: SortOrder = rawOrder === 'asc' || rawOrder === 'desc' ? rawOrder : defaultSortOrder

    const filters: Record<string, string> = {}
    for (const [key, value] of searchParams.entries()) {
      if (!RESERVED_KEYS.has(key) && value !== '') {
        filters[key] = value
      }
    }

    return {
      page: parsePositiveInt(searchParams.get('page'), 1),
      limit,
      search: searchParams.get('search') ?? '',
      sortBy: searchParams.get('sortBy') ?? defaultSortBy,
      sortOrder,
      filters,
    }
  }, [searchParams, defaultLimit, allowedLimits, defaultSortBy, defaultSortOrder])

  // Write helper: applies a partial update on top of the current params and
  // prunes empty/default values so the URL stays clean.
  const apply = useCallback(
    (next: Partial<ListQueryState>, resetPage: boolean) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)

          const writeScalar = (key: string, value: string | null | undefined) => {
            if (value === null || value === undefined || value === '') params.delete(key)
            else params.set(key, value)
          }

          if ('page' in next) writeScalar('page', next.page ? String(next.page) : null)
          if ('limit' in next) writeScalar('limit', next.limit ? String(next.limit) : null)
          if ('search' in next) writeScalar('search', next.search ?? null)
          if ('sortBy' in next) writeScalar('sortBy', next.sortBy ?? null)
          if ('sortOrder' in next) writeScalar('sortOrder', next.sortOrder ?? null)

          if (next.filters) {
            // Replace the full filter set: drop existing non-reserved keys first.
            for (const key of Array.from(params.keys())) {
              if (!RESERVED_KEYS.has(key)) params.delete(key)
            }
            for (const [key, value] of Object.entries(next.filters)) {
              writeScalar(key, value)
            }
          }

          if (resetPage && !('page' in next)) params.delete('page')

          // Normalize page=1 and default limit out of the URL.
          if (params.get('page') === '1') params.delete('page')
          if (params.get('limit') === String(defaultLimit)) params.delete('limit')

          return params
        },
        { replace: false }
      )
    },
    [setSearchParams, defaultLimit]
  )

  const setState = useCallback((next: Partial<ListQueryState>) => apply(next, true), [apply])
  const setPage = useCallback((page: number) => apply({ page }, false), [apply])
  const setLimit = useCallback((limit: number) => apply({ limit }, true), [apply])
  const setSearch = useCallback((search: string) => apply({ search }, true), [apply])

  const setSort = useCallback(
    (column: string) => {
      const sameColumn = state.sortBy === column
      const sortOrder: SortOrder = sameColumn && state.sortOrder === 'asc' ? 'desc' : 'asc'
      apply({ sortBy: column, sortOrder }, true)
    },
    [apply, state.sortBy, state.sortOrder]
  )

  const setFilter = useCallback(
    (key: string, value: string | null) => {
      if (RESERVED_KEYS.has(key)) return
      apply({ filters: { ...state.filters, [key]: value ?? '' } }, true)
    },
    [apply, state.filters]
  )

  const clearFilters = useCallback(() => {
    apply({ search: '', filters: {} }, true)
  }, [apply])

  const hasActiveFilters = state.search !== '' || Object.keys(state.filters).length > 0

  return {
    ...state,
    setState,
    setPage,
    setLimit,
    setSearch,
    setSort,
    setFilter,
    clearFilters,
    hasActiveFilters,
  }
}
