import { Eye } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface DesignPreviewProps {
  /** What the preview demonstrates. */
  label?: string
  children: React.ReactNode
  className?: string
}

/**
 * Wraps static, non-functional visual examples so they are unmistakably
 * identified as design previews rather than real data. Used on the overview
 * page to demonstrate components without inventing backend statistics.
 */
export function DesignPreview({
  label = 'Design preview — static example, not live data',
  children,
  className,
}: DesignPreviewProps) {
  return (
    <div className={cn('relative rounded-lg border border-dashed border-border p-1', className)}>
      <div className="pointer-events-none absolute -top-2.5 left-3 flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <Eye className="size-3" aria-hidden="true" />
        {label}
      </div>
      <div className="pt-3">{children}</div>
    </div>
  )
}
