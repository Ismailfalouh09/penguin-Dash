import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { Breadcrumbs } from './Breadcrumbs'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  /** Opens the mobile navigation drawer. */
  onOpenMobileNav: () => void
  /** Toggles the desktop sidebar between expanded and collapsed. */
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

/**
 * Top application bar: navigation triggers (mobile drawer + desktop collapse),
 * the breadcrumb trail, and the user menu.
 */
export function Header({ onOpenMobileNav, onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      {/* Mobile: open drawer */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Desktop: collapse sidebar */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={onToggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-pressed={sidebarCollapsed}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </Button>

      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <UserMenu />
      </div>
    </header>
  )
}
