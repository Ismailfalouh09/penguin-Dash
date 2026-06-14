import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { useBrandCreate } from '@/features/brands/hooks/use-brands'
import { BrandForm } from '@/features/brands/components/BrandForm'
import type { CreateBrandDto } from '@/lib/api'

export function BrandNewPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const create = useBrandCreate()

  const handleSubmit = async (data: CreateBrandDto) => {
    const result = await create.mutate(data)
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Brand created', description: `"${data.name}" has been created.` })
      navigate(ROUTES.brands)
    } else {
      toast({ tone: 'error', title: 'Creation failed', description: 'Could not create the brand. Check for duplicate names.' })
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="New brand"
          description="Create a new brand for the catalog."
        />
        <BrandForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={create.isPending}
        />
      </div>
    </PageContainer>
  )
}
