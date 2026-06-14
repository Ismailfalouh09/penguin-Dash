import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/components/ui/alert-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import { useReferenceStockUpdate } from '../hooks/use-product-references'
import type { ProductReferenceResponse } from '@/lib/api'

interface StockUpdateDialogProps {
  reference: ProductReferenceResponse | null
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Manual stock update dialog.
 * Requires all three stock fields (stockQuantity, reservedQuantity, lowStockThreshold)
 * as specified by the UpdateReferenceStockDto contract.
 */
export function StockUpdateDialog({
  reference,
  productId,
  open,
  onOpenChange,
}: StockUpdateDialogProps) {
  const { toast } = useToast()
  const mutation = useReferenceStockUpdate(reference?.id ?? '', productId)

  const [stockQuantity, setStockQuantity] = useState(0)
  const [reservedQuantity, setReservedQuantity] = useState(0)
  const [lowStockThreshold, setLowStockThreshold] = useState(5)

  useEffect(() => {
    if (reference) {
      setStockQuantity(reference.stockQuantity)
      setReservedQuantity(reference.reservedQuantity)
      setLowStockThreshold(5)
    }
  }, [reference])

  const isValid =
    stockQuantity >= 0 &&
    reservedQuantity >= 0 &&
    lowStockThreshold >= 0 &&
    Number.isInteger(stockQuantity) &&
    Number.isInteger(reservedQuantity) &&
    Number.isInteger(lowStockThreshold)

  const handleConfirm = async () => {
    if (!reference || !isValid) return

    const result = await mutation.mutate({ stockQuantity, reservedQuantity, lowStockThreshold })

    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Stock updated',
        description: `Stock for "${reference.referenceName}" has been updated to ${stockQuantity}.`,
      })
      onOpenChange(false)
    } else {
      toast({
        tone: 'error',
        title: 'Update failed',
        description: 'Could not update stock. Try again.',
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Manual stock update — {reference?.referenceName ?? ''}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            This is a manual stock update. It does not reserve, deduct, or restore stock automatically.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="stock-qty" className="text-sm font-medium">
                Stock quantity
              </label>
              <input
                id="stock-qty"
                type="number"
                min={0}
                step={1}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                disabled={mutation.isPending}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                aria-label="Stock quantity"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reserved-qty" className="text-sm font-medium">
                Reserved quantity
              </label>
              <input
                id="reserved-qty"
                type="number"
                min={0}
                step={1}
                value={reservedQuantity}
                onChange={(e) => setReservedQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                disabled={mutation.isPending}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                aria-label="Reserved quantity"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="low-stock-threshold" className="text-sm font-medium">
                Low-stock threshold
              </label>
              <input
                id="low-stock-threshold"
                type="number"
                min={0}
                step={1}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
                disabled={mutation.isPending}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                aria-label="Low-stock threshold"
              />
              <p className="text-xs text-muted-foreground">
                Alert threshold — informational only; does not block orders.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={mutation.isPending || !isValid}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Save stock
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
