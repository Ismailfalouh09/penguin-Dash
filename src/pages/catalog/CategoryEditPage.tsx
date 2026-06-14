import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { SectionCard } from '@/shared/components/common/SectionCard'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import {
  useCategoryDetail,
  useCategoryUpdate,
} from '@/features/categories/hooks/use-categories'
import { CategoryForm } from '@/features/categories/components/CategoryForm'
import { CategoryImageUpload } from '@/features/categories/components/CategoryImageUpload'
import type { CreateCategoryDto, AdminCategoryResponse } from '@/lib/api'

export function CategoryEditPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const detailQuery = useCategoryDetail(categoryId ?? '')
  const update = useCategoryUpdate(categoryId ?? '')

  const category =
    detailQuery.data?.status === 200
      ? (detailQuery.data.data as unknown as AdminCategoryResponse)
      : null

  const handleSubmit = async (data: CreateCategoryDto) => {
    const result = await update.mutate(data)
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Category updated', description: 'Changes have been saved.' })
      navigate(ROUTES.categories)
    } else {
      toast({ tone: 'error', title: 'Update failed', description: 'Could not save changes. Check for duplicate codes.' })
    }
  }

  if (detailQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading category…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError || !category) {
    return (
      <PageContainer>
        <ErrorState
          message="Could not load category details."
          onRetry={() => detailQuery.refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={`Edit: ${category.name}`}
          description="Update category details and image."
        />

        <SectionCard title="Image" description="Category image shown in the catalog.">
          <CategoryImageUpload categoryId={categoryId!} currentImage={category.image} />
        </SectionCard>

        <CategoryForm
          mode="edit"
          defaultValues={category}
          onSubmit={handleSubmit}
          isSubmitting={update.isPending}
        />
      </div>
    </PageContainer>
  )
}
