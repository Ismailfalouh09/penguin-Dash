import { useQueryClient } from '@tanstack/react-query'
import {
  adminAttributesControllerCreateGroup,
  adminAttributesControllerDeactivateGroup,
  adminAttributesControllerUpdateGroup,
  getAdminAttributesControllerFindGroupQueryKey,
  useAdminAttributesControllerFindGroups,
  useAdminAttributesControllerFindGroup,
} from '@/lib/api/generated/endpoints/admin-attributes/admin-attributes'
import { useCallback, useState } from 'react'
import type {
  AdminAttributesControllerFindGroupsParams,
  CreateAttributeGroupDto,
  UpdateAttributeGroupDto,
} from '@/lib/api'

export function useAttributeGroupList(params: AdminAttributesControllerFindGroupsParams) {
  return useAdminAttributesControllerFindGroups(params)
}

export function useAttributeGroupDetail(id: string) {
  return useAdminAttributesControllerFindGroup(id)
}

export function useAttributeGroupCreate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateAttributeGroupDto) => {
      setIsPending(true)
      try {
        const result = await adminAttributesControllerCreateGroup(dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/attributes'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function useAttributeGroupUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateAttributeGroupDto) => {
      setIsPending(true)
      try {
        const result = await adminAttributesControllerUpdateGroup(id, dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/attributes'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminAttributesControllerFindGroupQueryKey(id),
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

export function useAttributeGroupDeactivate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminAttributesControllerDeactivateGroup(id)
        await queryClient.invalidateQueries({ queryKey: ['/admin/attributes'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminAttributesControllerFindGroupQueryKey(id),
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
