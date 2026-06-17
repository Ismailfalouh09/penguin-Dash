import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import {
  adminRecommendationRulesControllerCreate,
  adminRecommendationRulesControllerDeactivate,
  adminRecommendationRulesControllerPreview,
  adminRecommendationRulesControllerUpdate,
  getAdminRecommendationRulesControllerFindOneQueryKey,
  useAdminRecommendationRulesControllerFindAll,
  useAdminRecommendationRulesControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-recommendation-rules/admin-recommendation-rules'
import type {
  AdminRecommendationRulesControllerFindAllParams,
  CreateRecommendationDto,
  CreateRecommendationRuleDto,
  UpdateRecommendationRuleDto,
} from '@/lib/api'

const LIST_KEY = '/admin/recommendation-rules'

export function useRecommendationRuleList(params: AdminRecommendationRulesControllerFindAllParams) {
  return useAdminRecommendationRulesControllerFindAll(params)
}

export function useRecommendationRuleDetail(id: string) {
  return useAdminRecommendationRulesControllerFindOne(id)
}

export function useRecommendationRuleCreate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateRecommendationRuleDto) => {
      setIsPending(true)
      try {
        const result = await adminRecommendationRulesControllerCreate(dto)
        await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function useRecommendationRuleUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateRecommendationRuleDto) => {
      setIsPending(true)
      try {
        const result = await adminRecommendationRulesControllerUpdate(id, dto)
        await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
        await queryClient.invalidateQueries({
          queryKey: getAdminRecommendationRulesControllerFindOneQueryKey(id),
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

export function useRecommendationRuleDeactivate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminRecommendationRulesControllerDeactivate(id)
        await queryClient.invalidateQueries({ queryKey: [LIST_KEY] })
        await queryClient.invalidateQueries({
          queryKey: getAdminRecommendationRulesControllerFindOneQueryKey(id),
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

export function useRecommendationPreview() {
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(async (dto: CreateRecommendationDto) => {
    setIsPending(true)
    try {
      return await adminRecommendationRulesControllerPreview(dto)
    } finally {
      setIsPending(false)
    }
  }, [])

  return { mutate, isPending }
}
