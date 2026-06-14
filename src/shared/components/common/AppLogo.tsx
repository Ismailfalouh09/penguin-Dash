import { Feather } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { env } from '@/config/env'

interface AppLogoProps {
  /** Hide the wordmark and show only the mark (collapsed sidebar). */
  collapsed?: boolean
  className?: string
}

/**
 * Application logo: a solid primary mark plus the configured app name.
 * The wordmark reads from VITE_APP_NAME so branding stays centralized.
 */
export function AppLogo({ collapsed = false, className }: AppLogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft"
        aria-hidden="true"
      >
        <Feather className="size-5" />
      </span>
      {!collapsed && (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {env.VITE_APP_NAME}
          </span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </span>
      )}
    </div>
  )
}
