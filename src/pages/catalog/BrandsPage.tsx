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
import { useBrandList, useBrandDeactivate } from '@/features/brands/hooks/use-brands'
import { useBrandColumns } from '@/features/brands/components/BrandColumns'
import type { AdminBrandResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

export function BrandsPage() {
  const { toast } = useToast()
  const deactivate = useBrandDeactivate()
  const deactivateConfirm = useConfirmDialog<AdminBrandResponse>()

  const { page, limit, search, filters, setPage, setLimit, setSearch, setFilter } =
    useListQueryState({ defaultLimit: 20, allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS })

  const isActiveFilter = filters['isActive'] ?? null

  const query = useBrandList({
    page,
    pageSize: limit,
    search: search || undefined,
    isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
  })

  const rawData = query.data?.status === 200
    ? (query.data.data as unknown as PaginatedResponse<AdminBrandResponse>)
    : null

  const brands = rawData?.data ?? []
  const meta = rawData?.meta
    ? buildPaginationMeta(rawData.meta)
    : buildPaginationMeta({ page, pageSize: limit, totalItems: 0 })

  const handleDeactivateConfirm = async () => {
    const target = deactivateConfirm.target
    if (!target) return
    const result = await deactivate.mutate(target.id)
    deactivateConfirm.close()
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Brand deactivated', description: `"${target.name}" has been deactivated.` })
    } else {
      toast({ tone: 'error', title: 'Action failed', description: 'Could not deactivate the brand. Try again.' })
    }
  }

  const columns = useBrandColumns({
    onDeactivate: (brand) => deactivateConfirm.open(brand),
  })

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Brands"
          description="Manage the brands products belong to."
          actions={
            <PermissionGuard permission="write">
              <Button asChild>
                <Link to={ROUTES.brandNew}>
                  <Plus className="size-4" />
                  New brand
                </Link>
              </Button>
            </PermissionGuard>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search brands…"
            aria-label="Search brands"
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
          data={brands}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          getRowId={(row) => row.id}
          emptyTitle="No brands found"
          emptyDescription={search || isActiveFilter ? 'Try adjusting your search or filters.' : 'Create your first brand to get started.'}
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
        description="This brand will be marked inactive. It can be reactivated later by editing."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
        isPending={deactivate.isPending}
      />
    </PageContainer>
  )
}
