import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { FullPageLoader } from '@/shared/components/common/FullPageLoader'
import { CurrentUserProvider } from './current-user'
import { useAuth } from './use-auth'

/**
 * Gate for authenticated areas of the app.
 *
 *  - While the stored session is being restored, render a full-page loader so
 *    we never flash the login screen for an already-signed-in admin.
 *  - When unauthenticated, redirect to /login and preserve the originally
 *    requested location in router state so login can return there.
 *  - When authenticated, expose the admin to the tree via CurrentUserProvider.
 */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageLoader label="Restoring your session…" />
  }

  if (status !== 'authenticated') {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return (
    <CurrentUserProvider>
      <Outlet />
    </CurrentUserProvider>
  )
}
