import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { SectionCard } from '@/shared/components/common/SectionCard'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { ErrorState as ForbiddenState } from '@/shared/components/common/ErrorState'
import { useToast } from '@/shared/hooks/use-toast'
import { ProductForm } from '@/features/products/components/ProductForm'
import { ProductGallery } from '@/features/products/components/ProductGallery'
import { useProductDetail, useProductCreate, useProductUpdate } from '@/features/products/hooks/use-products'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { CreateProductDto, ProductResponse } from '@/lib/api'

export function ProductFormPage() {
  const { productId } = useParams<{ productId: string }>()
  const isEdit = Boolean(productId)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { can } = useCurrentUser()
  const canWrite = can('write')
  const canManageMedia = can('media:manage')

  const detailQuery = useProductDetail(productId ?? '')
  const create = useProductCreate()
  const update = useProductUpdate(productId ?? '')

  const product =
    isEdit && detailQuery.data?.status === 200
      ? (detailQuery.data.data as unknown as ProductResponse)
      : null

  if (!canWrite) {
    return (
      <PageContainer>
        <ForbiddenState message="You do not have permission to perform this action." />
      </PageContainer>
    )
  }

  if (isEdit && detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading product…" />
      </PageContainer>
    )
  }

  if (isEdit && (detailQuery.isError || !product)) {
    return (
      <PageContainer>
        <ErrorState
          message="Could not load product details."
          onRetry={() => detailQuery.refetch()}
        />
      </PageContainer>
    )
  }

  const handleSubmit = async (data: CreateProductDto) => {
    if (isEdit && productId) {
      const result = await update.mutate(data)
      if (result && result.status === 200) {
        toast({ tone: 'success', title: 'Product updated', description: 'Changes have been saved.' })
        navigate(ROUTES.product(productId))
      } else {
        toast({
          tone: 'error',
          title: 'Update failed',
          description: 'Could not save changes. Check for duplicate slugs or missing required fields.',
        })
      }
    } else {
      const result = await create.mutate(data)
      if (result && result.status === 200) {
        toast({ tone: 'success', title: 'Product created', description: 'The product has been created.' })
        navigate(ROUTES.products)
      } else {
        toast({
          tone: 'error',
          title: 'Create failed',
          description: 'Could not create the product. Check for duplicate slugs.',
        })
      }
    }
  }

  const isSubmitting = create.isPending || update.isPending

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={isEdit ? `Edit: ${product?.name ?? 'Product'}` : 'New product'}
          description={isEdit ? 'Update product details.' : 'Add a new product to the catalog.'}
        />

        <ProductForm
          mode={isEdit ? 'edit' : 'create'}
          defaultValues={product ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {isEdit && product && (
          <PermissionGuard permission="media:manage">
            <SectionCard title="Images" description="Manage the product cover and gallery.">
              <ProductGallery
                productId={product.id}
                coverImage={product.coverImage}
                images={product.images}
                canWrite={canWrite && canManageMedia}
              />
            </SectionCard>
          </PermissionGuard>
        )}
      </div>
    </PageContainer>
  )
}
