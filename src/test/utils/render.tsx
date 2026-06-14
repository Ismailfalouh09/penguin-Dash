import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { CurrentUserProvider } from '@/features/auth/current-user'
import type { AdminUser } from '@/features/auth/types'
import type { Role } from '@/features/auth/roles'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

/** Build a test admin user with a given role. */
export function makeTestUser(role: Role = 'OWNER'): AdminUser {
  return {
    id: `test-${role.toLowerCase()}`,
    fullName: `Test ${role}`,
    email: `${role.toLowerCase()}@test.local`,
    role,
  }
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  /** Role for the CurrentUserProvider — drives permission-gated UI in tests. */
  role?: Role
}

interface AllProvidersProps {
  children: React.ReactNode
  initialEntries: string[]
  role: Role
}

function AllProviders({ children, initialEntries, role }: AllProvidersProps) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider user={makeTestUser(role)}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </CurrentUserProvider>
    </QueryClientProvider>
  )
}

function customRender(ui: React.ReactElement, options?: CustomRenderOptions) {
  const { initialEntries = ['/'], role = 'OWNER', ...renderOptions } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries} role={role}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }
