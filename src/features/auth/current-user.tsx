import { createContext, useContext, useMemo } from 'react'
import type { AdminUser } from './types'
import type { Permission, Role } from './roles'
import { hasAnyRole, hasPermission } from './roles'
import { useAuth } from './use-auth'

/**
 * Current-user context: the authenticated admin plus role/permission helpers
 * used to drive UI affordances (hiding write actions, gating navigation).
 *
 * Two ways to provide a value:
 *  - In the app, render `<CurrentUserProvider>` WITHOUT a `user` prop inside an
 *    `AuthProvider`; it reads the signed-in admin from `useAuth()`.
 *  - In tests and design previews, pass an explicit `user` so the provider is
 *    self-contained and needs no AuthProvider.
 *
 * Authorization here is advisory only — the backend is the authoritative gate.
 */
interface CurrentUserContextValue {
  user: AdminUser
  /** True when the user is injected mock data (tests/previews), not /auth/me. */
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
  user: userOverride,
  isPlaceholder,
}: CurrentUserProviderProps) {
  return userOverride ? (
    <ProviderWithUser user={userOverride} isPlaceholder={isPlaceholder ?? true}>
      {children}
    </ProviderWithUser>
  ) : (
    <ProviderFromAuth>{children}</ProviderFromAuth>
  )
}

/** Self-contained provider for an explicitly supplied user (tests/previews). */
function ProviderWithUser({
  children,
  user,
  isPlaceholder,
}: {
  children: React.ReactNode
  user: AdminUser
  isPlaceholder: boolean
}) {
  const value = useMemo<CurrentUserContextValue>(
    () => buildValue(user, isPlaceholder),
    [user, isPlaceholder]
  )
  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

/** App provider: derives the current user from the authentication session. */
function ProviderFromAuth({ children }: { children: React.ReactNode }) {
  const { admin } = useAuth()
  // This provider is only mounted behind a ProtectedRoute, which guarantees an
  // authenticated admin before rendering. The guard keeps types honest.
  if (!admin) {
    throw new Error('CurrentUserProvider requires an authenticated admin')
  }
  const value = useMemo<CurrentUserContextValue>(() => buildValue(admin, false), [admin])
  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

function buildValue(user: AdminUser, isPlaceholder: boolean): CurrentUserContextValue {
  return {
    user,
    isPlaceholder,
    can: (permission) => hasPermission(user.role, permission),
    isRole: (allowed) => hasAnyRole(user.role, allowed),
  }
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider')
  }
  return ctx
}
