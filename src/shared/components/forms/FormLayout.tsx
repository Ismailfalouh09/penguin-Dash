import { cn } from '@/shared/lib/utils'

interface FormLayoutProps {
  /** The form element and its sections. */
  children: React.ReactNode
  className?: string
}

/**
 * Constrains a form to a comfortable single-column reading width and provides
 * consistent vertical rhythm between sections. Wrap your `<form>` content with
 * this; pair with `FormSection` and `FormActions`.
 */
export function FormLayout({ children, className }: FormLayoutProps) {
  return <div className={cn('mx-auto w-full max-w-3xl space-y-6', className)}>{children}</div>
}
