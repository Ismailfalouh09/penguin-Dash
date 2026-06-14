import type { CurrentAdminResponse } from '@/lib/api/generated/models'
import type { Role } from './roles'

/**
 * Minimal admin user shape used by the dashboard UI.
 *
 * Mirrors the `admin` returned by `GET /auth/me` (`CurrentAdminResponse`),
 * narrowed to the fields the shell renders. The mapping from the generated
 * response lives in `fromCurrentAdmin` so the rest of the app depends only on
 * this stable UI type, not on generated names.
 */
export interface AdminUser {
  id: string
  fullName: string
  email: string
  role: Role
  isActive: boolean
}

/** Map the generated `GET /auth/me` response to the UI `AdminUser`. */
export function fromCurrentAdmin(admin: CurrentAdminResponse): AdminUser {
  return {
    id: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
  }
}
