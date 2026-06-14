import { useCurrentUser } from '@/features/auth/current-user'
import type { Permission, Role } from '@/features/auth/roles'

interface PermissionGuardProps {
  /** Required capability. */
  permission?: Permission
  /** Restrict to specific roles (combined with `permission` via AND). */
  roles?: readonly Role[]
  children: React.ReactNode
  /** Rendered when access is denied. Defaults to nothing. */
  fallback?: React.ReactNode
}

/**
 * Conditionally renders children based on the current user's role/permission.
 *
 * This is a usability affordance only — it hides actions the user cannot
 * perform. The backend remains the authoritative gate for every request.
 */
export function PermissionGuard({
  permission,
  roles,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { can, isRole } = useCurrentUser()

  const permitted = (permission ? can(permission) : true) && (roles ? isRole(roles) : true)

  return <>{permitted ? children : fallback}</>
}
