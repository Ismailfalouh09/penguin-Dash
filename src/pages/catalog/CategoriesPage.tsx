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
import { useCategoryList, useCategoryDeactivate } from '@/features/categories/hooks/use-categories'
import { useCategoryColumns } from '@/features/categories/components/CategoryColumns'
import type { AdminCategoryResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

export function CategoriesPage() {
  const { toast } = useToast()
  const deactivate = useCategoryDeactivate()
  const deactivateConfirm = useConfirmDialog<AdminCategoryResponse>()

  const { page, limit, search, filters, setPage, setLimit, setSearch, setFilter } =
    useListQueryState({ defaultLimit: 20, allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS })

  const isActiveFilter = filters['isActive'] ?? null

  const query = useCategoryList({
    page,
    pageSize: limit,
    search: search || undefined,
    isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
  })

  const rawData = query.data?.status === 200
    ? (query.data.data as unknown as PaginatedResponse<AdminCategoryResponse>)
    : null

  const categories = rawData?.data ?? []
  const meta = rawData?.meta
    ? buildPaginationMeta(rawData.meta)
    : buildPaginationMeta({ page, pageSize: limit, totalItems: 0 })

  const handleDeactivateConfirm = async () => {
    const target = deactivateConfirm.target
    if (!target) return
    const result = await deactivate.mutate(target.id)
    deactivateConfirm.close()
    if (result && result.status === 200) {
      toast({ tone: 'success', title: 'Category deactivated', description: `"${target.name}" has been deactivated.` })
    } else {
      toast({ tone: 'error', title: 'Action failed', description: 'Could not deactivate the category. Try again.' })
    }
  }

  const columns = useCategoryColumns({
    onDeactivate: (cat) => deactivateConfirm.open(cat),
  })

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Categories"
          description="Organize products into browsable categories."
          actions={
            <PermissionGuard permission="write">
              <Button asChild>
                <Link to={ROUTES.categoryNew}>
                  <Plus className="size-4" />
                  New category
                </Link>
              </Button>
            </PermissionGuard>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search categories…"
            aria-label="Search categories"
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
          data={categories}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          getRowId={(row) => row.id}
          emptyTitle="No categories found"
          emptyDescription={search || isActiveFilter ? 'Try adjusting your search or filters.' : 'Create your first category to get started.'}
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
        description="This category will be marked inactive. It can be reactivated later by editing."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
        isPending={deactivate.isPending}
      />
    </PageContainer>
  )
}
