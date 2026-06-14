import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/shared/components/ui/checkbox'

/**
 * A ready-made row-selection column (header "select all" + per-row checkbox).
 * Spread it into a feature's column list when row selection is enabled:
 *
 *   const columns = [selectionColumn<MyRow>(), ...myColumns]
 *
 * Generic over the row type so it never assumes a specific entity.
 */
export function selectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    enableSorting: false,
    size: 40,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  }
}
