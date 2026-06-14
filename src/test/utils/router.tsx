import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthContext, type AuthContextValue } from '@/features/auth/auth-context'
import { CurrentUserProvider } from '@/features/auth/current-user'
import { ToastProvider } from '@/shared/components/ui/toast'
import { makeTestUser } from './render'
import type { AdminUser } from '@/features/auth/types'
import type { Role } from '@/features/auth/roles'

interface RenderRouterOptions {
  initialEntries?: string[]
  role?: Role
  /** Simulate an unauthenticated session (default: authenticated). */
  unauthenticated?: boolean
}

function makeTestAuthValue(admin: AdminUser): AuthContextValue {
  return {
    status: 'authenticated',
    admin,
    isAuthenticated: true,
    login: () => Promise.resolve(),
    logout: () => undefined,
  }
}

function makeGuestAuthValue(): AuthContextValue {
  return {
    status: 'unauthenticated',
    admin: null,
    isAuthenticated: false,
    login: () => Promise.resolve(),
    logout: () => undefined,
  }
}

/**
 * Render a set of routes through a real data router (createMemoryRouter), so
 * data-router hooks like useMatches/Outlet work. Wraps the tree in the same
 * providers the app uses (current user + query client).
 *
 * Pass `unauthenticated: true` to simulate a guest session (for login-page tests).
 */
export function renderWithRouter(routes: RouteObject[], options?: RenderRouterOptions) {
  const { initialEntries = ['/'], role = 'OWNER', unauthenticated = false } = options ?? {}
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries })
  const admin = makeTestUser(role)
  const authValue = unauthenticated ? makeGuestAuthValue() : makeTestAuthValue(admin)

  const tree = unauthenticated ? (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <RouterProvider router={router} />
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>
  ) : (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthContext.Provider value={authValue}>
          <CurrentUserProvider user={admin}>
            <RouterProvider router={router} />
          </CurrentUserProvider>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>
  )

  return render(tree)
}
