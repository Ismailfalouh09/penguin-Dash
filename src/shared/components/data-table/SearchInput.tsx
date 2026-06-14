import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/components/ui/input'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

interface SearchInputProps {
  /** Current committed search value (from URL state). */
  value: string
  /** Called with the debounced value when the user stops typing. */
  onChange: (value: string) => void
  placeholder?: string
  /** Debounce delay in ms. */
  delay?: number
  'aria-label'?: string
  className?: string
}

/**
 * Debounced search box. Holds the raw keystrokes locally for snappy typing and
 * only calls `onChange` once input settles, so list queries (and the URL) update
 * at most once per pause. Includes an accessible clear button.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  delay = 300,
  'aria-label': ariaLabel = 'Search',
  className,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value)
  const debounced = useDebouncedValue(draft, delay)
  const lastEmitted = useRef(value)

  // Emit only when the debounced draft diverges from what we last committed.
  useEffect(() => {
    if (debounced !== lastEmitted.current) {
      lastEmitted.current = debounced
      onChange(debounced)
    }
  }, [debounced, onChange])

  // Keep the draft in sync when the value changes externally (e.g. clear all,
  // browser back/forward) without clobbering active typing.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value
      setDraft(value)
    }
  }, [value])

  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-9 pr-9"
      />
      {draft && (
        <button
          type="button"
          onClick={() => setDraft('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground ring-offset-background transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
