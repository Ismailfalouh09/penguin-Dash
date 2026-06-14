import { useEffect, useState } from 'react'
import { Outlet, useMatches } from 'react-router-dom'
import { env } from '@/config/env'
import { isRouteHandle } from '@/config/route-handle'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

const SIDEBAR_STORAGE_KEY = 'penguin.sidebar.collapsed'

function useDocumentTitle() {
  const matches = useMatches()
  useEffect(() => {
    const current = [...matches].reverse().find((m) => isRouteHandle(m.handle))
    const pageTitle = current && isRouteHandle(current.handle) ? current.handle.title : undefined
    document.title = pageTitle ? `${pageTitle} · ${env.VITE_APP_NAME}` : env.VITE_APP_NAME
  }, [matches])
}

/**
 * The dashboard shell: persistent desktop sidebar, mobile drawer, sticky
 * header and the routed content area. Collapsed state persists across reloads.
 */
export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  useDocumentTitle()

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <TooltipProvider delayDuration={200}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsed={collapsed} />
        <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onOpenMobileNav={() => setMobileOpen(true)}
            onToggleSidebar={() => setCollapsed((value) => !value)}
            sidebarCollapsed={collapsed}
          />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
