import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function AttributesPage() {
  return (
    <ModulePlaceholder
      title="Attributes"
      description="Manage quiz attribute groups and their options."
      moduleSummary="Attributes define the dimensions (e.g. skin type) used by the quiz."
      primaryAction={{ label: 'New attribute group' }}
      showStatePreviews
      plannedFeatures={[
        'List attribute groups',
        'Create and edit attribute groups',
        'Manage options within a group',
        'Deactivate and delete attributes',
      ]}
    />
  )
}
