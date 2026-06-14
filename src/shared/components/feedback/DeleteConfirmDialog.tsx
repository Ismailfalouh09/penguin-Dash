import { ConfirmDialog } from './ConfirmDialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Name of the thing being removed, shown in the default copy. */
  itemName?: string
  /** "delete" (default) or "archive" — adjusts copy and labels. */
  mode?: 'delete' | 'archive'
  onConfirm: () => void
  isPending?: boolean
  /** Override the auto-generated title. */
  title?: string
  /** Override the auto-generated description. */
  description?: React.ReactNode
}

/**
 * Specialized confirmation for delete/archive actions. Supplies safe default
 * copy (and a destructive confirm button for deletes) while delegating to the
 * generic `ConfirmDialog`.
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  mode = 'delete',
  onConfirm,
  isPending,
  title,
  description,
}: DeleteConfirmDialogProps) {
  const isDelete = mode === 'delete'
  const target = itemName ? `“${itemName}”` : 'this item'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? (isDelete ? `Delete ${itemName ?? 'item'}?` : `Archive ${itemName ?? 'item'}?`)}
      description={
        description ??
        (isDelete
          ? `This will permanently delete ${target}. This action cannot be undone.`
          : `This will archive ${target}. You can restore it later.`)
      }
      confirmLabel={isDelete ? 'Delete' : 'Archive'}
      destructive={isDelete}
      onConfirm={onConfirm}
      isPending={isPending}
    />
  )
}
