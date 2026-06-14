import { useNavigate } from 'react-router-dom'
import { Edit, PowerOff, ImageIcon } from 'lucide-react'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { AdminCategoryResponse } from '@/lib/api'

interface UseCategoryColumnsOptions {
  onDeactivate: (category: AdminCategoryResponse) => void
}

export function useCategoryColumns({ onDeactivate }: UseCategoryColumnsOptions): ColumnDef<AdminCategoryResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canWrite = can('write')

  return [
    {
      id: 'image',
      header: '',
      cell: ({ row }) => {
        const image = row.original.image
        return (
          <div className="size-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
            {image ? (
              <img
                src={image.urls.thumbnail}
                alt={row.original.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
          {row.original.code}
        </code>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge tone={row.original.isActive ? 'success' : 'neutral'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const category = row.original
        const actions = []

        if (canWrite) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => navigate(ROUTES.categoryEdit(category.id)),
          })
          if (category.isActive) {
            actions.push({
              label: 'Deactivate',
              icon: PowerOff,
              destructive: true,
              separatorBefore: true,
              onSelect: () => onDeactivate(category),
            })
          }
        }

        return (
          <RowActions
            actions={actions}
            label={`Actions for ${category.name}`}
          />
        )
      },
    },
  ]
}
