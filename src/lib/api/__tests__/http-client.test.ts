import { describe, it, expect, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { apiBaseUrl } from '@/config/env'
import {
  customFetch,
  buildRequestUrl,
  registerRequestInterceptor,
  clearRequestInterceptors,
} from '../http-client'
import { ApiError } from '../errors'

afterEach(() => {
  clearRequestInterceptors()
})

describe('buildRequestUrl', () => {
  it('joins the configured base URL with a path', () => {
    expect(buildRequestUrl('/auth/me')).toBe(`${apiBaseUrl}/auth/me`)
  })

  it('passes absolute URLs through', () => {
    expect(buildRequestUrl('https://cdn.example.com/x')).toBe('https://cdn.example.com/x')
  })
})

describe('customFetch', () => {
  it('uses the configured base URL and returns a typed wrapper', async () => {
    server.use(http.get(apiUrl('/ping'), () => HttpResponse.json({ ok: true }, { status: 200 })))
    const result = await customFetch<{ ok: boolean }>('/ping', { method: 'GET' })
    expect(result).toMatchObject({ status: 200, data: { ok: true } })
  })

  it('sends JSON bodies with the correct content type', async () => {
    let receivedContentType: string | null = null
    let receivedBody: unknown = null
    server.use(
      http.post(apiUrl('/things'), async ({ request }) => {
        receivedContentType = request.headers.get('content-type')
        receivedBody = await request.json()
        return HttpResponse.json({ id: '1' }, { status: 201 })
      })
    )

    const result = await customFetch<{ id: string }>('/things', {
      method: 'POST',
      body: JSON.stringify({ name: 'Serum' }),
    })

    expect(receivedContentType).toContain('application/json')
    expect(receivedBody).toEqual({ name: 'Serum' })
    expect(result).toMatchObject({ status: 201, data: { id: '1' } })
  })

  it('sends multipart form data without forcing a JSON content type', async () => {
    let receivedContentType: string | null = null
    server.use(
      http.post(apiUrl('/upload'), ({ request }) => {
        receivedContentType = request.headers.get('content-type')
        return HttpResponse.json({ uploaded: true }, { status: 201 })
      })
    )

    const form = new FormData()
    form.append('file', new Blob(['data'], { type: 'text/plain' }), 'a.txt')

    await customFetch('/upload', { method: 'POST', body: form })

    expect(receivedContentType).toContain('multipart/form-data')
    expect(receivedContentType).not.toContain('application/json')
  })

  it('does not attach an Authorization header (no auth in this task)', async () => {
    let authHeader: string | null = 'unset'
    server.use(
      http.get(apiUrl('/secure'), ({ request }) => {
        authHeader = request.headers.get('authorization')
        return HttpResponse.json({}, { status: 200 })
      })
    )
    await customFetch('/secure', { method: 'GET' })
    expect(authHeader).toBeNull()
  })

  it('supports request cancellation via AbortSignal', async () => {
    server.use(
      http.get(apiUrl('/slow'), async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return HttpResponse.json({}, { status: 200 })
      })
    )

    const controller = new AbortController()
    const promise = customFetch('/slow', { method: 'GET', signal: controller.signal })
    controller.abort()

    await expect(promise).rejects.toSatisfy(
      (error: unknown) => error instanceof Error && error.name === 'AbortError'
    )
  })

  it('throws a normalized ApiError on HTTP error responses', async () => {
    server.use(
      http.get(apiUrl('/missing'), () =>
        HttpResponse.json(
          { statusCode: 404, message: 'Category not found', error: 'Not Found' },
          { status: 404 }
        )
      )
    )

    await expect(customFetch('/missing', { method: 'GET' })).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ApiError && error.status === 404 && error.message === 'Category not found'
    )
  })

  it('normalizes network failures', async () => {
    server.use(http.get(apiUrl('/down'), () => HttpResponse.error()))
    await expect(customFetch('/down', { method: 'GET' })).rejects.toSatisfy(
      (error: unknown) => error instanceof ApiError && error.code === 'NETWORK'
    )
  })

  it('runs registered request interceptors (future auth extension point)', async () => {
    let seenHeader: string | null = null
    server.use(
      http.get(apiUrl('/intercepted'), ({ request }) => {
        seenHeader = request.headers.get('x-test')
        return HttpResponse.json({}, { status: 200 })
      })
    )

    registerRequestInterceptor((req) => {
      const headers = new Headers(req.init.headers)
      headers.set('X-Test', 'yes')
      return { ...req, init: { ...req.init, headers } }
    })

    await customFetch('/intercepted', { method: 'GET' })
    expect(seenHeader).toBe('yes')
  })
})
