import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function PackDetailPage() {
  const { packId } = useParams()

  return (
    <ModulePlaceholder
      title="Pack details"
      description="View a single pack and its contents."
      moduleSummary="Detailed view of one pack with its products and gallery."
      context={{ label: 'Pack ID', value: packId ?? 'unknown' }}
      plannedFeatures={[
        'Show pack fields and metadata',
        'List included products',
        'Preview the image gallery',
        'Quick link to edit',
      ]}
    />
  )
}
