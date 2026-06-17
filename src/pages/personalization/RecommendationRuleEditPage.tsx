import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import {
  useRecommendationRuleDetail,
  useRecommendationRuleUpdate,
} from '@/features/recommendation-rules/hooks/use-recommendation-rules'
import { RecommendationRuleForm } from '@/features/recommendation-rules/components/RecommendationRuleForm'
import type { RecommendationRuleResponse, UpdateRecommendationRuleDto } from '@/lib/api'

export function RecommendationRuleEditPage() {
  const { ruleId } = useParams<{ ruleId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const id = ruleId ?? ''

  const detailQuery = useRecommendationRuleDetail(id)
  const update = useRecommendationRuleUpdate(id)

  const rule =
    detailQuery.data?.status === 200
      ? (detailQuery.data.data as unknown as RecommendationRuleResponse)
      : null

  const handleSubmit = async (data: UpdateRecommendationRuleDto) => {
    const result = await update.mutate(data)
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Rule updated',
        description: 'Changes have been saved. Future recommendation results will reflect this update.',
      })
      navigate(ROUTES.recommendationRules)
    } else {
      toast({ tone: 'error', title: 'Update failed', description: 'Could not save changes. Try again.' })
    }
  }

  if (detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading rule…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError || !rule) {
    return (
      <PageContainer>
        <ErrorState
          message="Could not load rule details."
          onRetry={() => detailQuery.refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={`Edit: ${rule.name}`}
          description="Rule code is immutable. Changes affect future recommendation results only."
        />
        <RecommendationRuleForm
          mode="edit"
          defaultValues={rule}
          onSubmit={handleSubmit}
          isSubmitting={update.isPending}
        />
      </div>
    </PageContainer>
  )
}
