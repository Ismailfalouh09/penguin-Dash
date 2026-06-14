import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function PacksPage() {
  return (
    <ModulePlaceholder
      title="Packs"
      description="Manage curated product bundles."
      moduleSummary="Packs group several products into a single curated bundle."
      primaryAction={{ label: 'New pack' }}
      showStatePreviews
      plannedFeatures={[
        'List packs with search and pagination',
        'Create and edit packs',
        'Manage the pack image gallery and ordering',
        'Delete packs',
      ]}
    />
  )
}
