import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function QuizPage() {
  return (
    <ModulePlaceholder
      title="Quiz"
      description="Manage the recommendation quiz questions."
      moduleSummary="The ordered set of questions customers answer to get recommendations."
      primaryAction={{ label: 'New question' }}
      showStatePreviews
      plannedFeatures={[
        'List quiz questions in order',
        'Create and edit questions',
        'Reorder questions',
        'Delete questions',
      ]}
    />
  )
}
