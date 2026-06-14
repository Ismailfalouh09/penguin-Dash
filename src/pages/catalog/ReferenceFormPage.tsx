import { useNavigate, useParams } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { ReferenceForm } from '@/features/product-references/components/ReferenceForm'
import { ReferenceSwatchUpload } from '@/features/product-references/components/ReferenceSwatchUpload'
import { SectionCard } from '@/shared/components/common/SectionCard'
import { useToast } from '@/shared/hooks/use-toast'
import {
  useReferenceCreate,
  useReferenceUpdate,
  useReferenceDetail,
} from '@/features/product-references/hooks/use-product-references'
import { useProductDetail } from '@/features/products/hooks/use-products'
import { ROUTES } from '@/config/routes'
import type { CreateProductReferenceDto, ProductResponse, ProductReferenceResponse } from '@/lib/api'

/**
 * New reference — route: /products/:productId/references/new
 */
export function ReferenceNewPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const productQuery = useProductDetail(productId ?? '')
  const product =
    productQuery.data?.status === 200
      ? (productQuery.data.data as unknown as ProductResponse)
      : null

  const create = useReferenceCreate(productId ?? '')

  const handleSubmit = async (dto: CreateProductReferenceDto) => {
    const result = await create.mutate(dto)
    if (result && result.status >= 200 && result.status < 300) {
      toast({
        tone: 'success',
        title: 'Reference created',
        description: `"${dto.referenceName}" has been created.`,
      })
      navigate(ROUTES.productReferences(productId ?? ''))
    } else {
      const statusCode = result?.status
      if (statusCode === 409) {
        toast({
          tone: 'error',
          title: 'Code already exists',
          description: 'A reference with this code already exists for this product.',
        })
      } else if (statusCode === 400 || statusCode === 422) {
        toast({
          tone: 'error',
          title: 'Validation error',
          description: (result as { message?: string }).message ?? 'Check the form fields and try again.',
        })
      } else {
        toast({
          tone: 'error',
          title: 'Could not create reference',
          description: (result as { message?: string }).message ?? 'An error occurred. Check the form and try again.',
        })
      }
    }
  }

  if (productQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading product…" />
      </PageContainer>
    )
  }

  if (productQuery.isError || !product) {
    return (
      <PageContainer>
        <ErrorState
          message="Could not load product details."
          onRetry={() => productQuery.refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="New reference"
          description={`Add a purchasable variant to ${product.name}`}
        />
        <ReferenceForm
          mode="create"
          productId={productId ?? ''}
          onSubmit={handleSubmit}
          isSubmitting={create.isPending}
        />
      </div>
    </PageContainer>
  )
}

/**
 * Edit reference — route: /product-references/:referenceId/edit
 */
export function ReferenceEditPage() {
  const { referenceId } = useParams<{ referenceId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const detailQuery = useReferenceDetail(referenceId ?? '')
  const reference =
    detailQuery.data?.status === 200
      ? (detailQuery.data.data as unknown as ProductReferenceResponse)
      : null

  // productId is not in the reference response; we pass empty string so hooks
  // can still invalidate what they can. The reference list cache uses productId-keyed
  // queries which will be invalidated when the user returns to the list page.
  const productIdFallback = ''

  const update = useReferenceUpdate(referenceId ?? '', productIdFallback)

  const handleSubmit = async (dto: CreateProductReferenceDto) => {
    const result = await update.mutate(dto)
    if (result && result.status >= 200 && result.status < 300) {
      toast({
        tone: 'success',
        title: 'Reference updated',
        description: 'Changes have been saved.',
      })
      navigate(ROUTES.productReference(referenceId ?? ''))
    } else {
      const statusCode = result?.status
      if (statusCode === 409) {
        toast({
          tone: 'error',
          title: 'Conflict',
          description: 'A reference with this code already exists for this product.',
        })
      } else if (statusCode === 400 || statusCode === 422) {
        toast({
          tone: 'error',
          title: 'Validation error',
          description: (result as { message?: string }).message ?? 'Check the form fields and try again.',
        })
      } else {
        toast({
          tone: 'error',
          title: 'Could not save changes',
          description: (result as { message?: string }).message ?? 'An error occurred. Check the form and try again.',
        })
      }
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
          title={`Edit: ${reference.referenceName}`}
          description={`Reference code: ${reference.referenceCode}`}
        />

        <ReferenceForm
          mode="edit"
          productId={productIdFallback}
          defaultValues={reference}
          onSubmit={handleSubmit}
          isSubmitting={update.isPending}
        />

        <SectionCard title="Swatch image">
          <ReferenceSwatchUpload
            referenceId={reference.id}
            productId={productIdFallback}
            currentImage={reference.image ?? null}
            onImageChange={() => detailQuery.refetch()}
          />
        </SectionCard>
      </div>
    </PageContainer>
  )
}
