/**
 * Global authentication event hooks, decoupled from React.
 *
 * The HTTP client and the shared QueryClient live outside the React tree, so
 * they cannot call `useAuth`. This tiny registry lets the `AuthProvider`
 * register a single handler that is invoked whenever an authenticated request
 * comes back `401 Unauthorized`. The handler clears the session and redirects
 * to /login.
 *
 * `403 Forbidden` is intentionally NOT handled here: a forbidden response means
 * the session is valid but lacks permission, so the user must stay signed in.
 */

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

/** Register the global 401 handler. Returns an unsubscribe function. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): () => void {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null
  }
}

/** Invoke the registered 401 handler, if any. */
export function notifyUnauthorized(): void {
  unauthorizedHandler?.()
}
