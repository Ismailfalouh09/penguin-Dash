import { useOrderList } from '@/features/orders/hooks/use-orders'
import { useProductList } from '@/features/products/hooks/use-products'
import { usePackList } from '@/features/packs/hooks/use-packs'
import { useRecommendationRuleList } from '@/features/recommendation-rules/hooks/use-recommendation-rules'
import { useMediaList } from '@/features/media/hooks/use-media'
import { AdminOrdersControllerFindAllOrderStatus } from '@/lib/api/generated/models/adminOrdersControllerFindAllOrderStatus'
import { AdminProductsControllerFindAllStatus } from '@/lib/api/generated/models/adminProductsControllerFindAllStatus'
import { AdminPacksControllerFindAllStatus } from '@/lib/api/generated/models/adminPacksControllerFindAllStatus'
import type { PaginatedResponse } from '@/shared/lib/pagination'
import type { AdminOrderDetailsResponse } from '@/lib/api'

function extractTotal(data: unknown): number | null {
  const d = data as { status?: number; data?: unknown }
  if (d?.status !== 200) return null
  const payload = d.data as PaginatedResponse<unknown> | null
  return payload?.meta?.totalItems ?? null
}

export function useDashboardMetrics() {
  const recentOrders = useOrderList({ page: 1, pageSize: 5 })
  const pendingOrders = useOrderList({
    page: 1,
    pageSize: 1,
    orderStatus: AdminOrdersControllerFindAllOrderStatus.PENDING_CONFIRMATION,
  })
  const activeProducts = useProductList({
    page: 1,
    pageSize: 1,
    status: AdminProductsControllerFindAllStatus.ACTIVE,
  })
  const activePacks = usePackList({
    page: 1,
    pageSize: 1,
    isActive: true,
    status: AdminPacksControllerFindAllStatus.ACTIVE,
  })
  const activeRules = useRecommendationRuleList({ page: 1, pageSize: 1, isActive: true })
  const media = useMediaList({ page: 1, pageSize: 1 })

  const recentOrderItems: AdminOrderDetailsResponse[] =
    recentOrders.data?.status === 200
      ? ((recentOrders.data.data as unknown as PaginatedResponse<AdminOrderDetailsResponse>)?.data ?? [])
      : []

  return {
    recentOrders: {
      items: recentOrderItems,
      isLoading: recentOrders.isLoading,
      isError: recentOrders.isError,
      refetch: () => recentOrders.refetch(),
    },
    totalPendingOrders: {
      value: extractTotal(pendingOrders.data),
      isLoading: pendingOrders.isLoading,
      isError: pendingOrders.isError,
      refetch: () => pendingOrders.refetch(),
    },
    totalActiveProducts: {
      value: extractTotal(activeProducts.data),
      isLoading: activeProducts.isLoading,
      isError: activeProducts.isError,
      refetch: () => activeProducts.refetch(),
    },
    totalActivePacks: {
      value: extractTotal(activePacks.data),
      isLoading: activePacks.isLoading,
      isError: activePacks.isError,
      refetch: () => activePacks.refetch(),
    },
    totalActiveRules: {
      value: extractTotal(activeRules.data),
      isLoading: activeRules.isLoading,
      isError: activeRules.isError,
      refetch: () => activeRules.refetch(),
    },
    totalMedia: {
      value: extractTotal(media.data),
      isLoading: media.isLoading,
      isError: media.isError,
      refetch: () => media.refetch(),
    },
  }
}
