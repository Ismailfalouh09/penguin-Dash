import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function MediaPage() {
  return (
    <ModulePlaceholder
      title="Media library"
      description="Browse and manage catalog imagery."
      moduleSummary="Central library of uploaded media used across the catalog."
      primaryAction={{ label: 'Upload media', permission: 'media:manage' }}
      showStatePreviews
      plannedFeatures={[
        'Browse uploaded media in a grid',
        'Upload new media assets',
        'Update media metadata',
        'Delete unused media',
      ]}
    />
  )
}
