/**
 * Role & permission model for the admin dashboard.
 *
 * The backend remains the authoritative source of authorization (see
 * frontend-handoff/ROLE_PERMISSION_MATRIX.md). The frontend mirrors that
 * matrix only to drive UI affordances — hiding write actions and gating
 * navigation for usability. It never grants access the backend would deny.
 */

export const ROLES = ['OWNER', 'ADMIN', 'STAFF'] as const

export type Role = (typeof ROLES)[number]

/**
 * Capabilities used to gate UI. Kept intentionally coarse to match the
 * current backend matrix, where the only real split is read vs. write.
 */
export type Permission =
  | 'read' // view any admin page — all roles
  | 'write' // create / update / delete / reorder / archive / deactivate
  | 'media:manage' // upload / replace / reorder / delete catalog media
  | 'orders:update-status'
  | 'recommendations:preview'

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OWNER: ['read', 'write', 'media:manage', 'orders:update-status', 'recommendations:preview'],
  ADMIN: ['read', 'write', 'media:manage', 'orders:update-status', 'recommendations:preview'],
  STAFF: ['read', 'recommendations:preview'],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function hasAnyRole(role: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(role)
}

/** Human-readable label for a role, for display in menus and badges. */
export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  STAFF: 'Staff',
}
