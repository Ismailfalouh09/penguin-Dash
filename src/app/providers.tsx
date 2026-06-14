import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { env } from '@/config/env'
import { CurrentUserProvider } from '@/features/auth/current-user'
import { createQueryClient } from '@/lib/api/query-client'

const queryClient = createQueryClient()

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Placeholder current user — replaced by real /auth/me in Task 4. */}
      <CurrentUserProvider>{children}</CurrentUserProvider>
      {env.VITE_ENABLE_QUERY_DEVTOOLS && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
