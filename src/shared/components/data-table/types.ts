import type { ColumnDef } from '@tanstack/react-table'
import type { SortOrder } from '@/shared/hooks/use-list-query-state'

/**
 * Re-export the TanStack `ColumnDef` so feature code defines columns from one
 * import without depending on the table library directly. A column is made
 * server-sortable by setting `enableSorting: true` and using the column `id`
 * (or accessor key) as the backend `sortBy` value.
 */
export type { ColumnDef }

/** Controlled, server-driven sort descriptor mirrored from the URL state. */
export interface ServerSort {
  sortBy: string | null
  sortOrder: SortOrder
  /** Toggle/replace the active sort column. */
  onSortChange: (column: string) => void
}
