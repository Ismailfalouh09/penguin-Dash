import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowUpDown } from 'lucide-react'
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
import { useQuizQuestionList, useQuizQuestionDeactivate } from '@/features/quiz/hooks/use-quiz'
import { useQuizQuestionColumns } from '@/features/quiz/components/QuizQuestionColumns'
import { QuizReorderDialog } from '@/features/quiz/components/QuizReorderDialog'
import type { QuizQuestionResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

export function QuizPage() {
  const { toast } = useToast()
  const deactivate = useQuizQuestionDeactivate()
  const deactivateConfirm = useConfirmDialog<QuizQuestionResponse>()
  const [reorderOpen, setReorderOpen] = useState(false)

  const { page, limit, search, filters, setPage, setLimit, setSearch, setFilter } =
    useListQueryState({ defaultLimit: 20, allowedLimits: DEFAULT_PAGE_SIZE_OPTIONS })

  const isActiveFilter = filters['isActive'] ?? null

  const query = useQuizQuestionList({
    page,
    pageSize: limit,
    search: search || undefined,
    isActive: isActiveFilter === 'true' ? true : isActiveFilter === 'false' ? false : undefined,
    sortBy: 'stepOrder',
    sortOrder: 'asc',
  })

  const rawData = query.data?.status === 200
    ? (query.data.data as unknown as PaginatedResponse<QuizQuestionResponse>)
    : null

  const questions = rawData?.data ?? []
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
        title: 'Question deactivated',
        description: 'The quiz question has been deactivated.',
      })
    } else {
      toast({ tone: 'error', title: 'Action failed', description: 'Could not deactivate the question. Try again.' })
    }
  }

  const columns = useQuizQuestionColumns({
    onDeactivate: (question) => deactivateConfirm.open(question),
  })

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Quiz questions"
          description="Manage the ordered set of questions customers answer to receive recommendations."
          actions={
            <div className="flex gap-2">
              <PermissionGuard permission="write">
                <Button
                  variant="outline"
                  onClick={() => setReorderOpen(true)}
                  disabled={questions.length === 0}
                  aria-label="Reorder quiz questions"
                >
                  <ArrowUpDown className="mr-2 size-4" />
                  Reorder
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="write">
                <Button asChild>
                  <Link to={ROUTES.quizQuestionNew}>
                    <Plus className="size-4" />
                    New question
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
            placeholder="Search questions…"
            aria-label="Search quiz questions"
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
          data={questions}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          getRowId={(row) => row.id}
          emptyTitle="No quiz questions found"
          emptyDescription={
            search || isActiveFilter
              ? 'Try adjusting your search or filters.'
              : 'Create your first quiz question to get started.'
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
        title="Deactivate quiz question?"
        description="This question will be marked inactive and removed from the active quiz flow. It can be reactivated later by editing."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
        isPending={deactivate.isPending}
      />

      {reorderOpen && (
        <QuizReorderDialog
          open={reorderOpen}
          onOpenChange={setReorderOpen}
          questions={questions}
        />
      )}
    </PageContainer>
  )
}
