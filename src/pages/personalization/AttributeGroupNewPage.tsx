import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import { useAttributeGroupCreate } from '@/features/attributes/hooks/use-attributes'
import { AttributeGroupForm } from '@/features/attributes/components/AttributeGroupForm'
import type { CreateAttributeGroupDto } from '@/lib/api'

export function AttributeGroupNewPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const create = useAttributeGroupCreate()

  const handleSubmit = async (data: CreateAttributeGroupDto) => {
    const result = await create.mutate(data)
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Attribute group created',
        description: `"${data.name}" has been created.`,
      })
      navigate(ROUTES.attributes)
    } else if (result?.status === 409) {
      toast({
        tone: 'error',
        title: 'Duplicate code',
        description: 'An attribute group with this code already exists.',
      })
    } else {
      toast({
        tone: 'error',
        title: 'Creation failed',
        description: 'Could not create the attribute group. Try again.',
      })
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="New attribute group"
          description="Create a new attribute group for the quiz and product catalog."
        />
        <AttributeGroupForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={create.isPending}
        />
      </div>
    </PageContainer>
  )
}
