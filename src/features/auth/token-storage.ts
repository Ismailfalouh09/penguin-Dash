/**
 * Central access-token storage for the admin session.
 *
 * The token is the single source of truth for "is there a session to restore".
 * It is kept in `sessionStorage` so it is scoped to the browser tab and cleared
 * when the tab closes — a safer default than `localStorage` for an admin tool.
 *
 * The token is read by the request interceptor that injects the `Authorization`
 * header (see `auth-interceptor.ts`) and by the `AuthProvider` on startup. It is
 * NEVER logged, never placed in a URL, and never exposed outside this module's
 * accessors.
 */

const TOKEN_STORAGE_KEY = 'penguin.auth.accessToken'

/** Read the stored access token, or `null` if there is no session. */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    // Storage can throw (privacy mode, disabled storage); treat as no session.
    return null
  }
}

/** Persist the access token for the current tab session. */
export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // Best-effort: if storage is unavailable the session simply won't survive
    // a reload. The in-memory auth state still works for the current page life.
  }
}

/** Remove the stored access token (logout / invalid session). */
export function clearStoredToken(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Ignore — nothing actionable if storage is unavailable.
  }
}
