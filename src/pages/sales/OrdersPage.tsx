import { useState } from 'react'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { DataTablePagination } from '@/shared/components/data-table/DataTablePagination'
import { SearchInput } from '@/shared/components/data-table/SearchInput'
import { SelectFilter } from '@/shared/components/data-table/SelectFilter'
import { useListQueryState } from '@/shared/hooks/use-list-query-state'
import { useToast } from '@/shared/hooks/use-toast'
import { buildPaginationMeta, DEFAULT_PAGE_SIZE_OPTIONS } from '@/shared/lib/pagination'
import { useOrderList, useOrderStatusUpdate } from '@/features/orders/hooks/use-orders'
import { useOrderColumns } from '@/features/orders/components/OrderColumns'
import { UpdateOrderStatusDialog } from '@/features/orders/components/UpdateOrderStatusDialog'
import { UpdateOrderStatusDtoStatus } from '@/lib/api/generated/models/updateOrderStatusDtoStatus'
import { AdminOrdersControllerFindAllOrderStatus } from '@/lib/api/generated/models/adminOrdersControllerFindAllOrderStatus'
import { AdminOrdersControllerFindAllSourceChannel } from '@/lib/api/generated/models/adminOrdersControllerFindAllSourceChannel'
import type { AdminOrderDetailsResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const ORDER_STATUS_OPTIONS = Object.values(AdminOrdersControllerFindAllOrderStatus).map((v) => ({
  label: {
    PENDING_CONFIRMATION: 'Pending',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELED: 'Canceled',
    RETURNED: 'Returned',
  }[v] ?? v,
  value: v,
}))

const SOURCE_CHANNEL_OPTIONS = Object.values(AdminOrdersControllerFindAllSourceChannel).map((v) => ({
  label: {
    INSTAGRAM: 'Instagram',
    WHATSAPP: 'WhatsApp',
    TIKTOK: 'TikTok',
    FACEBOOK: 'Facebook',
    DIRECT: 'Direct',
    OTHER: 'Other',
  }[v] ?? v,
  value: v,
}))

export function OrdersPage() {
  const { toast } = useToast()
  const [statusTarget, setStatusTarget] = useState<AdminOrderDetailsResponse | null>(null)

  const { page, limit, search, filters, setPage, setLimit, setSearch, setFilter } =
    useListQueryState({ defaultLimit: 20, allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS })

  const orderStatusFilter = filters['orderStatus'] ?? null
  const sourceChannelFilter = filters['sourceChannel'] ?? null

  const query = useOrderList({
    page,
    pageSize: limit,
    search: search || undefined,
    orderStatus: orderStatusFilter
      ? (orderStatusFilter as AdminOrdersControllerFindAllOrderStatus)
      : undefined,
    sourceChannel: sourceChannelFilter
      ? (sourceChannelFilter as AdminOrdersControllerFindAllSourceChannel)
      : undefined,
  })

  const rawData =
    query.data?.status === 200
      ? (query.data.data as unknown as PaginatedResponse<AdminOrderDetailsResponse>)
      : null

  const orders = rawData?.data ?? []
  const meta = rawData?.meta
    ? buildPaginationMeta(rawData.meta)
    : buildPaginationMeta({ page, pageSize: limit, totalItems: 0 })

  const updateStatus = useOrderStatusUpdate(
    statusTarget?.orderId ?? (statusTarget as unknown as Record<string, string> | null)?.id ?? ''
  )

  const handleStatusConfirm = async (status: string, comment: string) => {
    if (!statusTarget) return
    const result = await updateStatus.mutate({
      status: status as (typeof UpdateOrderStatusDtoStatus)[keyof typeof UpdateOrderStatusDtoStatus],
      comment: comment || undefined,
    })
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Status updated',
        description: `Order ${statusTarget.orderNumber} status has been updated.`,
      })
      setStatusTarget(null)
    } else {
      toast({
        tone: 'error',
        title: 'Update failed',
        description: 'Could not update order status. Please try again.',
      })
    }
  }

  const columns = useOrderColumns({
    onUpdateStatus: (order) => setStatusTarget(order),
  })

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Orders"
          description="Review and manage customer orders."
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by order number…"
            aria-label="Search orders"
            className="w-full sm:max-w-xs"
          />
          <SelectFilter
            label="Order status"
            value={orderStatusFilter}
            onChange={(v) => setFilter('orderStatus', v)}
            options={ORDER_STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <SelectFilter
            label="Source channel"
            value={sourceChannelFilter}
            onChange={(v) => setFilter('sourceChannel', v)}
            options={SOURCE_CHANNEL_OPTIONS}
            allLabel="All channels"
          />
        </div>

        <DataTable
          columns={columns}
          data={orders}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          getRowId={(row) => row.orderId ?? (row as unknown as Record<string, string>).id}
          emptyTitle="No orders found"
          emptyDescription={
            search || orderStatusFilter || sourceChannelFilter
              ? 'Try adjusting your search or filters.'
              : 'No customer orders have been placed yet.'
          }
        />

        {!query.isLoading && !query.isError && meta.totalItems > 0 && (
          <DataTablePagination
            meta={meta}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            disabled={query.isFetching}
          />
        )}
      </div>

      <UpdateOrderStatusDialog
        open={statusTarget !== null}
        onOpenChange={(open) => { if (!open) setStatusTarget(null) }}
        order={statusTarget}
        onConfirm={handleStatusConfirm}
        isPending={updateStatus.isPending}
      />
    </PageContainer>
  )
}
