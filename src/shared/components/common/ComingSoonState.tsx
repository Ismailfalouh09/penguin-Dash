import { Check, Hammer } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/components/ui/badge'

interface ComingSoonStateProps {
  /** What this module will do. */
  description: string
  /** Bullet list of planned functionality. */
  plannedFeatures?: string[]
  className?: string
}

/**
 * Placeholder body for module pages whose functionality arrives in a later
 * task. Clearly communicates that API integration is not part of Task 2.
 */
export function ComingSoonState({
  description,
  plannedFeatures = [],
  className,
}: ComingSoonStateProps) {
  return (
    <div className={cn('rounded-lg border border-dashed border-border bg-card/50 p-6', className)}>
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"
          aria-hidden="true"
        >
          <Hammer className="size-5" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Planned module</h3>
            <Badge variant="secondary">Not yet implemented</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {plannedFeatures.length > 0 && (
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Planned functionality
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {plannedFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-5 text-xs text-muted-foreground">
        API integration is not part of Task 2. This screen is a design preview only.
      </p>
    </div>
  )
}
