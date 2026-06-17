import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { SectionCard } from '@/shared/components/common/SectionCard'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { UpdateOrderStatusDialog } from '@/features/orders/components/UpdateOrderStatusDialog'
import {
  ORDER_STATUS_TONE,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  PAYMENT_STATUS_LABEL,
} from '@/features/orders/components/OrderColumns'
import { useOrderDetail, useOrderStatusUpdate, isConcreteOrderId } from '@/features/orders/hooks/use-orders'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { UpdateOrderStatusDtoStatus } from '@/lib/api/generated/models/updateOrderStatusDtoStatus'
import type { AdminOrderDetailsResponse } from '@/lib/api'

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="min-w-[160px] shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const hasValidOrderId = isConcreteOrderId(orderId)

  const detailQuery = useOrderDetail(orderId ?? '')
  const updateStatus = useOrderStatusUpdate(orderId ?? '')

  const order: AdminOrderDetailsResponse | null =
    detailQuery.data?.status === 200
      ? (detailQuery.data.data as unknown as AdminOrderDetailsResponse)
      : null

  const handleStatusConfirm = async (status: string, comment: string) => {
    if (!order || !hasValidOrderId) return
    const result = await updateStatus.mutate({
      status:
        status as (typeof UpdateOrderStatusDtoStatus)[keyof typeof UpdateOrderStatusDtoStatus],
      comment: comment || undefined,
    })
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Status updated',
        description: `Order ${order.orderNumber} status has been updated.`,
      })
      setStatusDialogOpen(false)
    } else {
      toast({
        tone: 'error',
        title: 'Update failed',
        description: 'Could not update order status. Please try again.',
      })
    }
  }

  if (!hasValidOrderId) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.orders)}>
            <ArrowLeft className="size-4" />
            Back to orders
          </Button>
          <ErrorState
            title="Order not found"
            message="Open an order from the orders list to view its details."
          />
        </div>
      </PageContainer>
    )
  }

  if (detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading order…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError || detailQuery.data?.status === 404) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.orders)}>
            <ArrowLeft className="size-4" />
            Back to orders
          </Button>
          <ErrorState
            title={detailQuery.data?.status === 404 ? 'Order not found' : 'Something went wrong'}
            message={
              detailQuery.data?.status === 404
                ? 'This order does not exist or has been removed.'
                : 'Could not load order details.'
            }
            onRetry={
              detailQuery.data?.status === 404 || !hasValidOrderId
                ? undefined
                : () => detailQuery.refetch()
            }
          />
        </div>
      </PageContainer>
    )
  }

  if (!order) {
    return (
      <PageContainer>
        <ErrorState message="Could not load order details." onRetry={() => detailQuery.refetch()} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={order.orderNumber}
          description={`Placed ${formatDate(order.createdAt)}`}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={ROUTES.orders}>
                  <ArrowLeft className="size-4" />
                  Orders
                </Link>
              </Button>
              <PermissionGuard permission="orders:update-status">
                <Button onClick={() => setStatusDialogOpen(true)}>
                  <RefreshCw className="size-4" />
                  Update status
                </Button>
              </PermissionGuard>
            </div>
          }
        />

        {/* Order summary */}
        <SectionCard title="Order summary">
          <dl className="space-y-3">
            <InfoRow label="Order number">
              <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
            </InfoRow>
            <InfoRow label="Order status">
              <StatusBadge tone={ORDER_STATUS_TONE[order.orderStatus] ?? 'neutral'}>
                {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
              </StatusBadge>
            </InfoRow>
            <InfoRow label="Payment status">
              <StatusBadge tone={PAYMENT_STATUS_TONE[order.paymentStatus] ?? 'neutral'}>
                {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
              </StatusBadge>
            </InfoRow>
            <InfoRow label="Payment method">{order.paymentMethod?.replace(/_/g, ' ')}</InfoRow>
            <InfoRow label="Pack">{order.packName}</InfoRow>
            <InfoRow label="Total amount">
              <span className="font-medium tabular-nums">
                {order.totalAmount?.toFixed(2)} {order.currency}
              </span>
            </InfoRow>
            <InfoRow label="Created">{formatDate(order.createdAt)}</InfoRow>
            <InfoRow label="Last updated">{formatDate(order.updatedAt)}</InfoRow>
          </dl>
        </SectionCard>

        {/* Customer information */}
        {order.customer && (
          <SectionCard title="Customer">
            <dl className="space-y-3">
              <InfoRow label="Full name">{order.customer.fullName}</InfoRow>
              <InfoRow label="Phone">{order.customer.phone}</InfoRow>
              {typeof order.customer.whatsappPhone === 'string' &&
                order.customer.whatsappPhone !== order.customer.phone && (
                  <InfoRow label="WhatsApp">{order.customer.whatsappPhone}</InfoRow>
                )}
            </dl>
          </SectionCard>
        )}

        {/* Delivery information */}
        {order.customerAddress && (
          <SectionCard title="Delivery address">
            <dl className="space-y-3">
              <InfoRow label="City">{order.customerAddress.city}</InfoRow>
              <InfoRow label="Address">{order.customerAddress.addressLine}</InfoRow>
              {typeof order.customerAddress.extraInfo === 'string' && (
                <InfoRow label="Extra info">{order.customerAddress.extraInfo}</InfoRow>
              )}
            </dl>
          </SectionCard>
        )}

        {/* Order items */}
        <SectionCard
          title="Ordered items"
          description={`${order.items?.length ?? 0} item${(order.items?.length ?? 0) !== 1 ? 's' : ''}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Product</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Reference</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Unit price</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Qty</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(order.items ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-medium">{item.productNameSnapshot}</td>
                    <td className="py-2 text-muted-foreground">{item.referenceNameSnapshot}</td>
                    <td className="py-2 text-right tabular-nums">
                      {item.unitPriceSnapshot?.toFixed(2)} {order.currency}
                    </td>
                    <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                    <td className="py-2 text-right font-medium tabular-nums">
                      {item.totalPrice?.toFixed(2)} {order.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={4} className="pt-3 text-right font-medium text-muted-foreground">
                    Total
                  </td>
                  <td className="pt-3 text-right font-semibold tabular-nums">
                    {order.totalAmount?.toFixed(2)} {order.currency}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </SectionCard>

        {/* Status history */}
        {(order.statusHistory?.length ?? 0) > 0 && (
          <SectionCard title="Status history">
            <ol className="space-y-4">
              {[...(order.statusHistory ?? [])].reverse().map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={ORDER_STATUS_TONE[entry.newStatus] ?? 'neutral'}>
                      {ORDER_STATUS_LABEL[entry.newStatus] ?? entry.newStatus}
                    </StatusBadge>
                    {entry.oldStatus && (
                      <span className="text-xs text-muted-foreground">
                        from{' '}
                        <span className="font-medium">
                          {ORDER_STATUS_LABEL[entry.oldStatus] ?? entry.oldStatus}
                        </span>
                      </span>
                    )}
                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  {entry.changedByAdmin && (
                    <p className="text-xs text-muted-foreground">
                      By {entry.changedByAdmin.fullName} ({entry.changedByAdmin.role})
                    </p>
                  )}
                  {typeof entry.comment === 'string' && (
                    <p className="text-sm text-foreground">{entry.comment}</p>
                  )}
                </li>
              ))}
            </ol>
          </SectionCard>
        )}
      </div>

      <UpdateOrderStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        order={order}
        onConfirm={handleStatusConfirm}
        isPending={updateStatus.isPending}
      />
    </PageContainer>
  )
}
