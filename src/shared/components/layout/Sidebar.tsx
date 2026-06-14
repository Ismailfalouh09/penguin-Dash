import { cn } from '@/shared/lib/utils'
import { AppLogo } from '@/shared/components/common/AppLogo'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { SidebarNav } from './SidebarNav'

interface SidebarProps {
  collapsed: boolean
}

/**
 * Desktop sidebar. Hidden below `lg`; the mobile drawer takes over there.
 * Collapses to an icon rail to give more room to the workspace.
 */
export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:flex lg:flex-col',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-border px-4',
          collapsed && 'justify-center px-0'
        )}
      >
        <AppLogo collapsed={collapsed} />
      </div>
      <ScrollArea className="flex-1">
        <div className={cn('p-3', collapsed && 'px-2')}>
          <SidebarNav collapsed={collapsed} />
        </div>
      </ScrollArea>
    </aside>
  )
}
