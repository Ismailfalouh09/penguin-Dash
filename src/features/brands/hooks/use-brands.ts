import { useQueryClient } from '@tanstack/react-query'
import {
  adminBrandsControllerCreate,
  adminBrandsControllerDeactivate,
  adminBrandsControllerUpdate,
  getAdminBrandsControllerFindOneQueryKey,
  useAdminBrandsControllerFindAll,
  useAdminBrandsControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-brands/admin-brands'
import { useCallback, useState } from 'react'
import type {
  AdminBrandsControllerFindAllParams,
  CreateBrandDto,
} from '@/lib/api'

export function useBrandList(params: AdminBrandsControllerFindAllParams) {
  return useAdminBrandsControllerFindAll(params)
}

export function useBrandDetail(id: string) {
  return useAdminBrandsControllerFindOne(id)
}

export function useBrandCreate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateBrandDto) => {
      setIsPending(true)
      try {
        const result = await adminBrandsControllerCreate(dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/brands'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function useBrandUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateBrandDto) => {
      setIsPending(true)
      try {
        const result = await adminBrandsControllerUpdate(id, dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/brands'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminBrandsControllerFindOneQueryKey(id),
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

export function useBrandDeactivate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminBrandsControllerDeactivate(id)
        await queryClient.invalidateQueries({ queryKey: ['/admin/brands'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminBrandsControllerFindOneQueryKey(id),
        })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}
