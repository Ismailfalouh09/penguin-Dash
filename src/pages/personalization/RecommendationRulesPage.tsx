import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function RecommendationRulesPage() {
  return (
    <ModulePlaceholder
      title="Recommendation rules"
      description="Define how quiz answers map to recommended packs."
      moduleSummary="Rules connect quiz answers to the packs customers are recommended."
      primaryAction={{ label: 'New rule' }}
      showStatePreviews
      plannedFeatures={[
        'List recommendation rules',
        'Create and edit rules',
        'Preview rule results (available to all roles)',
        'Delete rules',
      ]}
    />
  )
}
