import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { FullPageLoader } from '@/shared/components/common/FullPageLoader'
import { useAuth } from './use-auth'

interface LocationState {
  from?: { pathname?: string; search?: string; hash?: string }
}

/**
 * Gate for guest-only routes (the login page).
 *
 * Authenticated admins are redirected away from /login — back to the route they
 * originally tried to reach (captured by ProtectedRoute) or the dashboard.
 * While a stored session is being restored we wait, to avoid briefly showing
 * the login form to a user who is in fact signed in.
 */
export function GuestRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageLoader label="Loading…" />
  }

  if (status === 'authenticated') {
    const state = location.state as LocationState | null
    const from = state?.from
    const target = from?.pathname
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : ROUTES.dashboard
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
