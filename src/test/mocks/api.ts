import { apiBaseUrl } from '@/config/env'

/**
 * Build a full URL for an MSW handler that targets the configured API base.
 * Keeps mock handlers aligned with the central HTTP client's URL resolution.
 */
export function apiUrl(path: string): string {
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}
