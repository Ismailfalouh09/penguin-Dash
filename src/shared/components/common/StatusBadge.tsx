import { cn } from '@/shared/lib/utils'

export type StatusTone = 'neutral' | 'success' | 'warning' | 'error' | 'info'

interface StatusBadgeProps {
  tone?: StatusTone
  children: React.ReactNode
  /** Show a leading status dot in addition to text (status is never color-only). */
  withDot?: boolean
  className?: string
}

const TONE_STYLES: Record<StatusTone, { badge: string; dot: string }> = {
  neutral: { badge: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  success: { badge: 'bg-success/10 text-success', dot: 'bg-success' },
  warning: { badge: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  error: { badge: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
  info: { badge: 'bg-info/10 text-info', dot: 'bg-info' },
}

/**
 * Compact status pill. Color is paired with a text label (and optional dot) so
 * meaning never depends on color alone — an accessibility requirement.
 */
export function StatusBadge({
  tone = 'neutral',
  children,
  withDot = true,
  className,
}: StatusBadgeProps) {
  const styles = TONE_STYLES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles.badge,
        className
      )}
    >
      {withDot && <span className={cn('size-1.5 rounded-full', styles.dot)} aria-hidden="true" />}
      {children}
    </span>
  )
}
