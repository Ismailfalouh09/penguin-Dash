/**
 * Central HTTP client for the admin dashboard.
 *
 * This is the single low-level transport used by the generated API client
 * (Orval is configured to call `customFetch` as its mutator). There is exactly
 * one HTTP client in the app — generated code and any handwritten calls route
 * through here.
 *
 * It implements Orval's fetch-client mutator contract:
 *   customFetch<T>(url, init) => Promise<{ status, data, headers }>
 * The generated code bakes query params into `url`, pre-serializes JSON bodies,
 * and builds `FormData` for multipart uploads, so this layer stays thin.
 *
 * Responsibilities:
 *  - Resolve the backend base URL from the typed env (never hardcoded).
 *  - Ensure JSON requests carry the right headers; pass multipart through as-is.
 *  - Forward `AbortSignal` for request cancellation (TanStack Query passes one).
 *  - Surface failures as a normalized `ApiError`.
 *
 * Authentication is intentionally NOT implemented here yet. A request
 * interceptor registry is provided as the extension point so Task 4 can inject
 * a Bearer token without modifying this file or any generated code.
 */
import { apiBaseUrl } from '@/config/env'
import { ApiError, apiErrorFromResponse, normalizeApiError } from './errors'

/** A request about to be sent, exposed to interceptors. */
export interface OutgoingRequest {
  url: string
  init: RequestInit
}

type RequestInterceptor = (request: OutgoingRequest) => OutgoingRequest | Promise<OutgoingRequest>

const requestInterceptors: RequestInterceptor[] = []

/**
 * Register a request interceptor (e.g. to add an Authorization header in
 * Task 4). Returns an unsubscribe function. No interceptors are registered by
 * default — this task adds no authentication behavior.
 */
export function registerRequestInterceptor(interceptor: RequestInterceptor): () => void {
  requestInterceptors.push(interceptor)
  return () => {
    const index = requestInterceptors.indexOf(interceptor)
    if (index !== -1) requestInterceptors.splice(index, 1)
  }
}

/** Test/utility helper to clear all interceptors. */
export function clearRequestInterceptors(): void {
  requestInterceptors.length = 0
}

function headerEntries(headers: HeadersInit | undefined): [string, string][] {
  if (!headers) return []
  if (headers instanceof Headers) return [...headers.entries()]
  if (Array.isArray(headers)) return headers as [string, string][]
  return Object.entries(headers)
}

function hasHeader(headers: Headers, name: string): boolean {
  return headers.has(name)
}

/** Join the base URL and an (already param-baked) path; pass absolute URLs through. */
export function buildRequestUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBaseUrl}${normalizedPath}`
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined
  }
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Generated response wrapper exposing the status, parsed data and headers. */
interface FetchResponse<TData> {
  status: number
  data: TData
  headers: Headers
}

/**
 * The mutator invoked by every generated API function. Returns the typed
 * response wrapper on success and throws a normalized `ApiError` on failure.
 * Aborted requests reject with the original `AbortError` so TanStack Query can
 * recognize the cancellation.
 */
export async function customFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(headerEntries(init.headers))
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData

  if (isFormData) {
    // Let the browser set the multipart boundary.
    headers.delete('Content-Type')
  } else if (typeof init.body === 'string' && !hasHeader(headers, 'Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (!hasHeader(headers, 'Accept')) headers.set('Accept', 'application/json')

  let request: OutgoingRequest = { url: buildRequestUrl(url), init: { ...init, headers } }
  for (const interceptor of requestInterceptors) {
    request = await interceptor(request)
  }

  let response: Response
  try {
    response = await fetch(request.url, request.init)
  } catch (error) {
    // Preserve aborts so TanStack Query treats them as cancellations. The
    // concrete type varies by runtime (DOMException in browsers, Error in
    // some Node/undici versions), so match on the name.
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw normalizeApiError(error)
  }

  if (!response.ok) {
    const errorBody = await parseBody(response).catch(() => undefined)
    throw apiErrorFromResponse(response.status, errorBody)
  }

  const data = (await parseBody(response)) as T
  return {
    status: response.status,
    data,
    headers: response.headers,
  } as FetchResponse<T> as T
}

export { ApiError }
