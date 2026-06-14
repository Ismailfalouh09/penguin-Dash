import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import type { Permission, Role } from './roles'
import { useCurrentUser } from './current-user'

interface RoleGuardProps {
  /** Roles allowed past this guard. */
  roles?: readonly Role[]
  /** Capability required past this guard. */
  permission?: Permission
  /**
   * What to render to children. Defaults to a nested `<Outlet />` so the guard
   * can wrap a branch of routes; pass `children` to guard a single element.
   */
  children?: React.ReactNode
}

/**
 * Route-level authorization guard. Unlike `PermissionGuard` (which hides UI
 * inline), this redirects unauthorized but authenticated users to /forbidden.
 *
 * Must be rendered inside a `ProtectedRoute` (it relies on an authenticated
 * current user). The backend remains the authoritative gate; this only keeps
 * the UI honest about where a role can navigate.
 */
export function RoleGuard({ roles, permission, children }: RoleGuardProps) {
  const { isRole, can } = useCurrentUser()

  const allowed = (roles ? isRole(roles) : true) && (permission ? can(permission) : true)

  if (!allowed) {
    return <Navigate to={ROUTES.forbidden} replace />
  }

  return <>{children ?? <Outlet />}</>
}
