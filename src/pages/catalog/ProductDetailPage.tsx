import { Link, useParams, useNavigate } from 'react-router-dom'
import { Edit, Archive, Package } from 'lucide-react'
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
import { ProductGallery } from '@/features/products/components/ProductGallery'
import { useProductDetail, useProductArchive } from '@/features/products/hooks/use-products'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ProductResponse } from '@/lib/api'
import type { StatusTone } from '@/shared/components/common/StatusBadge'

const STATUS_TONE: Record<string, StatusTone> = {
  ACTIVE: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'neutral',
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="min-w-[140px] shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { can } = useCurrentUser()
  const canWrite = can('write')
  const canManageMedia = can('media:manage')

  const detailQuery = useProductDetail(productId ?? '')
  const archive = useProductArchive()
  const archiveConfirm = useConfirmDialog<ProductResponse>()

  const product =
    detailQuery.data?.status === 200 ? (detailQuery.data.data as unknown as ProductResponse) : null

  const handleArchiveConfirm = async () => {
    if (!product) return
    const result = await archive.mutate(product.id)
    archiveConfirm.close()
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Product archived',
        description: `"${product.name}" has been archived.`,
      })
      navigate(ROUTES.products)
    } else {
      toast({
        tone: 'error',
        title: 'Archive failed',
        description: 'Could not archive the product.',
      })
    }
  }

  if (detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading product…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError || !product) {
    return (
      <PageContainer>
        <ErrorState
          message="Could not load product details."
          onRetry={() => detailQuery.refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={product.name}
          description={product.slug}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to={ROUTES.productReferences(product.id)}>
                  <Package className="size-4" />
                  References ({product.references.length})
                </Link>
              </Button>
              <PermissionGuard permission="write">
                <Button asChild>
                  <Link to={ROUTES.productEdit(product.id)}>
                    <Edit className="size-4" />
                    Edit
                  </Link>
                </Button>
                {product.status !== 'ARCHIVED' && (
                  <Button variant="destructive" onClick={() => archiveConfirm.open(product)}>
                    <Archive className="size-4" />
                    Archive
                  </Button>
                )}
              </PermissionGuard>
            </div>
          }
        />

        <SectionCard title="Product information">
          <dl className="space-y-3">
            <InfoRow label="Name">{product.name}</InfoRow>
            <InfoRow label="Slug">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {product.slug}
              </code>
            </InfoRow>
            <InfoRow label="Category">{product.category.name}</InfoRow>
            <InfoRow label="Brand">{product.brand?.name ?? '—'}</InfoRow>
            <InfoRow label="Status">
              <StatusBadge tone={STATUS_TONE[product.status] ?? 'neutral'}>
                {STATUS_LABEL[product.status] ?? product.status}
              </StatusBadge>
            </InfoRow>
          </dl>
        </SectionCard>

        <SectionCard title="Pricing">
          <dl className="space-y-3">
            <InfoRow label="Base price">
              {product.basePrice.toFixed(2)} {product.currency}
            </InfoRow>
          </dl>
        </SectionCard>

        <SectionCard title="Images" description="Cover image and gallery.">
          <ProductGallery
            productId={product.id}
            coverImage={product.coverImage}
            images={product.images}
            canWrite={canWrite && canManageMedia}
          />
        </SectionCard>

        {product.references.length > 0 && (
          <SectionCard
            title="References"
            description="Product variants. Manage them on the references page."
            action={
              <Button variant="outline" size="sm" asChild>
                <Link to={ROUTES.productReferences(product.id)}>Manage references</Link>
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Product references">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="pb-2 text-left font-medium text-muted-foreground">Code</th>
                    <th scope="col" className="pb-2 text-left font-medium text-muted-foreground">Name</th>
                    <th scope="col" className="pb-2 text-left font-medium text-muted-foreground">SKU</th>
                    <th scope="col" className="pb-2 text-right font-medium text-muted-foreground">Stock</th>
                    <th scope="col" className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {product.references.map((ref) => (
                    <tr key={ref.id}>
                      <td className="py-2">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {ref.referenceCode}
                        </code>
                      </td>
                      <td className="py-2">{ref.referenceName}</td>
                      <td className="py-2 text-muted-foreground">
                        {typeof ref.sku === 'string' ? ref.sku : '—'}
                      </td>
                      <td className="py-2 text-right tabular-nums">{ref.stockQuantity}</td>
                      <td className="py-2">
                        <StatusBadge tone={ref.isActive ? 'success' : 'neutral'}>
                          {ref.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>

      <ConfirmDialog
        open={archiveConfirm.isOpen}
        onOpenChange={archiveConfirm.setOpen}
        title={`Archive "${product.name}"?`}
        description="This product will be archived and all its references will be deactivated. This cannot be undone from this interface — contact a system owner to restore."
        confirmLabel="Archive"
        destructive
        onConfirm={handleArchiveConfirm}
        isPending={archive.isPending}
      />
    </PageContainer>
  )
}
