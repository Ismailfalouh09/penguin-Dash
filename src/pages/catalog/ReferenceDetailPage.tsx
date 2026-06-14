import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Edit, ArrowLeft, PowerOff, BarChart2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { SectionCard } from '@/shared/components/common/SectionCard'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import { CompatibilityDisplay } from '@/features/product-references/components/CompatibilityEditor'
import { StockUpdateDialog } from '@/features/product-references/components/StockUpdateDialog'
import { ReferenceSwatchUpload } from '@/features/product-references/components/ReferenceSwatchUpload'
import {
  useReferenceDetail,
  useReferenceDeactivate,
} from '@/features/product-references/hooks/use-product-references'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ProductReferenceResponse } from '@/lib/api'

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="min-w-[160px] shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export function ReferenceDetailPage() {
  const { referenceId } = useParams<{ referenceId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { can } = useCurrentUser()
  const canWrite = can('write')
  const canManageMedia = can('media:manage')

  const detailQuery = useReferenceDetail(referenceId ?? '')
  const deactivateConfirm = useConfirmDialog<ProductReferenceResponse>()
  const [stockDialogOpen, setStockDialogOpen] = React.useState(false)

  const reference =
    detailQuery.data?.status === 200
      ? (detailQuery.data.data as unknown as ProductReferenceResponse)
      : null

  // We need productId for cache invalidation; it's not in the reference response,
  // so we rely on the back-navigation to the list page which carries :productId.
  // For stock/swatch mutations we use empty string as fallback when productId is unavailable.
  const productIdFallback = ''

  const deactivate = useReferenceDeactivate(productIdFallback)

  const handleDeactivateConfirm = async () => {
    if (!reference) return
    const result = await deactivate.mutate(reference.id)
    deactivateConfirm.close()
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Reference deactivated',
        description: `"${reference.referenceName}" has been deactivated.`,
      })
      navigate(-1)
    } else {
      toast({ tone: 'error', title: 'Action failed', description: 'Could not deactivate the reference.' })
    }
  }

  if (detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading reference…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError || !reference) {
    return (
      <PageContainer>
        <ErrorState
          message="Could not load reference details."
          onRetry={() => detailQuery.refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={reference.referenceName}
          description={`Reference code: ${reference.referenceCode}`}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="size-4" />
                Back
              </Button>

              <PermissionGuard permission="write">
                <Button variant="outline" size="sm" asChild>
                  <Link to={ROUTES.productReferenceEdit(reference.id)}>
                    <Edit className="size-4" />
                    Edit
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStockDialogOpen(true)}
                >
                  <BarChart2 className="size-4" />
                  Update stock
                </Button>

                {reference.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deactivateConfirm.open(reference)}
                  >
                    <PowerOff className="size-4" />
                    Deactivate
                  </Button>
                )}
              </PermissionGuard>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Details">
              <dl className="space-y-3">
                <InfoRow label="Reference code">
                  <span className="font-mono">{reference.referenceCode}</span>
                </InfoRow>
                <InfoRow label="Name / Shade">{reference.referenceName}</InfoRow>
                {typeof reference.sku === 'string' && (
                  <InfoRow label="SKU">{reference.sku}</InfoRow>
                )}
                {typeof reference.barcode === 'string' && (
                  <InfoRow label="Barcode">{reference.barcode}</InfoRow>
                )}
                <InfoRow label="Price delta">
                  {reference.priceDelta === 0 ? (
                    <span className="text-muted-foreground">No adjustment</span>
                  ) : (
                    <span className={reference.priceDelta > 0 ? 'text-success' : 'text-destructive'}>
                      {reference.priceDelta > 0 ? '+' : ''}{reference.priceDelta.toFixed(2)}
                    </span>
                  )}
                </InfoRow>
                <InfoRow label="Status">
                  <StatusBadge tone={reference.isActive ? 'success' : 'neutral'} withDot>
                    {reference.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </InfoRow>
              </dl>
            </SectionCard>

            <SectionCard title="Stock">
              <dl className="space-y-3">
                <InfoRow label="Available stock">
                  <span
                    className={
                      reference.stockQuantity - reference.reservedQuantity <= 0
                        ? 'font-medium text-destructive'
                        : ''
                    }
                  >
                    {reference.stockQuantity - reference.reservedQuantity} units
                  </span>
                </InfoRow>
                <InfoRow label="Total stock">{reference.stockQuantity} units</InfoRow>
                <InfoRow label="Reserved">{reference.reservedQuantity} units</InfoRow>
              </dl>
              {(canWrite) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStockDialogOpen(true)}
                  >
                    <BarChart2 className="size-4" />
                    Manual stock update
                  </Button>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Compatibility attributes">
              <CompatibilityDisplay attributes={reference.attributes} />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Swatch image">
              {canManageMedia ? (
                <ReferenceSwatchUpload
                  referenceId={reference.id}
                  productId={productIdFallback}
                  currentImage={reference.image ?? null}
                  onImageChange={() => detailQuery.refetch()}
                />
              ) : (
                <div>
                  {reference.image ? (
                    <img
                      src={reference.image.urls.swatch ?? reference.image.urls.thumbnail}
                      alt={
                        typeof reference.image.altText === 'string'
                          ? reference.image.altText
                          : `Swatch for ${reference.referenceName}`
                      }
                      className="w-full max-w-[160px] rounded border border-border object-cover"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">No swatch image.</p>
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deactivateConfirm.isOpen}
        onOpenChange={deactivateConfirm.setOpen}
        title={`Deactivate "${deactivateConfirm.target?.referenceName}"?`}
        description="This reference will be marked inactive and will no longer be available for purchase. You can reactivate it later by editing the reference."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
        isPending={deactivate.isPending}
      />

      <StockUpdateDialog
        reference={reference}
        productId={productIdFallback}
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
      />
    </PageContainer>
  )
}

