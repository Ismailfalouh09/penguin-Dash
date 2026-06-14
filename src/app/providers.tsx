import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { env } from '@/config/env'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { createQueryClient } from '@/lib/api/query-client'

const queryClient = createQueryClient()

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Owns the auth session; the current admin is exposed per-route by
          ProtectedRoute via CurrentUserProvider. */}
      <AuthProvider>{children}</AuthProvider>
      {env.VITE_ENABLE_QUERY_DEVTOOLS && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
