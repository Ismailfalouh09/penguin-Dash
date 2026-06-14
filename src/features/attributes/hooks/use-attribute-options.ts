import { useQueryClient } from '@tanstack/react-query'
import {
  adminAttributesControllerCreateOption,
  adminAttributesControllerDeactivateOption,
  adminAttributesControllerUpdateOption,
  getAdminAttributesControllerFindOptionQueryKey,
  useAdminAttributesControllerFindOptions,
  useAdminAttributesControllerFindOption,
} from '@/lib/api/generated/endpoints/admin-attributes/admin-attributes'
import { useCallback, useState } from 'react'
import type {
  AdminAttributesControllerFindOptionsParams,
  CreateAttributeOptionDto,
  UpdateAttributeOptionDto,
} from '@/lib/api'

export function useAttributeOptionList(
  attributeGroupId: string,
  params?: AdminAttributesControllerFindOptionsParams
) {
  return useAdminAttributesControllerFindOptions(attributeGroupId, params)
}

export function useAttributeOptionDetail(id: string) {
  return useAdminAttributesControllerFindOption(id)
}

export function useAttributeOptionCreate(attributeGroupId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateAttributeOptionDto) => {
      setIsPending(true)
      try {
        const result = await adminAttributesControllerCreateOption(attributeGroupId, dto)
        await queryClient.invalidateQueries({
          queryKey: [`/admin/attributes/${attributeGroupId}/options`],
        })
        await queryClient.invalidateQueries({ queryKey: ['/admin/attributes'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, attributeGroupId]
  )

  return { mutate, isPending }
}

export function useAttributeOptionUpdate(id: string, attributeGroupId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateAttributeOptionDto) => {
      setIsPending(true)
      try {
        const result = await adminAttributesControllerUpdateOption(id, dto)
        await queryClient.invalidateQueries({
          queryKey: [`/admin/attributes/${attributeGroupId}/options`],
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminAttributesControllerFindOptionQueryKey(id),
        })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, id, attributeGroupId]
  )

  return { mutate, isPending }
}

export function useAttributeOptionDeactivate(attributeGroupId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminAttributesControllerDeactivateOption(id)
        await queryClient.invalidateQueries({
          queryKey: [`/admin/attributes/${attributeGroupId}/options`],
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminAttributesControllerFindOptionQueryKey(id),
        })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, attributeGroupId]
  )

  return { mutate, isPending }
}
