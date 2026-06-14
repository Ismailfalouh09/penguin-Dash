import { cn } from '@/shared/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** Right-aligned actions (buttons, menus). */
  actions?: React.ReactNode
  className?: string
}

/**
 * Standard page heading: title + optional description on the left, optional
 * actions on the right. Stacks on small screens.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
