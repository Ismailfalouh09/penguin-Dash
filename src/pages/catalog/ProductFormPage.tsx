import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function ProductFormPage() {
  const { productId } = useParams()
  const isEdit = Boolean(productId)

  return (
    <ModulePlaceholder
      title={isEdit ? 'Edit product' : 'New product'}
      description={isEdit ? 'Update an existing product.' : 'Create a new product in the catalog.'}
      moduleSummary="Form for creating and editing products, validated with Zod + React Hook Form."
      context={isEdit ? { label: 'Editing product', value: productId ?? 'unknown' } : undefined}
      plannedFeatures={[
        'Validated product form (name, description, brand, category)',
        'Image upload after creation',
        'Save, cancel and delete actions',
      ]}
    />
  )
}
