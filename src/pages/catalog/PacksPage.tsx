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
import { usePackArchive, usePackList } from '@/features/packs/hooks/use-packs'
import { usePackColumns } from '@/features/packs/components/PackColumns'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useListQueryState } from '@/shared/hooks/use-list-query-state'
import { useToast } from '@/shared/hooks/use-toast'
import { buildPaginationMeta, DEFAULT_PAGE_SIZE_OPTIONS } from '@/shared/lib/pagination'
import { ROUTES } from '@/config/routes'
import type {
  AdminPacksControllerFindAllPriceMode,
  AdminPacksControllerFindAllSortBy,
  AdminPacksControllerFindAllStatus,
  PackResponse,
} from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
]

const ACTIVE_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

const PRICE_MODE_OPTIONS = [
  { label: 'Fixed', value: 'FIXED' },
  { label: 'Sum items', value: 'SUM_ITEMS' },
  { label: 'Sum items with discount', value: 'SUM_ITEMS_WITH_DISCOUNT' },
]

export function PacksPage() {
  const { toast } = useToast()
  const archive = usePackArchive()
  const archiveConfirm = useConfirmDialog<PackResponse>()

  const {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    filters,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    setSort,
  } = useListQueryState({
    defaultLimit: 20,
    allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
  })

  const statusFilter = filters['status'] ?? null
  const isActiveFilter = filters['isActive'] ?? null
  const priceModeFilter = filters['priceMode'] ?? null

  const query = usePackList({
    page,
    pageSize: limit,
    search: search || undefined,
    status: (statusFilter ?? undefined) as AdminPacksControllerFindAllStatus | undefined,
    isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
    priceMode: (priceModeFilter ?? undefined) as AdminPacksControllerFindAllPriceMode | undefined,
    sortBy: (sortBy ?? undefined) as AdminPacksControllerFindAllSortBy | undefined,
    sortOrder,
  })

  const rawData =
    query.data?.status === 200
      ? (query.data.data as unknown as PaginatedResponse<PackResponse>)
      : null
  const packs = rawData?.data ?? []
  const meta = rawData?.meta
    ? buildPaginationMeta(rawData.meta)
    : buildPaginationMeta({ page, pageSize: limit, totalItems: 0 })

  const handleArchiveConfirm = async () => {
    const target = archiveConfirm.target
    if (!target) return
    const result = await archive.mutate(target.id)
    archiveConfirm.close()
    if (result && result.status === 200) {
      toast({
        tone: 'success',
        title: 'Pack archived',
        description: `"${target.name}" has been removed from public recommendations.`,
      })
    } else {
      toast({ tone: 'error', title: 'Archive failed', description: 'Could not archive the pack.' })
    }
  }

  const columns = usePackColumns({ onArchive: (pack) => archiveConfirm.open(pack) })

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Packs"
          description="Manage curated product bundles, pack items, pricing, and media."
          actions={
            <PermissionGuard permission="write">
              <Button asChild>
                <Link to={ROUTES.packNew}>
                  <Plus className="size-4" />
                  New pack
                </Link>
              </Button>
            </PermissionGuard>
          }
        />

        <div className="flex flex-wrap gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search packs..."
            aria-label="Search packs"
            className="w-full sm:max-w-xs"
          />
          <SelectFilter
            label="Status"
            value={statusFilter}
            onChange={(value) => setFilter('status', value)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <SelectFilter
            label="Active"
            value={isActiveFilter}
            onChange={(value) => setFilter('isActive', value)}
            options={ACTIVE_OPTIONS}
            allLabel="All"
          />
          <SelectFilter
            label="Price mode"
            value={priceModeFilter}
            onChange={(value) => setFilter('priceMode', value)}
            options={PRICE_MODE_OPTIONS}
            allLabel="All modes"
          />
        </div>

        <DataTable
          columns={columns}
          data={packs}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          getRowId={(row) => row.id}
          sort={{ sortBy, sortOrder, onSortChange: setSort }}
          emptyTitle="No packs found"
          emptyDescription={
            search || statusFilter || isActiveFilter || priceModeFilter
              ? 'Try adjusting your search or filters.'
              : 'Create the first curated pack.'
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
        open={archiveConfirm.isOpen}
        onOpenChange={archiveConfirm.setOpen}
        title={`Archive "${archiveConfirm.target?.name}"?`}
        description="This pack will be removed from public recommendations but historical recommendations and orders remain intact. This is not permanent deletion."
        confirmLabel="Archive"
        destructive
        onConfirm={handleArchiveConfirm}
        isPending={archive.isPending}
      />
    </PageContainer>
  )
}
