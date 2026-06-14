/**
 * Central API error model and normalization utilities.
 *
 * Every failed request flows through here so the rest of the app sees one
 * consistent shape regardless of whether the failure was an HTTP error, a
 * network failure, or something unexpected. Raw backend stack traces are never
 * surfaced to users.
 *
 * The backend uses NestJS's default error envelope (see
 * frontend-handoff/openapi.json → components.schemas.ApiErrorResponse):
 *
 *   { statusCode: number, message: string | string[], error?: string }
 */

/** The backend's error response envelope. */
export interface ApiErrorResponseBody {
  statusCode?: number
  message?: string | string[]
  error?: string
}

/** Normalized error shape consumed by the whole frontend. */
export interface ApiErrorShape {
  status?: number
  title: string
  message: string
  details?: string[]
  code?: string
  originalError?: unknown
}

/**
 * Error thrown by the HTTP client and used across the app. Extends `Error` so
 * it can be thrown/caught and recognized with `instanceof`, while carrying the
 * normalized fields.
 */
export class ApiError extends Error implements ApiErrorShape {
  readonly status?: number
  readonly title: string
  readonly details?: string[]
  readonly code?: string
  readonly originalError?: unknown

  constructor(init: ApiErrorShape) {
    super(init.message)
    this.name = 'ApiError'
    this.title = init.title
    this.status = init.status
    this.details = init.details
    this.code = init.code
    this.originalError = init.originalError
  }
}

/** Friendly title per HTTP status family. */
function titleForStatus(status: number, fallback?: string): string {
  switch (status) {
    case 400:
      return 'Invalid request'
    case 401:
      return 'Authentication required'
    case 403:
      return 'Access denied'
    case 404:
      return 'Not found'
    case 409:
      return 'Conflict'
    case 422:
      return 'Validation failed'
    default:
      if (status >= 500) return 'Server error'
      return fallback ?? 'Request failed'
  }
}

/** Default user-facing message per HTTP status family. */
function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid. Please check the submitted data.'
    case 401:
      return 'You need to sign in to continue.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource could not be found.'
    case 409:
      return 'This action conflicts with the current state of the resource.'
    default:
      if (status >= 500) return 'Something went wrong on the server. Please try again later.'
      return 'The request could not be completed.'
  }
}

function isErrorBody(body: unknown): body is ApiErrorResponseBody {
  return typeof body === 'object' && body !== null
}

/**
 * Build a normalized `ApiError` from an HTTP response status and parsed body.
 * Handles the `message: string | string[]` union from the backend.
 */
export function apiErrorFromResponse(status: number, body: unknown): ApiError {
  let message: string | undefined
  let details: string[] | undefined
  let code: string | undefined

  if (isErrorBody(body)) {
    if (Array.isArray(body.message)) {
      details = body.message
      message = body.message[0]
    } else if (typeof body.message === 'string') {
      message = body.message
    }
    if (typeof body.error === 'string') {
      code = body.error
    }
  }

  return new ApiError({
    status,
    title: titleForStatus(status, code),
    message: message ?? messageForStatus(status),
    details,
    code: code ?? String(status),
    originalError: body,
  })
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : typeof error === 'object' &&
        error !== null &&
        (error as { name?: string }).name === 'AbortError'
}

/**
 * Coerce any thrown value into an `ApiError`. Already-normalized errors pass
 * through; aborts, network failures, and unknown values get sensible defaults.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (isAbortError(error)) {
    return new ApiError({
      title: 'Request cancelled',
      message: 'The request was cancelled.',
      code: 'CANCELLED',
      originalError: error,
    })
  }

  // fetch throws TypeError for network-level failures (DNS, offline, CORS).
  if (error instanceof TypeError) {
    return new ApiError({
      title: 'Network error',
      message: 'Unable to reach the server. Check your connection and try again.',
      code: 'NETWORK',
      originalError: error,
    })
  }

  if (error instanceof Error) {
    return new ApiError({
      title: 'Unexpected error',
      message: error.message || 'An unexpected error occurred.',
      code: 'UNKNOWN',
      originalError: error,
    })
  }

  return new ApiError({
    title: 'Unexpected error',
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN',
    originalError: error,
  })
}

/** Convenience: get a user-facing message from any thrown value. */
export function getApiErrorMessage(error: unknown): string {
  return normalizeApiError(error).message
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isUnauthorizedError(error: unknown): boolean {
  return normalizeApiError(error).status === 401
}

export function isForbiddenError(error: unknown): boolean {
  return normalizeApiError(error).status === 403
}

export function isNotFoundError(error: unknown): boolean {
  return normalizeApiError(error).status === 404
}

export function isValidationError(error: unknown): boolean {
  const normalized = normalizeApiError(error)
  return normalized.status === 400 || normalized.status === 422
}

export function isNetworkError(error: unknown): boolean {
  return normalizeApiError(error).code === 'NETWORK'
}
