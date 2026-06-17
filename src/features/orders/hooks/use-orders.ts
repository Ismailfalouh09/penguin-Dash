import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  adminOrdersControllerUpdateStatus,
  getAdminOrdersControllerFindAllQueryKey,
  getAdminOrdersControllerFindOneQueryKey,
  useAdminOrdersControllerFindAll,
  useAdminOrdersControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-orders/admin-orders'
import type { AdminOrdersControllerFindAllParams, UpdateOrderStatusDto } from '@/lib/api'

export function useOrderList(params: AdminOrdersControllerFindAllParams) {
  return useAdminOrdersControllerFindAll(params)
}

export function isConcreteOrderId(id: string | null | undefined) {
  if (typeof id !== 'string') return false
  return id.trim().length > 0 && !id.startsWith(':')
}

export function useOrderDetail(id: string) {
  return useAdminOrdersControllerFindOne(id, { query: { enabled: isConcreteOrderId(id) } })
}

export function useOrderStatusUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateOrderStatusDto) => {
      setIsPending(true)
      try {
        const result = await adminOrdersControllerUpdateStatus(id, dto)
        await queryClient.invalidateQueries({
          queryKey: getAdminOrdersControllerFindAllQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminOrdersControllerFindOneQueryKey(id),
        })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, id]
  )

  return { mutate, isPending }
}
