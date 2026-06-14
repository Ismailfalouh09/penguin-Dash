import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { ComingSoonState } from '@/shared/components/common/ComingSoonState'
import { useProductDetail } from '@/features/products/hooks/use-products'
import { ROUTES } from '@/config/routes'
import type { ProductResponse } from '@/lib/api'

export function ProductReferencesPage() {
  const { productId } = useParams<{ productId: string }>()

  const detailQuery = useProductDetail(productId ?? '')

  const product =
    detailQuery.data?.status === 200 ? (detailQuery.data.data as unknown as ProductResponse) : null

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

  const refCount = product.references.length

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={`References: ${product.name}`}
          description="Manage the purchasable variants (references) for this product."
          actions={
            <Button variant="outline" asChild>
              <Link to={ROUTES.product(product.id)}>
                <ArrowLeft className="size-4" />
                Back to product
              </Link>
            </Button>
          }
        />

        <ComingSoonState
          description={`Reference and stock management arrives in Task 8. This product currently has ${refCount} reference${refCount !== 1 ? 's' : ''}.`}
          plannedFeatures={[
            'List references with search and filters',
            'Create and edit references',
            'Update stock quantities',
            'Upload reference swatch images',
            'Deactivate references',
          ]}
        />
      </div>
    </PageContainer>
  )
}
