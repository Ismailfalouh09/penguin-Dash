/**
 * Pagination contract shared by every list page.
 *
 * Mirrors the backend's documented response envelope (see
 * frontend-handoff/FRONTEND_HANDOFF.md → Pagination Format):
 *
 *   { data: T[], meta: { page, pageSize, totalItems, totalPages,
 *                        hasNextPage, hasPreviousPage } }
 */

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/** Default page-size options offered in the page-size selector. */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export const DEFAULT_PAGE_SIZE = 20

/**
 * Derive a complete `PaginationMeta` from the minimal known values. Useful for
 * demos/tests and as a fallback when a backend omits the computed fields.
 */
export function buildPaginationMeta(input: {
  page: number
  pageSize: number
  totalItems: number
}): PaginationMeta {
  const { page, pageSize, totalItems } = input
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/** Human-readable "Showing X–Y of Z" range for a page of results. */
export function describePageRange(meta: PaginationMeta): {
  from: number
  to: number
  total: number
} {
  const { page, pageSize, totalItems } = meta
  if (totalItems === 0) return { from: 0, to: 0, total: 0 }
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)
  return { from, to, total: totalItems }
}
