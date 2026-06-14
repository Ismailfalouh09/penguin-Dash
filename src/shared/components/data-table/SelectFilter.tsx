import { cn } from '@/shared/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

export interface FilterOption {
  label: string
  value: string
}

interface SelectFilterProps {
  label: string
  /** Current value, or `null`/'' when no filter is applied. */
  value: string | null
  onChange: (value: string | null) => void
  options: FilterOption[]
  /** Label for the "no filter" choice. */
  allLabel?: string
  className?: string
}

// Radix Select disallows an empty-string item value, so the "all" sentinel maps
// to/from `null` at this boundary.
const ALL_VALUE = '__all__'

/**
 * Reusable single-select filter. Selecting the "all" option clears the filter
 * by emitting `null`. Generic over its options — no business-specific values
 * are baked in.
 */
export function SelectFilter({
  label,
  value,
  onChange,
  options,
  allLabel = 'All',
  className,
}: SelectFilterProps) {
  return (
    <Select
      value={value && value !== '' ? value : ALL_VALUE}
      onValueChange={(next) => onChange(next === ALL_VALUE ? null : next)}
    >
      <SelectTrigger className={cn('h-10 min-w-[10rem]', className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
