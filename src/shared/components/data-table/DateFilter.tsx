import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/components/ui/input'

interface DateFilterProps {
  label: string
  /** Current value as an ISO date string (yyyy-mm-dd) or null. */
  value: string | null
  onChange: (value: string | null) => void
  id: string
  className?: string
}

/**
 * Reusable single-date filter using the native date input (keyboard- and
 * screen-reader friendly, zero extra deps). Emits `null` when cleared.
 */
export function DateFilter({ label, value, onChange, id, className }: DateFilterProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
        className="h-10 w-[10.5rem]"
      />
    </div>
  )
}
