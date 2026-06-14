import { registerRequestInterceptor } from '@/lib/api/http-client'
import { getStoredToken } from './token-storage'

/**
 * Install the Authorization-header interceptor into the single HTTP client.
 *
 * Every outgoing request reads the current access token from storage and, when
 * present, attaches `Authorization: Bearer <token>`. Reading at request time
 * (rather than capturing once) means login and logout take effect immediately
 * without re-registering. Returns the unsubscribe function from the client.
 *
 * The token is never logged and never added to the URL — only this header.
 */
export function installAuthInterceptor(): () => void {
  return registerRequestInterceptor((request) => {
    const token = getStoredToken()
    if (!token) return request

    const headers = new Headers(request.init.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return { ...request, init: { ...request.init, headers } }
  })
}
