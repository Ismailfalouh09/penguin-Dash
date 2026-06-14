import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  adminPacksControllerArchive,
  adminPacksControllerCreate,
  adminPacksControllerUpdate,
  getAdminPacksControllerFindOneQueryKey,
  useAdminPacksControllerFindAll,
  useAdminPacksControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-packs/admin-packs'
import {
  packMediaControllerDelete,
  packMediaControllerReorder,
  packMediaControllerUpdate,
  packMediaControllerUpload,
} from '@/lib/api/generated/endpoints/admin-pack-media/admin-pack-media'
import { useAdminAttributesControllerFindGroups } from '@/lib/api/generated/endpoints/admin-attributes/admin-attributes'
import { useAdminProductsControllerFindAll } from '@/lib/api/generated/endpoints/admin-products/admin-products'
import type {
  AdminPacksControllerFindAllParams,
  AdminProductsControllerFindAllParams,
  CreatePackDto,
  PackMediaControllerUploadBody,
  ReorderMediaDto,
  UpdateMediaDto,
  UpdatePackDto,
} from '@/lib/api'

export function usePackList(params: AdminPacksControllerFindAllParams) {
  return useAdminPacksControllerFindAll(params)
}

export function usePackDetail(id: string) {
  return useAdminPacksControllerFindOne(id, { query: { enabled: id.trim().length > 0 } })
}

export function usePackProductOptions(params: AdminProductsControllerFindAllParams) {
  return useAdminProductsControllerFindAll(params)
}

export function usePackAttributeGroups() {
  return useAdminAttributesControllerFindGroups({ pageSize: 100, isProductAttribute: true })
}

export function usePackCreate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreatePackDto) => {
      setIsPending(true)
      try {
        const result = await adminPacksControllerCreate(dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/packs'] })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function usePackUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdatePackDto) => {
      setIsPending(true)
      try {
        const result = await adminPacksControllerUpdate(id, dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/packs'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminPacksControllerFindOneQueryKey(id),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, id]
  )

  return { mutate, isPending }
}

export function usePackArchive() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminPacksControllerArchive(id)
        await queryClient.invalidateQueries({ queryKey: ['/admin/packs'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminPacksControllerFindOneQueryKey(id),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function usePackImageUpload(packId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (body: PackMediaControllerUploadBody) => {
      setIsPending(true)
      try {
        const result = await packMediaControllerUpload(packId, body)
        await queryClient.invalidateQueries({
          queryKey: getAdminPacksControllerFindOneQueryKey(packId),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, packId]
  )

  return { mutate, isPending }
}

export function usePackImageUpdate(packId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (imageId: string, dto: UpdateMediaDto) => {
      setIsPending(true)
      try {
        const result = await packMediaControllerUpdate(packId, imageId, dto)
        await queryClient.invalidateQueries({
          queryKey: getAdminPacksControllerFindOneQueryKey(packId),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, packId]
  )

  return { mutate, isPending }
}

export function usePackImageDelete(packId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (imageId: string) => {
      setIsPending(true)
      try {
        const result = await packMediaControllerDelete(packId, imageId)
        await queryClient.invalidateQueries({
          queryKey: getAdminPacksControllerFindOneQueryKey(packId),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, packId]
  )

  return { mutate, isPending }
}

export function usePackImageReorder(packId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: ReorderMediaDto) => {
      setIsPending(true)
      try {
        const result = await packMediaControllerReorder(packId, dto)
        await queryClient.invalidateQueries({
          queryKey: getAdminPacksControllerFindOneQueryKey(packId),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, packId]
  )

  return { mutate, isPending }
}
