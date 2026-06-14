import { useContext } from 'react'
import { ToastContext } from '@/shared/components/ui/toast'

/**
 * Access the toast API. Must be used within a `ToastProvider`.
 *
 * @example
 *   const { toast } = useToast()
 *   toast({ tone: 'success', title: 'Saved', description: 'Changes stored.' })
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
