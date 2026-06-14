import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function BrandsPage() {
  return (
    <ModulePlaceholder
      title="Brands"
      description="Manage the brands products belong to."
      moduleSummary="Maintain the list of brands referenced across the catalog."
      primaryAction={{ label: 'New brand' }}
      showStatePreviews
      plannedFeatures={[
        'List brands with search and pagination',
        'Create and edit brands',
        'Delete brands',
      ]}
    />
  )
}
