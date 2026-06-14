import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatusBadge,
  type StatusTone,
} from '@/shared/components/common'
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  RowActions,
  SearchInput,
  SelectFilter,
  selectionColumn,
  type ColumnDef,
} from '@/shared/components/data-table'
import {
  Form,
  FormActions,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormLayout,
  FormMessage,
  FormSection,
} from '@/shared/components/forms'
import { DeleteConfirmDialog } from '@/shared/components/feedback'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useListQueryState } from '@/shared/hooks/use-list-query-state'
import { useConfirmDialog } from '@/shared/hooks/use-confirm-dialog'
import { useToast } from '@/shared/hooks/use-toast'
import { buildPaginationMeta } from '@/shared/lib/pagination'

/**
 * Non-business demonstration of the Task 5A shared operational components.
 *
 * Everything here runs against clearly-labeled STATIC sample data — no backend
 * business APIs are called. It exists to exercise the table, pagination, search,
 * sorting, filters, empty state, confirmation dialog, toast and form layout in
 * one place. Not part of the production navigation.
 */

interface DemoWidget {
  id: string
  name: string
  category: 'Serum' | 'Cream' | 'Mask'
  status: 'active' | 'draft' | 'archived'
  price: number
}

const STATUS_TONE: Record<DemoWidget['status'], StatusTone> = {
  active: 'success',
  draft: 'warning',
  archived: 'neutral',
}

// --- Static sample data (NOT production data) -------------------------------
const CATEGORIES = ['Serum', 'Cream', 'Mask'] as const
const STATUSES = ['active', 'draft', 'archived'] as const

const SAMPLE_DATA: DemoWidget[] = Array.from({ length: 47 }, (_, i) => ({
  id: `widget-${i + 1}`,
  name: `Sample product ${i + 1}`,
  category: CATEGORIES[i % CATEGORIES.length]!,
  status: STATUSES[i % STATUSES.length]!,
  price: 10 + ((i * 7) % 90),
}))

export function ComponentsDemoPage() {
  const list = useListQueryState({ defaultSortBy: 'name', defaultSortOrder: 'asc' })
  const { toast } = useToast()
  const deleteDialog = useConfirmDialog<DemoWidget>()
  const [rowSelection, setRowSelection] = useState({})

  // Client-side filtering/sorting/paging over the static data — stands in for
  // what a real backend list endpoint would return.
  const filtered = useMemo(() => {
    let rows = [...SAMPLE_DATA]
    if (list.search) {
      const q = list.search.toLowerCase()
      rows = rows.filter((r) => r.name.toLowerCase().includes(q))
    }
    const statusFilter = list.filters.status
    if (statusFilter) {
      rows = rows.filter((r) => r.status === statusFilter)
    }
    if (list.sortBy) {
      const dir = list.sortOrder === 'asc' ? 1 : -1
      rows.sort((a, b) => {
        const av = a[list.sortBy as keyof DemoWidget]
        const bv = b[list.sortBy as keyof DemoWidget]
        return av < bv ? -dir : av > bv ? dir : 0
      })
    }
    return rows
  }, [list.search, list.filters.status, list.sortBy, list.sortOrder])

  const meta = buildPaginationMeta({
    page: list.page,
    pageSize: list.limit,
    totalItems: filtered.length,
  })
  const pageRows = filtered.slice((list.page - 1) * list.limit, list.page * list.limit)

  const columns = useMemo<ColumnDef<DemoWidget, unknown>[]>(
    () => [
      selectionColumn<DemoWidget>(),
      { id: 'name', accessorKey: 'name', header: 'Name', enableSorting: true },
      { id: 'category', accessorKey: 'category', header: 'Category', enableSorting: true },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status
          return <StatusBadge tone={STATUS_TONE[status]}>{status}</StatusBadge>
        },
      },
      {
        id: 'price',
        accessorKey: 'price',
        header: 'Price',
        enableSorting: true,
        cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              label={`Actions for ${row.original.name}`}
              actions={[
                {
                  label: 'Edit',
                  icon: Pencil,
                  onSelect: () =>
                    toast({ tone: 'info', title: 'Edit', description: row.original.name }),
                },
                {
                  label: 'Delete',
                  icon: Trash2,
                  destructive: true,
                  separatorBefore: true,
                  onSelect: () => deleteDialog.open(row.original),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [toast, deleteDialog]
  )

  const selectedCount = Object.keys(rowSelection).length

  return (
    <PageContainer>
      <PageHeader
        title="Shared components demo"
        description="Static demonstration of the reusable list, form and feedback components. No backend data."
        actions={
          <Button
            onClick={() =>
              toast({ tone: 'success', title: 'Created', description: 'Sample item created.' })
            }
          >
            <Plus className="size-4" aria-hidden="true" />
            New item
          </Button>
        }
      />

      <div className="mt-6 space-y-8">
        <SectionCard
          title="Data table"
          description="Server-style table with search, status filter, sorting, selection, row actions and pagination."
        >
          <div className="space-y-4">
            <DataTableToolbar
              hasActiveFilters={list.hasActiveFilters}
              onClearFilters={list.clearFilters}
              search={
                <SearchInput
                  value={list.search}
                  onChange={list.setSearch}
                  placeholder="Search products…"
                  className="w-full sm:w-64"
                />
              }
              filters={
                <SelectFilter
                  label="Status"
                  value={list.filters.status ?? null}
                  onChange={(value) => list.setFilter('status', value)}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Draft', value: 'draft' },
                    { label: 'Archived', value: 'archived' },
                  ]}
                  allLabel="All statuses"
                />
              }
            />

            {selectedCount > 0 && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {selectedCount} selected
              </p>
            )}

            <DataTable
              columns={columns}
              data={pageRows}
              getRowId={(row) => row.id}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              sort={{
                sortBy: list.sortBy,
                sortOrder: list.sortOrder,
                onSortChange: list.setSort,
              }}
              emptyTitle="No products match"
              emptyDescription="Try clearing the search or status filter."
            />

            <DataTablePagination
              meta={meta}
              onPageChange={list.setPage}
              onPageSizeChange={list.setLimit}
            />
          </div>
        </SectionCard>

        <DemoForm />
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.setOpen}
        itemName={deleteDialog.target?.name}
        onConfirm={() => {
          toast({
            tone: 'success',
            title: 'Deleted',
            description: `${deleteDialog.target?.name ?? 'Item'} removed (demo only).`,
          })
          deleteDialog.close()
        }}
      />
    </PageContainer>
  )
}

// --- Demo form --------------------------------------------------------------
const demoFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Choose a category'),
})

type DemoFormValues = z.infer<typeof demoFormSchema>

function DemoForm() {
  const { toast } = useToast()
  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: { name: '', category: '' },
  })

  const onSubmit = (values: DemoFormValues) => {
    toast({ tone: 'success', title: 'Saved', description: `${values.name} (${values.category})` })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormLayout>
          <FormSection
            title="Form layout"
            description="Reusable form section, field error display, required indication and submit/cancel actions."
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Category</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Serum">Serum</SelectItem>
                        <SelectItem value="Cream">Cream</SelectItem>
                        <SelectItem value="Mask">Mask</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <FormActions
            submitLabel="Save item"
            onCancel={() => form.reset()}
            isSubmitting={form.formState.isSubmitting}
          />
        </FormLayout>
      </form>
    </Form>
  )
}
