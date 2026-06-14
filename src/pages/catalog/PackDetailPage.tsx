import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { SectionCard } from '@/shared/components/common/SectionCard'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { PackCompatibilityDisplay } from '@/features/packs/components/PackCompatibilityEditor'
import { PackItemsDisplay } from '@/features/packs/components/PackItemsEditor'
import { PackMediaGallery } from '@/features/packs/components/PackMediaGallery'
import { usePackArchive, usePackDetail } from '@/features/packs/hooks/use-packs'
import { useCurrentUser } from '@/features/auth/current-user'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import type { PackResponse } from '@/lib/api'

function statusTone(status: PackResponse['status']) {
  if (status === 'ACTIVE') return 'success'
  if (status === 'DRAFT') return 'warning'
  return 'neutral'
}

function formatPrice(pack: PackResponse) {
  if (pack.priceMode !== 'FIXED') return pack.priceMode.split('_').join(' ')
  const fixedPrice = pack.fixedPrice as unknown
  return typeof fixedPrice === 'number' ? `${fixedPrice.toFixed(2)}` : 'Fixed price'
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="min-w-40 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export function PackDetailPage() {
  const { packId } = useParams<{ packId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { can } = useCurrentUser()
  const canWrite = can('write')
  const canManageMedia = canWrite && can('media:manage')
  const archiveConfirm = useConfirmDialog<PackResponse>()
  const archive = usePackArchive()

  const query = usePackDetail(packId ?? '')
  const pack = query.data?.status === 200 ? (query.data.data as unknown as PackResponse) : null

  const handleArchiveConfirm = async () => {
    if (!pack) return
    const result = await archive.mutate(pack.id)
    archiveConfirm.close()
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Pack archived',
        description: `"${pack.name}" has been removed from public recommendations.`,
      })
      navigate(ROUTES.packs)
    } else {
      toast({ tone: 'error', title: 'Archive failed', description: 'Could not archive the pack.' })
    }
  }

  if (query.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading pack..." />
      </PageContainer>
    )
  }

  if (query.isError || !pack) {
    return (
      <PageContainer>
        <ErrorState message="Could not load pack details." onRetry={() => query.refetch()} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={pack.name}
          description={`Pack slug: ${pack.slug}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" asChild>
                <Link to={ROUTES.packs}>
                  <ArrowLeft className="size-4" />
                  Back to packs
                </Link>
              </Button>
              <PermissionGuard permission="write">
                <Button variant="outline" asChild>
                  <Link to={ROUTES.packEdit(pack.id)}>
                    <Edit className="size-4" />
                    Edit
                  </Link>
                </Button>
                {pack.status !== 'ARCHIVED' && (
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => archiveConfirm.open(pack)}
                  >
                    <Trash2 className="size-4" />
                    Archive
                  </Button>
                )}
              </PermissionGuard>
            </div>
          }
        />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <SectionCard title="Pack details">
              <dl className="space-y-3">
                <InfoRow label="Name">{pack.name}</InfoRow>
                <InfoRow label="Slug">
                  <span className="font-mono">{pack.slug}</span>
                </InfoRow>
                <InfoRow label="Status">
                  <StatusBadge tone={statusTone(pack.status)} withDot>
                    {pack.status}
                  </StatusBadge>
                </InfoRow>
                <InfoRow label="Active">{pack.isActive ? 'Yes' : 'No'}</InfoRow>
                <InfoRow label="Price mode">{pack.priceMode.split('_').join(' ')}</InfoRow>
                <InfoRow label="Price">{formatPrice(pack)}</InfoRow>
                <InfoRow label="Items">{pack.items.length}</InfoRow>
              </dl>
            </SectionCard>

            <SectionCard title="Pack items">
              <PackItemsDisplay items={pack.items} />
            </SectionCard>

            <SectionCard title="Compatibility attributes">
              <PackCompatibilityDisplay attributes={pack.attributes} />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Pack media">
              <PackMediaGallery
                packId={pack.id}
                coverImage={pack.coverImage ?? null}
                images={pack.images}
                canWrite={canManageMedia}
              />
            </SectionCard>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={archiveConfirm.isOpen}
        onOpenChange={archiveConfirm.setOpen}
        title={`Archive "${archiveConfirm.target?.name}"?`}
        description="This pack will be removed from public recommendations but historical recommendations and orders remain intact. This is not permanent deletion."
        confirmLabel="Archive"
        destructive
        onConfirm={handleArchiveConfirm}
        isPending={archive.isPending}
      />
    </PageContainer>
  )
}
