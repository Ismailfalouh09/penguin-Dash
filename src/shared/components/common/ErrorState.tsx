import { AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'

interface ErrorStateProps {
  title?: string
  /** User-friendly message. Never surface a raw backend stack trace here. */
  message?: string
  /** When provided, renders a retry button wired to this handler. */
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/**
 * Standard error state. Shows a calm, user-friendly message and an optional
 * retry action — deliberately never a raw error/stack trace.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 px-6 py-12 text-center',
        className
      )}
    >
      <span
        className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        aria-hidden="true"
      >
        <AlertTriangle className="size-6" />
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
