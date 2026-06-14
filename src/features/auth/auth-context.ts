import { createContext } from 'react'
import type { AdminUser } from './types'

/** Lifecycle of the authentication session. */
export type AuthStatus =
  | 'loading' // restoring a stored session via GET /auth/me
  | 'authenticated'
  | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  /** The signed-in admin, or `null` when not authenticated. */
  admin: AdminUser | null
  isAuthenticated: boolean
  /** Authenticate with credentials, then load and store the current admin. */
  login: (credentials: { email: string; password: string }) => Promise<void>
  /** Clear the token, admin state, and protected query cache. */
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
