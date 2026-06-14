import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'

interface DataTableToolbarProps {
  /** Search input slot (left side). */
  search?: React.ReactNode
  /** Filter controls (selects, date filters, etc.). */
  filters?: React.ReactNode
  /** Right-aligned actions (e.g. a "New" button). */
  actions?: React.ReactNode
  /** When true, shows the "Clear filters" button. */
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  className?: string
}

/**
 * Layout shell for list-page controls: search + filters on the left, actions on
 * the right, with a shared "Clear filters" affordance. Composes the individual
 * search/filter components rather than hard-coding any business filters.
 */
export function DataTableToolbar({
  search,
  filters,
  actions,
  hasActiveFilters = false,
  onClearFilters,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {search}
        {filters}
        {hasActiveFilters && onClearFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-10">
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
