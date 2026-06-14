import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function CategoriesPage() {
  return (
    <ModulePlaceholder
      title="Categories"
      description="Organize products into browsable categories."
      moduleSummary="Create and manage the category tree used to group products."
      primaryAction={{ label: 'New category' }}
      showStatePreviews
      plannedFeatures={[
        'List categories with search and pagination',
        'Create and edit categories',
        'Upload and remove category images',
        'Delete categories',
      ]}
    />
  )
}
