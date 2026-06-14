import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '@/features/auth/auth-context'
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
    isActive: true,
  }
}

/** Stub auth context value for tests — no real API calls, no token storage. */
function makeTestAuthValue(admin: AdminUser): AuthContextValue {
  return {
    status: 'authenticated',
    admin,
    isAuthenticated: true,
    login: () => Promise.resolve(),
    logout: () => undefined,
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
  const admin = makeTestUser(role)
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={makeTestAuthValue(admin)}>
        <CurrentUserProvider user={admin}>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </CurrentUserProvider>
      </AuthContext.Provider>
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
