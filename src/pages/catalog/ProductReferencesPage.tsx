import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function ProductReferencesPage() {
  const { productId } = useParams()

  return (
    <ModulePlaceholder
      title="Product references"
      description="Manage the references (variants) and stock for a product."
      moduleSummary="References are a product's purchasable variants, each with its own stock and swatch."
      context={{ label: 'Product ID', value: productId ?? 'unknown' }}
      primaryAction={{ label: 'New reference' }}
      showStatePreviews
      plannedFeatures={[
        'List references for the product',
        'Create and edit references',
        'Update reference stock',
        'Upload and remove reference swatch images',
        'Delete references',
      ]}
    />
  )
}
