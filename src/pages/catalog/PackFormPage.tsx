import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function PackFormPage() {
  const { packId } = useParams()
  const isEdit = Boolean(packId)

  return (
    <ModulePlaceholder
      title={isEdit ? 'Edit pack' : 'New pack'}
      description={isEdit ? 'Update an existing pack.' : 'Create a new curated pack.'}
      moduleSummary="Form for creating and editing packs, validated with Zod + React Hook Form."
      context={isEdit ? { label: 'Editing pack', value: packId ?? 'unknown' } : undefined}
      plannedFeatures={[
        'Validated pack form (name, description, products)',
        'Image upload after creation',
        'Save, cancel and delete actions',
      ]}
    />
  )
}
