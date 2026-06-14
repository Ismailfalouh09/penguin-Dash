import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { Button } from '@/shared/components/ui/button'

/**
 * 403 page. Shown when a user is authenticated but lacks permission for a
 * destination. Rendered inside the shell so navigation remains available.
 */
export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span
        className="mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        aria-hidden="true"
      >
        <ShieldAlert className="size-7" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Access denied</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You don&apos;t have permission to view this page. If you believe this is a mistake, contact
        an owner or administrator.
      </p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.dashboard}>Back to dashboard</Link>
      </Button>
    </div>
  )
}
