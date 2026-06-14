import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { env } from '@/config/env'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { createQueryClient } from '@/lib/api/query-client'
import { ToastProvider } from '@/shared/components/ui/toast'

const queryClient = createQueryClient()

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Owns the auth session; the current admin is exposed per-route by
          ProtectedRoute via CurrentUserProvider. ToastProvider sits inside the
          query client so query/mutation feedback hooks can raise toasts. */}
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
      {env.VITE_ENABLE_QUERY_DEVTOOLS && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
