import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { useToast } from '@/shared/hooks/use-toast'
import { ROUTES } from '@/config/routes'
import {
  useAttributeGroupDetail,
  useAttributeGroupUpdate,
} from '@/features/attributes/hooks/use-attributes'
import { AttributeGroupForm } from '@/features/attributes/components/AttributeGroupForm'
import type { AttributeGroupResponse, UpdateAttributeGroupDto } from '@/lib/api'

export function AttributeGroupEditPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const id = groupId!

  const query = useAttributeGroupDetail(id)
  const update = useAttributeGroupUpdate(id)

  const group = query.data?.status === 200
    ? (query.data.data as unknown as AttributeGroupResponse)
    : null

  const handleSubmit = async (data: UpdateAttributeGroupDto) => {
    const result = await update.mutate(data)
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Attribute group updated',
        description: `"${group?.name}" has been updated.`,
      })
      navigate(ROUTES.attributeGroup(id))
    } else {
      toast({
        tone: 'error',
        title: 'Update failed',
        description: 'Could not update the attribute group. Try again.',
      })
    }
  }

  if (query.isLoading) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      </PageContainer>
    )
  }

  if (query.isError || query.data?.status === 404) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-muted-foreground">Attribute group not found.</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Edit attribute group"
          description={`Editing "${group?.name}"`}
        />
        {group && (
          <AttributeGroupForm
            mode="edit"
            defaultValues={{
              code: group.code,
              name: group.name,
            }}
            onSubmit={handleSubmit}
            isSubmitting={update.isPending}
          />
        )}
      </div>
    </PageContainer>
  )
}
