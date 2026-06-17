import { Link } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
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
import {
  useRecommendationRuleList,
  useRecommendationRuleDeactivate,
} from '@/features/recommendation-rules/hooks/use-recommendation-rules'
import { useRecommendationRuleColumns } from '@/features/recommendation-rules/components/RecommendationRuleColumns'
import type { RecommendationRuleResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

const TARGET_TYPE_OPTIONS = [
  { label: 'Pack', value: 'PACK' },
  { label: 'Product', value: 'PRODUCT' },
  { label: 'Reference', value: 'REFERENCE' },
]

const CONDITION_TYPE_OPTIONS = [
  { label: 'Must match', value: 'MUST_MATCH' },
  { label: 'Should match', value: 'SHOULD_MATCH' },
  { label: 'Exclude if match', value: 'EXCLUDE_IF_MATCH' },
]

export function RecommendationRulesPage() {
  const { toast } = useToast()
  const deactivate = useRecommendationRuleDeactivate()
  const deactivateConfirm = useConfirmDialog<RecommendationRuleResponse>()

  const { page, limit, search, filters, setPage, setLimit, setSearch, setFilter } =
    useListQueryState({ defaultLimit: 20, allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS })

  const isActiveFilter = filters['isActive'] ?? null
  const targetTypeFilter = filters['targetType'] ?? null
  const conditionTypeFilter = filters['conditionType'] ?? null

  const query = useRecommendationRuleList({
    page,
    pageSize: limit,
    search: search || undefined,
    isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
    targetType: (targetTypeFilter as 'PACK' | 'PRODUCT' | 'REFERENCE' | null) ?? undefined,
    conditionType: (conditionTypeFilter as 'MUST_MATCH' | 'SHOULD_MATCH' | 'EXCLUDE_IF_MATCH' | null) ?? undefined,
  })

  const rawData =
    query.data?.status === 200
      ? (query.data.data as unknown as PaginatedResponse<RecommendationRuleResponse>)
      : null

  const rules = rawData?.data ?? []
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
        title: 'Rule deactivated',
        description: `"${target.name}" has been deactivated. Future recommendation previews and results will not use this rule.`,
      })
    } else {
      toast({ tone: 'error', title: 'Action failed', description: 'Could not deactivate the rule. Try again.' })
    }
  }

  const columns = useRecommendationRuleColumns({
    onDeactivate: (rule) => deactivateConfirm.open(rule),
  })

  const hasFilters = Boolean(search || isActiveFilter || targetTypeFilter || conditionTypeFilter)

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Recommendation rules"
          description="Define how the recommendation engine scores packs for customers. Rule changes affect future previews and results."
          actions={
            <div className="flex gap-2">
              <PermissionGuard permission="recommendations:preview">
                <Button asChild variant="outline">
                  <Link to={ROUTES.recommendationRulePreview}>
                    <Eye className="size-4" />
                    Preview
                  </Link>
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="write">
                <Button asChild>
                  <Link to={ROUTES.recommendationRuleNew}>
                    <Plus className="size-4" />
                    New rule
                  </Link>
                </Button>
              </PermissionGuard>
            </div>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search rules…"
            aria-label="Search recommendation rules"
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
            label="Target"
            value={targetTypeFilter}
            onChange={(v) => setFilter('targetType', v)}
            options={TARGET_TYPE_OPTIONS}
            allLabel="All targets"
          />
          <SelectFilter
            label="Condition"
            value={conditionTypeFilter}
            onChange={(v) => setFilter('conditionType', v)}
            options={CONDITION_TYPE_OPTIONS}
            allLabel="All conditions"
          />
        </div>

        <DataTable
          columns={columns}
          data={rules}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          getRowId={(row) => row.id}
          emptyTitle="No recommendation rules found"
          emptyDescription={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Create your first rule to start configuring the recommendation engine.'
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
        description="This rule will be marked inactive. Future recommendation previews and results will not use it. Deactivating does not affect previously stored recommendation results. The rule can be reactivated later."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
        isPending={deactivate.isPending}
      />
    </PageContainer>
  )
}
