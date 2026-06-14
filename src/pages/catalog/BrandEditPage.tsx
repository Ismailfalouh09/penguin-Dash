import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { useBrandDetail, useBrandUpdate } from '@/features/brands/hooks/use-brands'
import { BrandForm } from '@/features/brands/components/BrandForm'
import type { AdminBrandResponse, CreateBrandDto } from '@/lib/api'

export function BrandEditPage() {
  const { brandId } = useParams<{ brandId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const detailQuery = useBrandDetail(brandId ?? '')
  const update = useBrandUpdate(brandId ?? '')

  const brand =
    detailQuery.data?.status === 200
      ? (detailQuery.data.data as unknown as AdminBrandResponse)
      : null

  const handleSubmit = async (data: CreateBrandDto) => {
    const result = await update.mutate(data)
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Brand updated', description: 'Changes have been saved.' })
      navigate(ROUTES.brands)
    } else {
      toast({ tone: 'error', title: 'Update failed', description: 'Could not save changes. Try again.' })
    }
  }

  if (detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading brand…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError || !brand) {
    return (
      <PageContainer>
        <ErrorState
          message="Could not load brand details."
          onRetry={() => detailQuery.refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={`Edit: ${brand.name}`}
          description="Update brand details."
        />
        <BrandForm
          mode="edit"
          defaultValues={brand}
          onSubmit={handleSubmit}
          isSubmitting={update.isPending}
        />
      </div>
    </PageContainer>
  )
}
