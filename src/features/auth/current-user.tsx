import { createContext, useContext, useMemo } from 'react'
import type { AdminUser } from './types'
import type { Permission, Role } from './roles'
import { hasAnyRole, hasPermission } from './roles'

/**
 * PLACEHOLDER current user.
 *
 * Task 2 is the conception/design phase — authentication is NOT implemented.
 * This is obviously-fake data used only to render the shell. Task 3 will
 * replace the provider's value with the result of `GET /auth/me`.
 */
export const PLACEHOLDER_USER: AdminUser = {
  id: 'placeholder-user',
  fullName: 'Placeholder Admin',
  email: 'placeholder@penguin.local',
  role: 'OWNER',
}

interface CurrentUserContextValue {
  user: AdminUser
  /** True while the user is mock data (always true in Task 2). */
  isPlaceholder: boolean
  can: (permission: Permission) => boolean
  isRole: (allowed: readonly Role[]) => boolean
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)

interface CurrentUserProviderProps {
  children: React.ReactNode
  /** Override the user — used by tests and design previews. */
  user?: AdminUser
  isPlaceholder?: boolean
}

export function CurrentUserProvider({
  children,
  user = PLACEHOLDER_USER,
  isPlaceholder = true,
}: CurrentUserProviderProps) {
  const value = useMemo<CurrentUserContextValue>(
    () => ({
      user,
      isPlaceholder,
      can: (permission) => hasPermission(user.role, permission),
      isRole: (allowed) => hasAnyRole(user.role, allowed),
    }),
    [user, isPlaceholder]
  )

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider')
  }
  return ctx
}
