import { Loader2 } from 'lucide-react'

interface FullPageLoaderProps {
  /** Accessible, visible label for what is loading. */
  label?: string
}

/**
 * Centered full-viewport loader used during whole-app transitions such as
 * restoring a stored session before the router renders protected content.
 */
export function FullPageLoader({ label = 'Loading…' }: FullPageLoaderProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
