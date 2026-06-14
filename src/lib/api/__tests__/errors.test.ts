import { describe, it, expect } from 'vitest'
import {
  ApiError,
  apiErrorFromResponse,
  normalizeApiError,
  getApiErrorMessage,
  isApiError,
  isUnauthorizedError,
  isForbiddenError,
  isNotFoundError,
  isValidationError,
  isNetworkError,
} from '../errors'

describe('apiErrorFromResponse', () => {
  it('normalizes a validation error with an array message into details', () => {
    const error = apiErrorFromResponse(400, {
      statusCode: 400,
      message: ['attributeGroupCode must not be empty', 'name is required'],
      error: 'Bad Request',
    })
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.title).toBe('Invalid request')
    expect(error.message).toBe('attributeGroupCode must not be empty')
    expect(error.details).toEqual(['attributeGroupCode must not be empty', 'name is required'])
    expect(error.code).toBe('Bad Request')
    expect(isValidationError(error)).toBe(true)
  })

  it('normalizes a string message', () => {
    const error = apiErrorFromResponse(409, {
      statusCode: 409,
      message: 'Code already exists',
      error: 'Conflict',
    })
    expect(error.message).toBe('Code already exists')
    expect(error.title).toBe('Conflict')
    expect(error.details).toBeUndefined()
  })

  it('normalizes 401 as unauthorized', () => {
    const error = apiErrorFromResponse(401, { statusCode: 401, message: 'Unauthorized' })
    expect(isUnauthorizedError(error)).toBe(true)
    expect(error.title).toBe('Authentication required')
  })

  it('normalizes 403 as forbidden', () => {
    const error = apiErrorFromResponse(403, { statusCode: 403, message: 'Forbidden' })
    expect(isForbiddenError(error)).toBe(true)
    expect(error.title).toBe('Access denied')
  })

  it('normalizes 404 as not found', () => {
    const error = apiErrorFromResponse(404, { statusCode: 404, message: 'Not Found' })
    expect(isNotFoundError(error)).toBe(true)
  })

  it('provides a safe default message for 500 without leaking a body', () => {
    const error = apiErrorFromResponse(500, undefined)
    expect(error.title).toBe('Server error')
    expect(error.message).toMatch(/something went wrong/i)
    expect(error.status).toBe(500)
  })
})

describe('normalizeApiError', () => {
  it('passes ApiError instances through unchanged', () => {
    const original = apiErrorFromResponse(404, { statusCode: 404, message: 'gone' })
    expect(normalizeApiError(original)).toBe(original)
  })

  it('treats a fetch TypeError as a network error', () => {
    const error = normalizeApiError(new TypeError('Failed to fetch'))
    expect(error.code).toBe('NETWORK')
    expect(isNetworkError(error)).toBe(true)
  })

  it('handles a generic Error', () => {
    const error = normalizeApiError(new Error('boom'))
    expect(error.code).toBe('UNKNOWN')
    expect(error.message).toBe('boom')
  })

  it('handles non-error unknown values safely', () => {
    const error = normalizeApiError('weird')
    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe('UNKNOWN')
    expect(error.message).toBe('An unexpected error occurred.')
  })

  it('marks AbortError as cancelled', () => {
    const abort = new DOMException('aborted', 'AbortError')
    const error = normalizeApiError(abort)
    expect(error.code).toBe('CANCELLED')
  })
})

describe('helpers', () => {
  it('getApiErrorMessage returns the normalized message', () => {
    expect(getApiErrorMessage(new TypeError('x'))).toMatch(/unable to reach/i)
  })

  it('isApiError discriminates correctly', () => {
    expect(isApiError(apiErrorFromResponse(400, {}))).toBe(true)
    expect(isApiError(new Error('no'))).toBe(false)
  })
})
