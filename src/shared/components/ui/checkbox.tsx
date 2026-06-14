import * as React from 'react'
import { Check, Minus } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  checked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
}

/**
 * Accessible checkbox built on a visually-hidden native input, so it keeps full
 * keyboard support and form semantics without an extra Radix dependency.
 * Supports an indeterminate (mixed) state for "select all" headers.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, indeterminate = false, onCheckedChange, disabled, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate
    }, [indeterminate])

    return (
      <span className={cn('relative inline-flex size-4 items-center justify-center', className)}>
        <input
          ref={innerRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-[4px] border border-input ring-offset-background checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {indeterminate ? (
          <Minus className="pointer-events-none size-3 text-primary-foreground opacity-0 peer-indeterminate:opacity-100" />
        ) : (
          <Check className="pointer-events-none size-3 text-primary-foreground opacity-0 peer-checked:opacity-100" />
        )}
      </span>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
