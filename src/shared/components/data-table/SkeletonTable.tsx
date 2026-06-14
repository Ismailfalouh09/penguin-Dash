import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

interface SkeletonTableProps {
  /** Number of columns to render. */
  columns?: number
  /** Number of skeleton rows. */
  rows?: number
  className?: string
}

/**
 * Loading placeholder shaped like the data table, so the layout doesn't shift
 * when real rows arrive. Announces a busy status for assistive tech.
 */
export function SkeletonTable({ columns = 4, rows = 8, className }: SkeletonTableProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}
    >
      <span className="sr-only">Loading…</span>
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-transparent">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className={cn('h-4', colIndex === 0 ? 'w-32' : 'w-20')} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
