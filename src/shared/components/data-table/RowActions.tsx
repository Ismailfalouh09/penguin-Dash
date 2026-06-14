import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

export interface RowAction {
  label: string
  onSelect: () => void
  icon?: React.ComponentType<{ className?: string }>
  /** Renders the item in the destructive color (e.g. delete). */
  destructive?: boolean
  disabled?: boolean
  /** Insert a separator before this item. */
  separatorBefore?: boolean
}

interface RowActionsProps {
  actions: RowAction[]
  /** Accessible label for the trigger; defaults to a generic row label. */
  label?: string
  align?: 'start' | 'end'
}

/**
 * Standard per-row actions menu. Uses an icon trigger with an accessible label
 * (never an unlabeled icon button) and supports destructive items, disabling,
 * and grouping separators. Stops row-click propagation so opening the menu
 * doesn't trigger a row navigation.
 */
export function RowActions({ actions, label = 'Row actions', align = 'end' }: RowActionsProps) {
  if (actions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <div key={action.label}>
              {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                disabled={action.disabled}
                onSelect={action.onSelect}
                className={cn(
                  action.destructive && 'text-destructive focus:bg-destructive/10 focus:text-destructive'
                )}
              >
                {Icon && <Icon className="size-4" />}
                {action.label}
              </DropdownMenuItem>
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
