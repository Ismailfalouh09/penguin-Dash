import type { Role } from './roles'

/**
 * Minimal admin user shape used by the dashboard UI.
 *
 * Mirrors the `admin` object returned by `POST /auth/login` and `GET /auth/me`
 * (id, fullName, email, role). This is a lightweight UI type only — it will be
 * superseded by generated types when the OpenAPI client lands (Task 14). It is
 * NOT a copy of any backend DTO or Prisma model.
 */
export interface AdminUser {
  id: string
  fullName: string
  email: string
  role: Role
}
