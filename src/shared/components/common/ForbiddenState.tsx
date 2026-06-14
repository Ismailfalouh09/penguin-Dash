import { ShieldAlert } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ForbiddenStateProps {
  title?: string
  message?: string
  /** Optional action (e.g. a link back). */
  action?: React.ReactNode
  className?: string
}

/**
 * Inline "access denied" state for embedding inside a page or section when a
 * user lacks permission for part of a view (vs. the full-page `ForbiddenPage`
 * used for whole-route 403s). Meaning never depends on color alone.
 */
export function ForbiddenState({
  title = 'Access denied',
  message = "You don't have permission to view this content.",
  action,
  className,
}: ForbiddenStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center',
        className
      )}
    >
      <span
        className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <ShieldAlert className="size-6" />
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
