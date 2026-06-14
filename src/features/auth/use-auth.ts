import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'

/** Access the authentication session. Must be used within an `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
