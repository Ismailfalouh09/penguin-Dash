import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  adminProductsControllerCreate,
  adminProductsControllerUpdate,
  adminProductsControllerArchive,
  getAdminProductsControllerFindOneQueryKey,
  useAdminProductsControllerFindAll,
  useAdminProductsControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-products/admin-products'
import {
  productMediaControllerUpload,
  productMediaControllerDelete,
  productMediaControllerReorder,
} from '@/lib/api/generated/endpoints/admin-product-media/admin-product-media'
import type {
  AdminProductsControllerFindAllParams,
  CreateProductDto,
  UpdateProductDto,
  ProductMediaControllerUploadBody,
  ReorderMediaDto,
} from '@/lib/api'

export function useProductList(params: AdminProductsControllerFindAllParams) {
  return useAdminProductsControllerFindAll(params)
}

export function useProductDetail(id: string) {
  return useAdminProductsControllerFindOne(id)
}

export function useProductCreate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateProductDto) => {
      setIsPending(true)
      try {
        const result = await adminProductsControllerCreate(dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/products'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function useProductUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateProductDto) => {
      setIsPending(true)
      try {
        const result = await adminProductsControllerUpdate(id, dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/products'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(id),
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

export function useProductArchive() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminProductsControllerArchive(id)
        await queryClient.invalidateQueries({ queryKey: ['/admin/products'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(id),
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

export function useProductImageUpload(productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (body: ProductMediaControllerUploadBody) => {
      setIsPending(true)
      try {
        const result = await productMediaControllerUpload(productId, body)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(productId),
        })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, productId]
  )

  return { mutate, isPending }
}

export function useProductImageDelete(productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (imageId: string) => {
      setIsPending(true)
      try {
        const result = await productMediaControllerDelete(productId, imageId)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(productId),
        })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, productId]
  )

  return { mutate, isPending }
}

export function useProductImageReorder(productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: ReorderMediaDto) => {
      setIsPending(true)
      try {
        const result = await productMediaControllerReorder(productId, dto)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(productId),
        })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, productId]
  )

  return { mutate, isPending }
}
