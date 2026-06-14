import { useNavigate, useParams } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { ForbiddenState } from '@/shared/components/common/ForbiddenState'
import { SectionCard } from '@/shared/components/common/SectionCard'
import { PackForm } from '@/features/packs/components/PackForm'
import { PackMediaGallery } from '@/features/packs/components/PackMediaGallery'
import { usePackCreate, usePackDetail, usePackUpdate } from '@/features/packs/hooks/use-packs'
import { useCurrentUser } from '@/features/auth/current-user'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import type { CreatePackDto, PackResponse } from '@/lib/api'

export function PackFormPage() {
  const { packId } = useParams<{ packId: string }>()
  const mode = packId ? 'edit' : 'create'
  const navigate = useNavigate()
  const { toast } = useToast()
  const { can } = useCurrentUser()
  const canWrite = can('write')
  const canManageMedia = canWrite && can('media:manage')

  const detailQuery = usePackDetail(packId ?? '')
  const pack =
    detailQuery.data?.status === 200 ? (detailQuery.data.data as unknown as PackResponse) : null
  const create = usePackCreate()
  const update = usePackUpdate(packId ?? '')

  const handleSubmit = async (dto: CreatePackDto) => {
    const result = mode === 'create' ? await create.mutate(dto) : await update.mutate(dto)

    if (result && result.status >= 200 && result.status < 300) {
      toast({
        tone: 'success',
        title: mode === 'create' ? 'Pack created' : 'Pack updated',
        description:
          mode === 'create'
            ? `"${dto.name}" has been created. You can now upload a cover image.`
            : 'Pack changes have been saved.',
      })
      if (mode === 'create') {
        const createdPack = result.data as unknown as { id?: string } | null
        navigate(createdPack?.id ? ROUTES.packEdit(createdPack.id) : ROUTES.packs)
      } else {
        navigate(ROUTES.pack(packId ?? ''))
      }
    } else {
      toast({
        tone: 'error',
        title: mode === 'create' ? 'Could not create pack' : 'Could not update pack',
        description: 'Check the form fields and try again.',
      })
    }
  }

  if (!canWrite) {
    return (
      <PageContainer>
        <ForbiddenState message="You can view packs, but you do not have permission to create or edit them." />
      </PageContainer>
    )
  }

  if (mode === 'edit' && detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading pack..." />
      </PageContainer>
    )
  }

  if (mode === 'edit' && (detailQuery.isError || !pack)) {
    return (
      <PageContainer>
        <ErrorState message="Could not load pack details." onRetry={() => detailQuery.refetch()} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={mode === 'create' ? 'New pack' : `Edit: ${pack?.name ?? 'Pack'}`}
          description={
            mode === 'create'
              ? 'Create a curated product bundle.'
              : 'Update pack configuration, items, compatibility, and media.'
          }
        />

        <PackForm
          mode={mode}
          defaultValues={pack ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={mode === 'create' ? create.isPending : update.isPending}
        />

        {mode === 'edit' && pack && (
          <SectionCard title="Pack media">
            <PackMediaGallery
              packId={pack.id}
              coverImage={pack.coverImage ?? null}
              images={pack.images}
              canWrite={canManageMedia}
            />
          </SectionCard>
        )}
      </div>
    </PageContainer>
  )
}
