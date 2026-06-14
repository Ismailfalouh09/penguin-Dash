import { useQueryClient } from '@tanstack/react-query'
import {
  adminQuizControllerCreate,
  adminQuizControllerDeactivate,
  adminQuizControllerReorder,
  adminQuizControllerUpdate,
  getAdminQuizControllerFindOneQueryKey,
  useAdminQuizControllerFindAll,
  useAdminQuizControllerFindOne,
} from '@/lib/api/generated/endpoints/admin-quiz/admin-quiz'
import { useCallback, useState } from 'react'
import type {
  AdminQuizControllerFindAllParams,
  CreateQuizQuestionDto,
  ReorderQuizQuestionsDto,
  UpdateQuizQuestionDto,
} from '@/lib/api'

export function useQuizQuestionList(params?: AdminQuizControllerFindAllParams) {
  return useAdminQuizControllerFindAll(params)
}

export function useQuizQuestionDetail(id: string) {
  return useAdminQuizControllerFindOne(id)
}

export function useQuizQuestionCreate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: CreateQuizQuestionDto) => {
      setIsPending(true)
      try {
        const result = await adminQuizControllerCreate(dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/quiz/questions'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}

export function useQuizQuestionUpdate(id: string) {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: UpdateQuizQuestionDto) => {
      setIsPending(true)
      try {
        const result = await adminQuizControllerUpdate(id, dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/quiz/questions'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminQuizControllerFindOneQueryKey(id),
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

export function useQuizQuestionDeactivate() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (id: string) => {
      setIsPending(true)
      try {
        const result = await adminQuizControllerDeactivate(id)
        await queryClient.invalidateQueries({ queryKey: ['/admin/quiz/questions'] })
        await queryClient.invalidateQueries({
          queryKey: getAdminQuizControllerFindOneQueryKey(id),
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

export function useQuizQuestionsReorder() {
  const queryClient = useQueryClient()
  const [isPending, setIsPending] = useState(false)

  const mutate = useCallback(
    async (dto: ReorderQuizQuestionsDto) => {
      setIsPending(true)
      try {
        const result = await adminQuizControllerReorder(dto)
        await queryClient.invalidateQueries({ queryKey: ['/admin/quiz/questions'] })
        return result
      } finally {
        setIsPending(false)
      }
    },
    [queryClient]
  )

  return { mutate, isPending }
}
