import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { useCategoryCreate } from '@/features/categories/hooks/use-categories'
import { CategoryForm } from '@/features/categories/components/CategoryForm'
import type { CreateCategoryDto } from '@/lib/api'

export function CategoryNewPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const create = useCategoryCreate()

  const handleSubmit = async (data: CreateCategoryDto) => {
    const result = await create.mutate(data)
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Category created', description: `"${data.name}" has been created.` })
      navigate(ROUTES.categories)
    } else {
      toast({ tone: 'error', title: 'Creation failed', description: 'Could not create the category. Check for duplicate codes.' })
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="New category"
          description="Create a new product category."
        />
        <CategoryForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={create.isPending}
        />
      </div>
    </PageContainer>
  )
}
