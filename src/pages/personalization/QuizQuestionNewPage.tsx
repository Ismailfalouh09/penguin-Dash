import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { useQuizQuestionCreate } from '@/features/quiz/hooks/use-quiz'
import { QuizQuestionForm } from '@/features/quiz/components/QuizQuestionForm'
import type { CreateQuizQuestionDto, UpdateQuizQuestionDto } from '@/lib/api'

export function QuizQuestionNewPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const create = useQuizQuestionCreate()

  const handleSubmit = async (data: CreateQuizQuestionDto | UpdateQuizQuestionDto) => {
    const result = await create.mutate(data as CreateQuizQuestionDto)
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Question created',
        description: 'The quiz question has been created.',
      })
      navigate(ROUTES.quiz)
    } else if (result?.status === 409) {
      toast({
        tone: 'error',
        title: 'Conflict',
        description: 'An active quiz question already exists for this attribute group.',
      })
    } else {
      toast({
        tone: 'error',
        title: 'Creation failed',
        description: 'Could not create the quiz question. Try again.',
      })
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="New quiz question"
          description="Create a new question for the recommendation quiz."
        />
        <QuizQuestionForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={create.isPending}
        />
      </div>
    </PageContainer>
  )
}
