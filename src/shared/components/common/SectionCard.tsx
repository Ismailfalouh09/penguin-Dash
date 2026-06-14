import { cn } from '@/shared/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

interface SectionCardProps {
  title?: string
  description?: string
  /** Right-aligned header actions. */
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

/**
 * A titled content card used to group related content on a page. When no
 * title is provided it renders as a plain padded surface.
 */
export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || action)

  return (
    <Card className={cn('shadow-card', className)}>
      {hasHeader && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(!hasHeader && 'pt-6', contentClassName)}>{children}</CardContent>
    </Card>
  )
}
