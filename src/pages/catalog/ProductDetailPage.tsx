import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function ProductDetailPage() {
  const { productId } = useParams()

  return (
    <ModulePlaceholder
      title="Product details"
      description="View a single product, its images and references."
      moduleSummary="Detailed view of one product with its gallery and references."
      context={{ label: 'Product ID', value: productId ?? 'unknown' }}
      plannedFeatures={[
        'Show product fields and metadata',
        'Preview the image gallery',
        'List linked references and stock',
        'Quick links to edit and manage references',
      ]}
    />
  )
}
