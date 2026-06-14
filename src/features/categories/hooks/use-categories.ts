import { useQueryClient } from '@tanstack/react-query'
import {
  adminCategoriesControllerCreate,
  adminCategoriesControllerDeactivate,
  adminCategoriesControllerUpdate,
  getAdminCategoriesControllerFindOneQueryKey,
  useAdminCategoriesControllerFindAll,
  useAdminCategoriesControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-categories/admin-categories'
import {
  categoryMediaControllerDelete,
  categoryMediaControllerReplace,
} from '@/lib/api/generated/endpoints/admin-category-media/admin-category-media'
import { useCallback, useState } from 'react'
import type {
  AdminCategoriesControllerFindAllParams,
  CreateCategoryDto,
  CategoryMediaControllerReplaceBody,
} from '@/lib/api'

export function useCategoryList(params: AdminCategoriesControllerFindAllParams) {
  return useAdminCategoriesControllerFindAll(params)
}

export function useCategoryDetail(id: string) {
  return useAdminCategoriesControllerFindOne(id)
}

export function useCategoryCreate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateCategoryDto) => {
      setIsPending(true)
      try {
        const result = await adminCategoriesControllerCreate(dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/categories'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function useCategoryUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateCategoryDto) => {
      setIsPending(true)
      try {
        const result = await adminCategoriesControllerUpdate(id, dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/categories'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminCategoriesControllerFindOneQueryKey(id),
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

export function useCategoryDeactivate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminCategoriesControllerDeactivate(id)
        await queryClient.invalidateQueries({ queryKey: ['/admin/categories'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminCategoriesControllerFindOneQueryKey(id),
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

export function useCategoryImageReplace(categoryId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (body: CategoryMediaControllerReplaceBody) => {
      setIsPending(true)
      try {
        const result = await categoryMediaControllerReplace(categoryId, body)
        await queryClient.invalidateQueries({
          queryKey: getAdminCategoriesControllerFindOneQueryKey(categoryId),
        })
        await queryClient.invalidateQueries({ queryKey: ['/admin/categories'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, categoryId]
  )

  return { mutate, isPending }
}

export function useCategoryImageDelete(categoryId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(async () => {
    setIsPending(true)
    try {
      const result = await categoryMediaControllerDelete(categoryId)
      await queryClient.invalidateQueries({
        queryKey: getAdminCategoriesControllerFindOneQueryKey(categoryId),
      })
      await queryClient.invalidateQueries({ queryKey: ['/admin/categories'] })
      return result
    } finally {
      setIsPending(false)
    }
  }, [queryClient, categoryId])

  return { mutate, isPending }
}
