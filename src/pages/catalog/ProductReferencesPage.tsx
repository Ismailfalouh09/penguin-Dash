import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { DataTable } from '@/shared/components/data-table/DataTable'
import { DataTablePagination } from '@/shared/components/data-table/DataTablePagination'
import { SearchInput } from '@/shared/components/data-table/SearchInput'
import { SelectFilter } from '@/shared/components/data-table/SelectFilter'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'
import { StockUpdateDialog } from '@/features/product-references/components/StockUpdateDialog'
import { useReferenceColumns } from '@/features/product-references/components/ReferenceColumns'
import {
  useReferenceList,
  useReferenceDeactivate,
} from '@/features/product-references/hooks/use-product-references'
import { useProductDetail } from '@/features/products/hooks/use-products'
import { useListQueryState } from '@/shared/hooks/use-list-query-state'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import { buildPaginationMeta, DEFAULT_PAGE_SIZE_OPTIONS } from '@/shared/lib/pagination'
import { ROUTES } from '@/config/routes'
import type { ProductReferenceResponse, ProductResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'
import { useState } from 'react'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

const STOCK_OPTIONS = [
  { label: 'In stock', value: 'true' },
  { label: 'Out of stock', value: 'false' },
]

export function ProductReferencesPage() {
  const { productId } = useParams<{ productId: string }>()
  const { toast } = useToast()

  const deactivate = useReferenceDeactivate(productId ?? '')
  const deactivateConfirm = useConfirmDialog<ProductReferenceResponse>()
  const [stockTarget, setStockTarget] = useState<ProductReferenceResponse | null>(null)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)

  const { page, limit, search, filters, setPage, setLimit, setSearch, setFilter } =
    useListQueryState({ defaultLimit: 20, allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS })

  const isActiveFilter = filters['isActive'] ?? null
  const inStockFilter = filters['inStock'] ?? null

  const productQuery = useProductDetail(productId ?? '')
  const product =
    productQuery.data?.status === 200
      ? (productQuery.data.data as unknown as ProductResponse)
      : null

  const listQuery = useReferenceList(productId ?? '', {
    page,
    pageSize: limit,
    search: search || undefined,
    isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
    inStock: inStockFilter === 'true' ? true : inStockFilter === 'false' ? false : undefined,
  })

  const rawData =
    listQuery.data?.status === 200
      ? (listQuery.data.data as unknown as PaginatedResponse<ProductReferenceResponse>)
      : null

  const references = rawData?.data ?? []
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
        title: 'Reference deactivated',
        description: `"${target.referenceName}" has been deactivated.`,
      })
    } else {
      toast({ tone: 'error', title: 'Action failed', description: 'Could not deactivate the reference.' })
    }
  }

  const columns = useReferenceColumns({
    onDeactivate: (ref) => deactivateConfirm.open(ref),
    onUpdateStock: (ref) => {
      setStockTarget(ref)
      setStockDialogOpen(true)
    },
  })

  if (productQuery.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading product…" />
      </PageContainer>
    )
  }

  if (productQuery.isError || !product) {
    return (
      <PageContainer>
        <ErrorState
          message="Could not load product details."
          onRetry={() => productQuery.refetch()}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={`References: ${product.name}`}
          description="Manage purchasable variants (references) for this product."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to={ROUTES.product(product.id)}>
                  <ArrowLeft className="size-4" />
                  Back to product
                </Link>
              </Button>
              <PermissionGuard permission="write">
                <Button asChild>
                  <Link to={ROUTES.productReferenceNew(product.id)}>
                    <Plus className="size-4" />
                    New reference
                  </Link>
                </Button>
              </PermissionGuard>
            </div>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search references…"
            aria-label="Search references"
            className="w-full sm:max-w-xs"
          />
          <SelectFilter
            label="Status"
            value={isActiveFilter}
            onChange={(v) => setFilter('isActive', v)}
            options={STATUS_OPTIONS}
            allLabel="All statuses"
          />
          <SelectFilter
            label="Stock"
            value={inStockFilter}
            onChange={(v) => setFilter('inStock', v)}
            options={STOCK_OPTIONS}
            allLabel="All stock"
          />
        </div>

        <DataTable
          columns={columns}
          data={references}
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
          onRetry={() => listQuery.refetch()}
          getRowId={(row) => row.id}
          emptyTitle="No references found"
          emptyDescription={
            search || isActiveFilter || inStockFilter
              ? 'Try adjusting your search or filters.'
              : 'Create the first reference for this product.'
          }
        />

        {!listQuery.isLoading && !listQuery.isError && meta.totalItems > 0 && (
          <DataTablePagination
            meta={meta}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            disabled={listQuery.isFetching}
          />
        )}
      </div>

      <ConfirmDialog
        open={deactivateConfirm.isOpen}
        onOpenChange={deactivateConfirm.setOpen}
        title={`Deactivate "${deactivateConfirm.target?.referenceName}"?`}
        description="This reference will be marked inactive. It will no longer be available for purchase. You can reactivate it later by editing the reference."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
        isPending={deactivate.isPending}
      />

      <StockUpdateDialog
        reference={stockTarget}
        productId={productId ?? ''}
        open={stockDialogOpen}
        onOpenChange={(open) => {
          setStockDialogOpen(open)
          if (!open) setStockTarget(null)
        }}
      />
    </PageContainer>
  )
}
