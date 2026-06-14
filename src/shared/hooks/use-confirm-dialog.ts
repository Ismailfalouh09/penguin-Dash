import { useCallback, useState } from 'react'

/**
 * Manage open/close state and the target item for a confirmation dialog.
 *
 * @example
 *   const confirm = useConfirmDialog<Category>()
 *   <Button onClick={() => confirm.open(category)}>Delete</Button>
 *   <DeleteConfirmDialog
 *     open={confirm.isOpen}
 *     onOpenChange={confirm.setOpen}
 *     itemName={confirm.target?.name}
 *     onConfirm={() => deleteMutation.mutate(confirm.target!.id)}
 *   />
 */
export function useConfirmDialog<T = void>() {
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<T | null>(null)

  const open = useCallback((item?: T) => {
    setTarget(item ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const setOpen = useCallback((next: boolean) => {
    setIsOpen(next)
    if (!next) setTarget(null)
  }, [])

  return { isOpen, target, open, close, setOpen }
}
