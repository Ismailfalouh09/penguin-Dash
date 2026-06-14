import { cn } from '@/shared/lib/utils'
import { SectionCard } from '@/shared/components/common/SectionCard'

interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  /** Right-aligned header actions. */
  action?: React.ReactNode
  className?: string
}

/**
 * A titled group of related fields, rendered inside a `SectionCard` with a
 * standard field layout (vertical stack). Use one section per logical group of
 * fields on a form page.
 */
export function FormSection({ title, description, children, action, className }: FormSectionProps) {
  return (
    <SectionCard title={title} description={description} action={action} className={className}>
      <div className={cn('grid gap-5')}>{children}</div>
    </SectionCard>
  )
}
