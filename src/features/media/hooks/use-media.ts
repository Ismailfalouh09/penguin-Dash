import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  mediaControllerDelete,
  mediaControllerUpdate,
  mediaControllerUploadImage,
  getMediaControllerFindOneQueryKey,
  useMediaControllerFindAll,
  useMediaControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-media/admin-media'
import type {
  MediaControllerFindAllParams,
  UpdateMediaAssetDto,
  MediaAssetResponse,
  MediaControllerUploadImageBody,
} from '@/lib/api'

export function useMediaList(params: MediaControllerFindAllParams) {
  return useMediaControllerFindAll(params)
}

export function useMediaDetail(id: string) {
  return useMediaControllerFindOne(id, { query: { enabled: !!id } })
}

export function useMediaUpload() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (body: MediaControllerUploadImageBody) => {
      setIsPending(true)
      try {
        const result = await mediaControllerUploadImage(body)
        await queryClient.invalidateQueries({ queryKey: ['/admin/media'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function useMediaUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateMediaAssetDto) => {
      setIsPending(true)
      try {
        const result = await mediaControllerUpdate(id, dto)
        await queryClient.invalidateQueries({ queryKey: getMediaControllerFindOneQueryKey(id) })
        await queryClient.invalidateQueries({ queryKey: ['/admin/media'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, id]
  )

  return { mutate, isPending }
}

export function useMediaDelete() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await mediaControllerDelete(id)
        await queryClient.invalidateQueries({ queryKey: ['/admin/media'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getMediaDisplayName(asset: MediaAssetResponse): string {
  if (typeof asset.originalName === 'string' && asset.originalName) return asset.originalName
  return asset.publicId.split('/').pop() ?? asset.publicId
}
