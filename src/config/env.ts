import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
  VITE_APP_NAME: z.string().min(1, 'VITE_APP_NAME must not be empty'),
  VITE_ENABLE_QUERY_DEVTOOLS: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const formatted = JSON.stringify(parsed.error.format(), null, 2)
  throw new Error(`Invalid environment variables:\n${formatted}`)
}

export const env = parsed.data

/**
 * Normalized API base URL (trailing slash removed) used by the central HTTP
 * client. The schema already guarantees this is a valid URL and throws clearly
 * at startup if it is missing or malformed.
 */
export const apiBaseUrl = parsed.data.VITE_API_BASE_URL.replace(/\/+$/, '')
