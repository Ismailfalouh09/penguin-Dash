import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'
import { getNavigationForRole } from '@/config/navigation'
import { useCurrentUser } from '@/features/auth/current-user'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'

interface SidebarNavProps {
  /** Icon-only mode for the collapsed desktop sidebar. */
  collapsed?: boolean
  /** Called after a link is activated (closes the mobile drawer). */
  onNavigate?: () => void
}

/**
 * The navigation list, driven entirely by the central NAVIGATION config and
 * filtered for the current user's role. Shared by the desktop sidebar and the
 * mobile drawer so there is a single rendering of nav items.
 */
export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const { user } = useCurrentUser()
  const groups = getNavigationForRole(user.role)

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          {group.label && !collapsed && (
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const Icon = item.icon
            const link = (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    collapsed && 'justify-center px-0',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )
                }
              >
                <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && <span className="sr-only">{item.label}</span>}
              </NavLink>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return link
          })}
        </div>
      ))}
    </nav>
  )
}
