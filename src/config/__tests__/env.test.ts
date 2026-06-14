import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// We test the schema logic in isolation — not the module itself (which reads import.meta.env at load time)
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1),
  VITE_ENABLE_QUERY_DEVTOOLS: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
})

describe('env schema', () => {
  it('parses valid environment variables', () => {
    const result = envSchema.safeParse({
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_APP_NAME: 'Penguin Beauty Admin',
      VITE_ENABLE_QUERY_DEVTOOLS: 'true',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.VITE_API_BASE_URL).toBe('http://localhost:3000')
      expect(result.data.VITE_APP_NAME).toBe('Penguin Beauty Admin')
      expect(result.data.VITE_ENABLE_QUERY_DEVTOOLS).toBe(true)
    }
  })

  it('rejects an invalid API URL', () => {
    const result = envSchema.safeParse({
      VITE_API_BASE_URL: 'not-a-url',
      VITE_APP_NAME: 'Test',
      VITE_ENABLE_QUERY_DEVTOOLS: 'false',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty app name', () => {
    const result = envSchema.safeParse({
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_APP_NAME: '',
      VITE_ENABLE_QUERY_DEVTOOLS: 'false',
    })
    expect(result.success).toBe(false)
  })

  it('defaults VITE_ENABLE_QUERY_DEVTOOLS to false when absent', () => {
    const result = envSchema.safeParse({
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_APP_NAME: 'Test',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.VITE_ENABLE_QUERY_DEVTOOLS).toBe(false)
    }
  })

  it('transforms "false" string to boolean false', () => {
    const result = envSchema.safeParse({
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_APP_NAME: 'Test',
      VITE_ENABLE_QUERY_DEVTOOLS: 'false',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.VITE_ENABLE_QUERY_DEVTOOLS).toBe(false)
    }
  })
})
