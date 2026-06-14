import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function ProductsPage() {
  return (
    <ModulePlaceholder
      title="Products"
      description="Manage products, their imagery, and references."
      moduleSummary="The catalog's core: products with images and stock-keeping references."
      primaryAction={{ label: 'New product' }}
      showStatePreviews
      plannedFeatures={[
        'List products with search, filters and pagination',
        'Create and edit products',
        'Manage the product image gallery and ordering',
        'Manage product references (variants) and stock',
        'Delete products',
      ]}
    />
  )
}
