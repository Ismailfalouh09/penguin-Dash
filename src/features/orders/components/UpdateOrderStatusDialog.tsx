import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { UpdateOrderStatusDtoStatus } from '@/lib/api/generated/models/updateOrderStatusDtoStatus'
import { ORDER_STATUS_LABEL } from './OrderColumns'
import type { AdminOrderDetailsResponse } from '@/lib/api'

const STATUS_OPTIONS = Object.values(UpdateOrderStatusDtoStatus)

interface UpdateOrderStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: AdminOrderDetailsResponse | null
  onConfirm: (status: string, comment: string) => void
  isPending: boolean
}

export function UpdateOrderStatusDialog({
  open,
  onOpenChange,
  order,
  onConfirm,
  isPending,
}: UpdateOrderStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [comment, setComment] = useState('')

  const handleOpenChange = (next: boolean) => {
    if (isPending) return
    if (!next) {
      setSelectedStatus('')
      setComment('')
    }
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!selectedStatus) return
    onConfirm(selectedStatus, comment)
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update order status</DialogTitle>
          <DialogDescription>
            Order <span className="font-mono font-medium">{order.orderNumber}</span> — current
            status: <strong>{ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="order-status-select">New status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="order-status-select" aria-label="Select new order status">
                <SelectValue placeholder="Select a status…" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ORDER_STATUS_LABEL[status] ?? status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-status-comment">
              Note <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              id="order-status-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note about this status change…"
              rows={3}
              disabled={isPending}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedStatus || isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
