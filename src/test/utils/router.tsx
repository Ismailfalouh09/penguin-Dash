import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CurrentUserProvider } from '@/features/auth/current-user'
import { makeTestUser } from './render'
import type { Role } from '@/features/auth/roles'

interface RenderRouterOptions {
  initialEntries?: string[]
  role?: Role
}

/**
 * Render a set of routes through a real data router (createMemoryRouter), so
 * data-router hooks like useMatches/Outlet work. Wraps the tree in the same
 * providers the app uses (current user + query client).
 */
export function renderWithRouter(routes: RouteObject[], options?: RenderRouterOptions) {
  const { initialEntries = ['/'], role = 'OWNER' } = options ?? {}
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries })

  return render(
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider user={makeTestUser(role)}>
        <RouterProvider router={router} />
      </CurrentUserProvider>
    </QueryClientProvider>
  )
}
