import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { ApiError } from '@/lib/api'
import {
  adminProductReferencesControllerCreate,
  adminProductReferencesControllerUpdate,
  adminProductReferencesControllerDeactivate,
  adminProductReferencesControllerUpdateStock,
  getAdminProductReferencesControllerFindOneQueryKey,
  getAdminProductReferencesControllerFindAllForProductQueryKey,
  useAdminProductReferencesControllerFindAllForProduct,
  useAdminProductReferencesControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-product-references/admin-product-references'
import {
  productReferenceMediaControllerReplace,
  productReferenceMediaControllerDelete,
} from '@/lib/api/generated/endpoints/admin-product-reference-media/admin-product-reference-media'
import {
  useAdminAttributesControllerFindGroups,
} from '@/lib/api/generated/endpoints/admin-attributes/admin-attributes'
import { getAdminProductsControllerFindOneQueryKey } from '@/lib/api/generated/endpoints/admin-products/admin-products'
import type {
  AdminProductReferencesControllerFindAllForProductParams,
  CreateProductReferenceDto,
  UpdateProductReferenceDto,
  UpdateReferenceStockDto,
  ProductReferenceMediaControllerReplaceBody,
} from '@/lib/api'

export function useReferenceList(
  productId: string,
  params?: AdminProductReferencesControllerFindAllForProductParams
) {
  return useAdminProductReferencesControllerFindAllForProduct(productId, params)
}

export function useReferenceDetail(id: string) {
  return useAdminProductReferencesControllerFindOne(id)
}

export function useAttributeGroups() {
  return useAdminAttributesControllerFindGroups({ pageSize: 100, isProductAttribute: true })
}

export function useReferenceCreate(productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateProductReferenceDto) => {
      setIsPending(true)
      try {
        const result = await adminProductReferencesControllerCreate(productId, dto)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindAllForProductQueryKey(productId),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(productId),
        })
        return result
      } catch (err: unknown) {
        if (err instanceof ApiError) return { status: err.status ?? 500, message: err.message }
        return { status: 500, message: 'Unexpected error' }
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, productId]
  )

  return { mutate, isPending }
}

export function useReferenceUpdate(id: string, productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateProductReferenceDto) => {
      setIsPending(true)
      try {
        const result = await adminProductReferencesControllerUpdate(id, dto)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindOneQueryKey(id),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindAllForProductQueryKey(productId),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(productId),
        })
        return result
      } catch (err: unknown) {
        if (err instanceof ApiError) return { status: err.status ?? 500, message: err.message }
        return { status: 500, message: 'Unexpected error' }
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, id, productId]
  )

  return { mutate, isPending }
}

export function useReferenceDeactivate(productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminProductReferencesControllerDeactivate(id)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindOneQueryKey(id),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindAllForProductQueryKey(productId),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductsControllerFindOneQueryKey(productId),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, productId]
  )

  return { mutate, isPending }
}

export function useReferenceStockUpdate(id: string, productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateReferenceStockDto) => {
      setIsPending(true)
      try {
        const result = await adminProductReferencesControllerUpdateStock(id, dto)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindOneQueryKey(id),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindAllForProductQueryKey(productId),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, id, productId]
  )

  return { mutate, isPending }
}

export function useReferenceSwatchUpload(referenceId: string, productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (body: ProductReferenceMediaControllerReplaceBody) => {
      setIsPending(true)
      try {
        const result = await productReferenceMediaControllerReplace(referenceId, body)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindOneQueryKey(referenceId),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindAllForProductQueryKey(productId),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, referenceId, productId]
  )

  return { mutate, isPending }
}

export function useReferenceSwatchDelete(referenceId: string, productId: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async () => {
      setIsPending(true)
      try {
        const result = await productReferenceMediaControllerDelete(referenceId)
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindOneQueryKey(referenceId),
        })
        await queryClient.invalidateQueries({
          queryKey: getAdminProductReferencesControllerFindAllForProductQueryKey(productId),
        })
        return result
      } catch {
        return undefined
      } finally {
        setIsPending(false)
      }
    },
    [queryClient, referenceId, productId]
  )

  return { mutate, isPending }
}
