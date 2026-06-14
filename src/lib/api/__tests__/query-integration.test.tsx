import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { createQueryClient, shouldRetryQuery } from '../query-client'
import { ApiError, apiErrorFromResponse } from '../errors'
import { useAdminCategoriesControllerFindAll } from '../generated/endpoints/admin-categories/admin-categories'

function withClient() {
  // A fresh application QueryClient per test keeps caches isolated.
  const queryClient = createQueryClient()
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return wrapper
}

describe('shouldRetryQuery', () => {
  it('does not retry 4xx client errors', () => {
    const error = apiErrorFromResponse(400, { statusCode: 400, message: 'bad' })
    expect(shouldRetryQuery(0, error)).toBe(false)
  })

  it('retries server/network errors up to twice', () => {
    const error = apiErrorFromResponse(500, { statusCode: 500, message: 'oops' })
    expect(shouldRetryQuery(0, error)).toBe(true)
    expect(shouldRetryQuery(1, error)).toBe(true)
    expect(shouldRetryQuery(2, error)).toBe(false)
  })
})

describe('generated query with the application QueryClient', () => {
  it('returns the mocked response data on success', async () => {
    const payload = {
      data: [],
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
    server.use(http.get(apiUrl('/admin/categories'), () => HttpResponse.json(payload)))

    const { result } = renderHook(() => useAdminCategoriesControllerFindAll(), {
      wrapper: withClient(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toEqual(payload)
  })

  it('exposes a normalized ApiError on failure (4xx fails fast, no retry)', async () => {
    server.use(
      http.get(apiUrl('/admin/categories'), () =>
        HttpResponse.json(
          { statusCode: 400, message: 'Bad query', error: 'Bad Request' },
          { status: 400 }
        )
      )
    )

    const { result } = renderHook(() => useAdminCategoriesControllerFindAll(), {
      wrapper: withClient(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(ApiError)
    expect((result.current.error as unknown as ApiError).status).toBe(400)
  })
})
