import { z } from 'zod'

/**
 * Validation schema for the login form, driven by React Hook Form + Zod.
 *
 * Mirrors the backend `LoginDto` shape (email + password). Validation here is
 * for UX only — the backend remains authoritative and rejects bad credentials.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .transform((value) => value.trim()),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
