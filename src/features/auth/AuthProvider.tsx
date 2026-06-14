import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  authControllerLogin,
  authControllerMe,
} from '@/lib/api/generated/endpoints/authentication/authentication'
import type { AuthLoginResponse, CurrentAdminResponse } from '@/lib/api/generated/models'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import { setUnauthorizedHandler } from './auth-events'
import { installAuthInterceptor } from './auth-interceptor'
import { clearStoredToken, getStoredToken, setStoredToken } from './token-storage'
import { fromCurrentAdmin, type AdminUser } from './types'

/**
 * Thin wrappers that narrow the generated union responses.
 *
 * The generated functions type `data` as `Success | void` because the spec
 * documents a `401` with an empty body. Our `customFetch` mutator throws on any
 * non-2xx status, so a resolved promise always carries the success payload —
 * these helpers encode that invariant in one place instead of casting inline.
 */
async function fetchLogin(credentials: { email: string; password: string }) {
  const { data } = await authControllerLogin(credentials)
  return data as AuthLoginResponse
}

async function fetchMe() {
  const { data } = await authControllerMe()
  return data as CurrentAdminResponse
}

/**
 * Owns the authentication session for the whole app.
 *
 * Responsibilities:
 *  - Install the Bearer-header interceptor on the single HTTP client.
 *  - On startup, restore a session from the stored token via `GET /auth/me`,
 *    or clear an invalid token.
 *  - Expose `login` (POST /auth/login → store token → GET /auth/me) and
 *    `logout` (clear token + admin state + protected query cache).
 *  - Register the global `401` handler so any failed authenticated request
 *    tears the session down.
 *
 * This provider must sit inside the QueryClientProvider (it uses the client to
 * clear the cache on logout).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  // Start in `loading` only if there is a token to restore; otherwise we are
  // immediately and definitively unauthenticated.
  const [status, setStatus] = useState<AuthStatus>(() =>
    getStoredToken() ? 'loading' : 'unauthenticated'
  )

  // Install the Authorization-header interceptor exactly once for the app.
  useEffect(() => installAuthInterceptor(), [])

  const clearSession = useCallback(() => {
    clearStoredToken()
    setAdmin(null)
    setStatus('unauthenticated')
    // Drop every cached protected response so a future session never reads
    // another admin's data.
    queryClient.clear()
  }, [queryClient])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  // Wire the global 401 handler to the same teardown used by manual logout.
  useEffect(() => setUnauthorizedHandler(clearSession), [clearSession])

  // One-time session restoration on startup.
  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true

    const token = getStoredToken()
    if (!token) {
      setStatus('unauthenticated')
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const data = await fetchMe()
        if (cancelled) return
        setAdmin(fromCurrentAdmin(data))
        setStatus('authenticated')
      } catch {
        // Invalid/expired token — discard it and fall back to signed-out.
        if (cancelled) return
        clearStoredToken()
        setAdmin(null)
        setStatus('unauthenticated')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback<AuthContextValue['login']>(async ({ email, password }) => {
    const loginResult = await fetchLogin({ email, password })
    setStoredToken(loginResult.accessToken)
    // Re-fetch the canonical current admin so the shape always matches /auth/me.
    const me = await fetchMe()
    setAdmin(fromCurrentAdmin(me))
    setStatus('authenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      admin,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
    }),
    [status, admin, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
