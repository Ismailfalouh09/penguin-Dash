import { cn } from '@/shared/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * Constrains page content to a comfortable reading width and applies the
 * standard page padding used across every module screen.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}
