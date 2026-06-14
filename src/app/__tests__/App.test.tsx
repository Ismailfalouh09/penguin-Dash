import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Application providers', () => {
  it('renders HomePage within QueryClientProvider and Router', () => {
    render(
      <TestProviders>
        <HomePage />
      </TestProviders>
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Penguin Beauty Admin' })).toBeInTheDocument()
  })

  it('renders NotFoundPage within Router', () => {
    render(
      <TestProviders>
        <NotFoundPage />
      </TestProviders>
    )
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })

  it('QueryClientProvider supplies a query client to children', () => {
    const queryClient = new QueryClient()
    let receivedClient = false

    function TestChild() {
      const client = useQueryClient()
      receivedClient = !!client
      return null
    }

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TestChild />
        </MemoryRouter>
      </QueryClientProvider>
    )
    expect(receivedClient).toBe(true)
  })
})
