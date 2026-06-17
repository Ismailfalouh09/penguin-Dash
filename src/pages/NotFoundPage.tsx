import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { Button } from '@/shared/components/ui/button'

/**
 * 404 page. Rendered inside the shell so the user keeps navigation and can
 * return to the dashboard.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span
        className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Compass className="size-7" />
      </span>
      <p className="text-sm font-medium text-muted-foreground" aria-hidden="true">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.dashboard}>Back to dashboard</Link>
      </Button>
    </div>
  )
}
