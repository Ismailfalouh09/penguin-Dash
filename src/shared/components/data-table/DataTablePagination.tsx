import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  describePageRange,
  type PaginationMeta,
} from '@/shared/lib/pagination'

interface DataTablePaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: readonly number[]
  /** Disable all controls (e.g. while a fetch is in flight). */
  disabled?: boolean
  className?: string
}

/** Build a compact page-number list with ellipses for direct navigation. */
function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('ellipsis')
  for (let p = start; p <= end; p += 1) pages.push(p)
  if (end < total - 1) pages.push('ellipsis')
  pages.push(total)
  return pages
}

/**
 * Server-side pagination control. Shows the current range, a page-size
 * selector, previous/next buttons and direct page navigation. All actions are
 * driven by the parent (URL state) — this component holds no internal page
 * state. Disabled states are derived from `meta`.
 */
export function DataTablePagination({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  disabled = false,
  className,
}: DataTablePaginationProps) {
  const { page, pageSize, totalPages, hasNextPage, hasPreviousPage } = meta
  const range = describePageRange(meta)
  const pageList = buildPageList(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {range.total === 0
            ? 'No results'
            : `Showing ${range.from}–${range.to} of ${range.total}`}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-muted-foreground">
            Per page
          </label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={disabled}
          >
            <SelectTrigger id="page-size" className="h-9 w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || !hasPreviousPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <ul className="hidden items-center gap-1 sm:flex">
          {pageList.map((item, index) =>
            item === 'ellipsis' ? (
              <li key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">
                …
              </li>
            ) : (
              <li key={item}>
                <Button
                  variant={item === page ? 'default' : 'ghost'}
                  size="icon"
                  className="size-9"
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={() => onPageChange(item)}
                  disabled={disabled}
                >
                  {item}
                </Button>
              </li>
            )
          )}
        </ul>

        <span className="text-sm text-muted-foreground sm:hidden">
          Page {page} of {Math.max(totalPages, 1)}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || !hasNextPage}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
