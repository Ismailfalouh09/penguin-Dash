import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { useQuizQuestionDetail, useQuizQuestionUpdate } from '@/features/quiz/hooks/use-quiz'
import { QuizQuestionForm } from '@/features/quiz/components/QuizQuestionForm'
import type { CreateQuizQuestionDto, QuizQuestionResponse, UpdateQuizQuestionDto } from '@/lib/api'

export function QuizQuestionEditPage() {
  const { questionId } = useParams<{ questionId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const id = questionId!

  const query = useQuizQuestionDetail(id)
  const update = useQuizQuestionUpdate(id)

  const question = query.data?.status === 200
    ? (query.data.data as unknown as QuizQuestionResponse)
    : null

  const handleSubmit = async (data: CreateQuizQuestionDto | UpdateQuizQuestionDto) => {
    const result = await update.mutate(data as UpdateQuizQuestionDto)
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Question updated',
        description: 'The quiz question has been updated.',
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
        title: 'Update failed',
        description: 'Could not update the quiz question. Try again.',
      })
    }
  }

  if (query.isLoading) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      </PageContainer>
    )
  }

  if (query.isError || query.data?.status === 404) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-muted-foreground">Quiz question not found.</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Edit quiz question"
          description={question ? `Editing "${question.questionText}"` : 'Edit quiz question'}
        />
        {question && (
          <QuizQuestionForm
            mode="edit"
            defaultValues={question}
            onSubmit={handleSubmit}
            isSubmitting={update.isPending}
          />
        )}
      </div>
    </PageContainer>
  )
}
