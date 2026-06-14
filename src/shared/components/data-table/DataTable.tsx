import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type OnChangeFn,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { EmptyState } from '@/shared/components/common/EmptyState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { SkeletonTable } from './SkeletonTable'
import type { ServerSort } from './types'

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]

  // State flags — the table renders the right surface for each.
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void

  /** Server-driven sort. Omit to disable header sort affordances entirely. */
  sort?: ServerSort

  /** Controlled row selection. Provide both to enable the selection column. */
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  /** Stable id per row (defaults to index). Required for reliable selection. */
  getRowId?: (row: TData, index: number) => string

  /** Empty-state customization. */
  emptyTitle?: string
  emptyDescription?: string

  /** Click handler for a whole row (e.g. navigate to detail). */
  onRowClick?: (row: TData) => void

  /** Skeleton row count while loading. */
  loadingRows?: number
  className?: string
}

/**
 * Generic, entity-agnostic data table built on TanStack Table.
 *
 * Pagination and sorting are server-side: this component is purely presentational
 * over the rows it's given and reports sort intent through the `sort` prop. It
 * renders loading, empty and error states inline so list pages don't reimplement
 * them. Row selection and row actions are opt-in via props / column defs.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  isError = false,
  onRetry,
  sort,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your search or filters.',
  onRowClick,
  loadingRows = 8,
  className,
}: DataTableProps<TData>) {
  const enableRowSelection = Boolean(rowSelection && onRowSelectionChange)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection,
    state: { rowSelection: rowSelection ?? {} },
    onRowSelectionChange,
    getRowId,
  })

  const columnCount = useMemo(() => table.getVisibleFlatColumns().length, [table])

  if (isLoading) {
    return <SkeletonTable columns={columnCount} rows={loadingRows} className={className} />
  }

  if (isError) {
    return (
      <div className={cn('rounded-lg border border-border', className)}>
        <ErrorState
          onRetry={onRetry}
          message="We couldn't load this list. Please try again."
          className="border-0 bg-transparent"
        />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border', className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} className="border-0 bg-transparent" />
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}>
      <Table>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const canSort = Boolean(sort) && header.column.columnDef.enableSorting === true
                const columnId = header.column.id
                const isActive = sort?.sortBy === columnId
                const content = header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())

                if (!canSort) {
                  return <TableHead key={header.id}>{content}</TableHead>
                }

                return (
                  <TableHead key={header.id} aria-sort={isActive ? (sort?.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button
                      type="button"
                      onClick={() => sort?.onSortChange(columnId)}
                      className="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-semibold uppercase tracking-wide text-muted-foreground ring-offset-background transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {content}
                      {isActive ? (
                        sort?.sortOrder === 'asc' ? (
                          <ArrowUp className="size-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden="true" />
                      )}
                    </button>
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? 'selected' : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(onRowClick && 'cursor-pointer')}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
