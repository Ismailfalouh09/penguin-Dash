import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Edit, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { DataTablePagination } from '@/shared/components/data-table/DataTablePagination'
import { SearchInput } from '@/shared/components/data-table/SearchInput'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { useListQueryState } from '@/shared/hooks/use-list-query-state'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import { buildPaginationMeta, DEFAULT_PAGE_SIZE_OPTIONS } from '@/shared/lib/pagination'
import { ROUTES } from '@/config/routes'
import { useAttributeGroupDetail } from '@/features/attributes/hooks/use-attributes'
import {
  useAttributeOptionList,
  useAttributeOptionCreate,
  useAttributeOptionUpdate,
  useAttributeOptionDeactivate,
} from '@/features/attributes/hooks/use-attribute-options'
import { useAttributeOptionColumns } from '@/features/attributes/components/AttributeOptionColumns'
import { AttributeOptionForm } from '@/features/attributes/components/AttributeOptionForm'
import type { AttributeOptionResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

export function AttributeGroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const { toast } = useToast()
  const id = groupId!

  const groupQuery = useAttributeGroupDetail(id)
  const group = groupQuery.data?.status === 200
    ? (groupQuery.data.data as unknown as { id: string; code: string; name: string })
    : null

  const { page, limit, search, setPage, setLimit, setSearch } =
    useListQueryState({ defaultLimit: 20, allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS })

  const optionsQuery = useAttributeOptionList(id, {
    page,
    pageSize: limit,
    search: search || undefined,
  })

  const rawOptions = optionsQuery.data?.status === 200
    ? (optionsQuery.data.data as unknown as PaginatedResponse<AttributeOptionResponse>)
    : null
  const options = rawOptions?.data ?? []
  const meta = rawOptions?.meta
    ? buildPaginationMeta(rawOptions.meta)
    : buildPaginationMeta({ page, pageSize: limit, totalItems: 0 })

  const createOption = useAttributeOptionCreate(id)
  const deactivateOption = useAttributeOptionDeactivate(id)
  const deactivateConfirm = useConfirmDialog<AttributeOptionResponse>()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AttributeOptionResponse | null>(null)

  const updateOption = useAttributeOptionUpdate(editTarget?.id ?? '', id)

  const handleDeactivateConfirm = async () => {
    const target = deactivateConfirm.target
    if (!target) return
    const result = await deactivateOption.mutate(target.id)
    deactivateConfirm.close()
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Option deactivated', description: `"${target.label}" has been deactivated.` })
    } else {
      toast({ tone: 'error', title: 'Action failed', description: 'Could not deactivate the option. Try again.' })
    }
  }

  const columns = useAttributeOptionColumns({
    onEdit: (option) => setEditTarget(option),
    onDeactivate: (option) => deactivateConfirm.open(option),
  })

  if (groupQuery.isLoading) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      </PageContainer>
    )
  }

  if (groupQuery.isError || groupQuery.data?.status === 404) {
    return (
      <PageContainer>
        <div className="space-y-4 py-12 text-center">
          <p className="text-muted-foreground">Attribute group not found.</p>
          <Button asChild variant="outline">
            <Link to={ROUTES.attributes}>
              <ArrowLeft className="mr-2 size-4" />
              Back to attributes
            </Link>
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.attributes}>
              <ArrowLeft className="mr-1 size-4" />
              Attributes
            </Link>
          </Button>
        </div>

        <PageHeader
          title={group?.name ?? ''}
          description={group ? `Code: ${group.code}` : undefined}
          actions={
            <PermissionGuard permission="write">
              <Button asChild variant="outline">
                <Link to={ROUTES.attributeGroupEdit(id)}>
                  <Edit className="mr-2 size-4" />
                  Edit group
                </Link>
              </Button>
            </PermissionGuard>
          }
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Options</h2>
            <PermissionGuard permission="write">
              <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 size-4" />
                Add option
              </Button>
            </PermissionGuard>
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search options…"
            aria-label="Search options"
            className="w-full sm:max-w-xs"
          />

          <DataTable
            columns={columns}
            data={options}
            isLoading={optionsQuery.isLoading}
            isError={optionsQuery.isError}
            onRetry={() => optionsQuery.refetch()}
            getRowId={(row) => row.id}
            emptyTitle="No options found"
            emptyDescription={search ? 'Try adjusting your search.' : 'Add options to this attribute group.'}
          />

          {!optionsQuery.isLoading && !optionsQuery.isError && meta.totalItems > 0 && (
            <DataTablePagination
              meta={meta}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
              disabled={optionsQuery.isFetching}
            />
          )}
        </div>
      </div>

      {/* Add option dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add option</DialogTitle>
          </DialogHeader>
          <AttributeOptionForm
            mode="create"
            onSubmit={async (data) => {
              const result = await createOption.mutate(data)
              if (result && result.status === 200) {
                toast({ tone: 'success', title: 'Option created', description: `"${data.label}" has been added.` })
                setAddDialogOpen(false)
              } else if (result?.status === 409) {
                toast({ tone: 'error', title: 'Duplicate code', description: 'An option with this code already exists.' })
              } else {
                toast({ tone: 'error', title: 'Creation failed', description: 'Could not create the option. Try again.' })
              }
            }}
            onCancel={() => setAddDialogOpen(false)}
            isSubmitting={createOption.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit option dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit option</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <AttributeOptionForm
              mode="edit"
              defaultValues={{
                code: editTarget.code,
                label: editTarget.label,
              }}
              onSubmit={async (data) => {
                const result = await updateOption.mutate(data)
                if (result && result.status === 200) {
                  toast({ tone: 'success', title: 'Option updated', description: `"${editTarget.label}" has been updated.` })
                  setEditTarget(null)
                } else {
                  toast({ tone: 'error', title: 'Update failed', description: 'Could not update the option. Try again.' })
                }
              }}
              onCancel={() => setEditTarget(null)}
              isSubmitting={updateOption.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deactivateConfirm.isOpen}
        onOpenChange={deactivateConfirm.setOpen}
        title={`Deactivate "${deactivateConfirm.target?.label}"?`}
        description="This option will be marked inactive. Deactivating may affect quiz configuration and product compatibility. It can be reactivated later by editing."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
        isPending={deactivateOption.isPending}
      />
    </PageContainer>
  )
}
