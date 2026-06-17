import { useNavigate } from 'react-router-dom'
import { Eye, RefreshCw } from 'lucide-react'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { isConcreteOrderId } from '@/features/orders/hooks/use-orders'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { AdminOrderDetailsResponse } from '@/lib/api'
import type { StatusTone } from '@/shared/components/common/StatusBadge'

export const ORDER_STATUS_TONE: Record<string, StatusTone> = {
  PENDING_CONFIRMATION: 'warning',
  CONFIRMED: 'info',
  PREPARING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELED: 'neutral',
  RETURNED: 'neutral',
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING_CONFIRMATION: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELED: 'Canceled',
  RETURNED: 'Returned',
}

export const PAYMENT_STATUS_TONE: Record<string, StatusTone> = {
  UNPAID: 'warning',
  PAID: 'success',
  REFUNDED: 'neutral',
}

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
}

export const SOURCE_CHANNEL_LABEL: Record<string, string> = {
  INSTAGRAM: 'Instagram',
  WHATSAPP: 'WhatsApp',
  TIKTOK: 'TikTok',
  FACEBOOK: 'Facebook',
  DIRECT: 'Direct',
  OTHER: 'Other',
}

interface UseOrderColumnsOptions {
  onUpdateStatus: (order: AdminOrderDetailsResponse) => void
}

export function useOrderColumns({
  onUpdateStatus,
}: UseOrderColumnsOptions): ColumnDef<AdminOrderDetailsResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canUpdateStatus = can('orders:update-status')

  return [
    {
      accessorKey: 'orderNumber',
      header: 'Order',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">{row.original.orderNumber}</span>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => {
        const { customer, customerAddress } = row.original
        return (
          <div className="space-y-0.5">
            <div className="text-sm font-medium">{customer.fullName}</div>
            <div className="text-xs text-muted-foreground">{customer.phone}</div>
            {customerAddress?.city && (
              <div className="text-xs text-muted-foreground">{customerAddress.city}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'packName',
      header: 'Pack',
      cell: ({ row }) => <span className="text-sm">{row.original.packName}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">
          {row.original.totalAmount.toFixed(2)} {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: 'orderStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.orderStatus
        return (
          <StatusBadge tone={ORDER_STATUS_TONE[status] ?? 'neutral'}>
            {ORDER_STATUS_LABEL[status] ?? status}
          </StatusBadge>
        )
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => {
        const status = row.original.paymentStatus
        return (
          <StatusBadge tone={PAYMENT_STATUS_TONE[status] ?? 'neutral'}>
            {PAYMENT_STATUS_LABEL[status] ?? status}
          </StatusBadge>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const order = row.original
        const actions = [
          {
            label: 'View details',
            icon: Eye,
            onSelect: () => {
              const id = order.orderId ?? (order as unknown as Record<string, string>).id
              if (isConcreteOrderId(id)) navigate(ROUTES.order(id))
            },
          },
        ]

        if (canUpdateStatus) {
          actions.push({
            label: 'Update status',
            icon: RefreshCw,
            onSelect: () => onUpdateStatus(order),
          })
        }

        return <RowActions actions={actions} label={`Actions for order ${order.orderNumber}`} />
      },
    },
  ]
}
