import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/components/ui/skeleton'

type LoadingVariant = 'page' | 'table' | 'cards' | 'inline'

interface LoadingStateProps {
  variant?: LoadingVariant
  /** Number of skeleton rows/cards to render (table & cards variants). */
  rows?: number
  className?: string
  /** Accessible label announced to screen readers. */
  label?: string
}

/**
 * Skeleton loading placeholders — shown instead of blank content while data
 * loads. Variants cover the common dashboard surfaces (full page, data table,
 * card grid, inline). Announces a busy status for assistive tech.
 */
export function LoadingState({
  variant = 'page',
  rows = 5,
  className,
  label = 'Loading…',
}: LoadingStateProps) {
  return (
    <div className={cn('w-full', className)} role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {variant === 'inline' && <Skeleton className="h-5 w-32" />}

      {variant === 'page' && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      )}

      {variant === 'table' && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <Skeleton className="size-9 shrink-0 rounded-md" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === 'cards' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-4">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
