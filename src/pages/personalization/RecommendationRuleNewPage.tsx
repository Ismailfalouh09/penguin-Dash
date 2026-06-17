import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { useRecommendationRuleCreate } from '@/features/recommendation-rules/hooks/use-recommendation-rules'
import { RecommendationRuleForm } from '@/features/recommendation-rules/components/RecommendationRuleForm'
import type { CreateRecommendationRuleDto } from '@/lib/api'

export function RecommendationRuleNewPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const create = useRecommendationRuleCreate()

  const handleSubmit = async (data: CreateRecommendationRuleDto) => {
    const result = await create.mutate(data)
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Rule created',
        description: `"${data.name}" has been created. It will affect future recommendation results.`,
      })
      navigate(ROUTES.recommendationRules)
    } else if (result?.status === 409) {
      toast({
        tone: 'error',
        title: 'Duplicate code',
        description: 'A rule with this code already exists. Choose a different code.',
      })
    } else {
      toast({ tone: 'error', title: 'Creation failed', description: 'Could not create the rule. Try again.' })
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="New recommendation rule"
          description="Rules configure how the recommendation engine scores packs. Changes affect future results only."
        />
        <RecommendationRuleForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={create.isPending}
        />
      </div>
    </PageContainer>
  )
}
