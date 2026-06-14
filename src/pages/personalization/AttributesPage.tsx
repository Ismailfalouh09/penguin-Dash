import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { DataTablePagination } from '@/shared/components/data-table/DataTablePagination'
import { SearchInput } from '@/shared/components/data-table/SearchInput'
import { SelectFilter } from '@/shared/components/data-table/SelectFilter'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { useListQueryState } from '@/shared/hooks/use-list-query-state'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import { buildPaginationMeta, DEFAULT_PAGE_SIZE_OPTIONS } from '@/shared/lib/pagination'
import { ROUTES } from '@/config/routes'
import { useAttributeGroupList, useAttributeGroupDeactivate } from '@/features/attributes/hooks/use-attributes'
import { useAttributeGroupColumns } from '@/features/attributes/components/AttributeGroupColumns'
import type { AttributeGroupResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

export function AttributesPage() {
  const { toast } = useToast()
  const deactivate = useAttributeGroupDeactivate()
  const deactivateConfirm = useConfirmDialog<AttributeGroupResponse>()

  const { page, limit, search, filters, setPage, setLimit, setSearch, setFilter } =
    useListQueryState({ defaultLimit: 20, allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS })

  const isActiveFilter = filters['isActive'] ?? null

  const query = useAttributeGroupList({
    page,
    pageSize: limit,
    search: search || undefined,
    isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
  })

  const rawData = query.data?.status === 200
    ? (query.data.data as unknown as PaginatedResponse<AttributeGroupResponse>)
    : null

  const groups = rawData?.data ?? []
  const meta = rawData?.meta
    ? buildPaginationMeta(rawData.meta)
    : buildPaginationMeta({ page, pageSize: limit, totalItems: 0 })

  const handleDeactivateConfirm = async () => {
    const target = deactivateConfirm.target
    if (!target) return
    const result = await deactivate.mutate(target.id)
    deactivateConfirm.close()
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Attribute group deactivated',
        description: `"${target.name}" has been deactivated.`,
      })
    } else {
      toast({ tone: 'error', title: 'Action failed', description: 'Could not deactivate the attribute group. Try again.' })
    }
  }

  const columns = useAttributeGroupColumns({
    onDeactivate: (group) => deactivateConfirm.open(group),
  })

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Attribute groups"
          description="Manage quiz attribute groups and their options."
          actions={
            <PermissionGuard permission="write">
              <Button asChild>
                <Link to={ROUTES.attributeGroupNew}>
                  <Plus className="size-4" />
                  New attribute group
                </Link>
              </Button>
            </PermissionGuard>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search attribute groups…"
            aria-label="Search attribute groups"
            className="w-full sm:max-w-xs"
          />
          <SelectFilter
            label="Status"
            value={isActiveFilter}
            onChange={(v) => setFilter('isActive', v)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
        </div>

        <DataTable
          columns={columns}
          data={groups}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          getRowId={(row) => row.id}
          emptyTitle="No attribute groups found"
          emptyDescription={
            search || isActiveFilter
              ? 'Try adjusting your search or filters.'
              : 'Create your first attribute group to get started.'
          }
        />

        {!query.isLoading && !query.isError && meta.totalItems > 0 && (
          <DataTablePagination
            meta={meta}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            disabled={query.isFetching}
          />
        )}
      </div>

      <ConfirmDialog
        open={deactivateConfirm.isOpen}
        onOpenChange={deactivateConfirm.setOpen}
        title={`Deactivate "${deactivateConfirm.target?.name}"?`}
        description="This attribute group will be marked inactive. Deactivating may affect quiz configuration, product compatibility, pack compatibility, and recommendations. It can be reactivated later by editing."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
        isPending={deactivate.isPending}
      />
    </PageContainer>
  )
}
