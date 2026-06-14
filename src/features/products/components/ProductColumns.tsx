import { useNavigate } from 'react-router-dom'
import { Edit, Archive, Eye, ImageIcon, Package } from 'lucide-react'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { ProductResponse } from '@/lib/api'
import type { StatusTone } from '@/shared/components/common/StatusBadge'

const STATUS_TONE: Record<string, StatusTone> = {
  ACTIVE: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'neutral',
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
}

interface UseProductColumnsOptions {
  onArchive: (product: ProductResponse) => void
}

export function useProductColumns({
  onArchive,
}: UseProductColumnsOptions): ColumnDef<ProductResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canWrite = can('write')

  return [
    {
      id: 'cover',
      header: '',
      cell: ({ row }) => {
        const cover = row.original.coverImage
        return (
          <div className="size-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
            {cover ? (
              <img
                src={cover.urls.thumbnail}
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
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.slug}</div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="text-sm">{row.original.category?.name ?? '—'}</span>,
    },
    {
      id: 'brand',
      header: 'Brand',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.brand?.name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'basePrice',
      header: 'Price',
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.original.basePrice.toFixed(2)} {row.original.currency}
        </span>
      ),
    },
    {
      id: 'references',
      header: 'Refs',
      cell: ({ row }) => {
        const count = row.original.references?.length ?? 0
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Package className="size-3.5" aria-hidden="true" />
            {count}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status
        return <StatusBadge tone={STATUS_TONE[s] ?? 'neutral'}>{STATUS_LABEL[s] ?? s}</StatusBadge>
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const product = row.original
        const actions = [
          {
            label: 'View',
            icon: Eye,
            onSelect: () => navigate(ROUTES.product(product.id)),
          },
        ]

        if (canWrite) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => navigate(ROUTES.productEdit(product.id)),
          })
          if (product.status !== 'ARCHIVED') {
            actions.push({
              label: 'Archive',
              icon: Archive,
              destructive: true,
              separatorBefore: true,
              onSelect: () => onArchive(product),
            } as (typeof actions)[0])
          }
        }

        return <RowActions actions={actions} label={`Actions for ${product.name}`} />
      },
    },
  ]
}
