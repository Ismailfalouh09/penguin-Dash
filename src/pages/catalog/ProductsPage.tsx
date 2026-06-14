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
import { useProductList, useProductArchive } from '@/features/products/hooks/use-products'
import { useProductColumns } from '@/features/products/components/ProductColumns'
import type { ProductResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'
import type { AdminProductsControllerFindAllStatus, AdminProductsControllerFindAllSortBy } from '@/lib/api'

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
]

const ACTIVE_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

export function ProductsPage() {
  const { toast } = useToast()
  const archive = useProductArchive()
  const archiveConfirm = useConfirmDialog<ProductResponse>()

  const { page, limit, search, sortBy, sortOrder, filters, setPage, setLimit, setSearch, setFilter } =
    useListQueryState({
      defaultLimit: 20,
      allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS,
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
    })

  const statusFilter = filters['status'] ?? null
  const isActiveFilter = filters['isActive'] ?? null

  const query = useProductList({
    page,
    pageSize: limit,
    search: search || undefined,
    status: statusFilter as AdminProductsControllerFindAllStatus | undefined,
    isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
    sortBy: (sortBy ?? undefined) as AdminProductsControllerFindAllSortBy | undefined,
    sortOrder: (sortOrder ?? undefined) as 'asc' | 'desc' | undefined,
  })

  const rawData = query.data?.status === 200
    ? (query.data.data as unknown as PaginatedResponse<ProductResponse>)
    : null

  const products = rawData?.data ?? []
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
        title: 'Product archived',
        description: `"${target.name}" has been archived. All its references have been deactivated.`,
      })
    } else {
      toast({ tone: 'error', title: 'Archive failed', description: 'Could not archive the product. Try again.' })
    }
  }

  const columns = useProductColumns({
    onArchive: (product) => archiveConfirm.open(product),
  })

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Products"
          description="Manage your catalog products, images, and references."
          actions={
            <PermissionGuard permission="write">
              <Button asChild>
                <Link to={ROUTES.productNew}>
                  <Plus className="size-4" />
                  New product
                </Link>
              </Button>
            </PermissionGuard>
          }
        />

        <div className="flex flex-wrap gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full sm:max-w-xs"
          />
          <SelectFilter
            label="Status"
            value={statusFilter}
            onChange={(v) => setFilter('status', v)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <SelectFilter
            label="Active"
            value={isActiveFilter}
            onChange={(v) => setFilter('isActive', v)}
            options={ACTIVE_OPTIONS}
            allLabel="All"
          />
        </div>

        <DataTable
          columns={columns}
          data={products}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          getRowId={(row) => row.id}
          emptyTitle="No products found"
          emptyDescription={
            search || statusFilter || isActiveFilter
              ? 'Try adjusting your search or filters.'
              : 'Create your first product to get started.'
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
        description="This product will be archived and all its references will be deactivated. Archived products can be found by filtering for 'Archived' status."
        confirmLabel="Archive"
        destructive
        onConfirm={handleArchiveConfirm}
        isPending={archive.isPending}
      />
    </PageContainer>
  )
}
