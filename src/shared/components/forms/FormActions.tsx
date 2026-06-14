import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'

interface FormActionsProps {
  /** Submit button label. */
  submitLabel?: string
  /** Cancel handler; omit to hide the cancel button. */
  onCancel?: () => void
  cancelLabel?: string
  /** Shows a spinner and disables submit while a mutation is pending. */
  isSubmitting?: boolean
  /** Disable the submit button (e.g. invalid form). */
  submitDisabled?: boolean
  /** Extra controls rendered on the left (e.g. a delete button). */
  secondary?: React.ReactNode
  className?: string
}

/**
 * Standard form footer: a primary submit (with loading state) and an optional
 * cancel, plus a slot for secondary actions. Stacks on mobile, right-aligns the
 * primary actions on larger screens.
 */
export function FormActions({
  submitLabel = 'Save',
  onCancel,
  cancelLabel = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  secondary,
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-2">{secondary}</div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || submitDisabled}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
