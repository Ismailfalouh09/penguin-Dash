import { useNavigate } from 'react-router-dom'
import { Edit, Image as ImageIcon, Package, Trash2 } from 'lucide-react'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { RowActions, type RowAction } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { PackResponse } from '@/lib/api'

interface UsePackColumnsOptions {
  onArchive: (pack: PackResponse) => void
}

function statusTone(status: PackResponse['status']) {
  if (status === 'ACTIVE') return 'success'
  if (status === 'DRAFT') return 'warning'
  return 'neutral'
}

function formatPrice(pack: PackResponse) {
  if (pack.priceMode !== 'FIXED') return pack.priceMode.split('_').join(' ')
  const fixedPrice = pack.fixedPrice as unknown
  return typeof fixedPrice === 'number' ? `${fixedPrice.toFixed(2)}` : 'Fixed price'
}

export function usePackColumns({
  onArchive,
}: UsePackColumnsOptions): ColumnDef<PackResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canWrite = can('write')

  return [
    {
      id: 'cover',
      header: 'Cover',
      cell: ({ row }) => {
        const cover = row.original.coverImage
        if (!cover) {
          return (
            <div className="flex size-12 items-center justify-center rounded-md border border-border bg-muted">
              <ImageIcon className="size-5 text-muted-foreground" aria-hidden="true" />
            </div>
          )
        }
        return (
          <img
            src={cover.urls.thumbnail ?? cover.urls.card}
            alt={
              typeof cover.altText === 'string' ? cover.altText : `Cover for ${row.original.name}`
            }
            className="size-12 rounded-md border border-border object-cover"
          />
        )
      },
    },
    {
      accessorKey: 'name',
      id: 'name',
      header: 'Name',
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="font-mono text-xs text-muted-foreground">{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: 'priceMode',
      id: 'fixedPrice',
      header: 'Price',
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{formatPrice(row.original)}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.priceMode.split('_').join(' ')}
          </div>
        </div>
      ),
    },
    {
      id: 'items',
      header: 'Items',
      cell: ({ row }) => <span>{row.original.items?.length ?? 0}</span>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <StatusBadge tone={statusTone(row.original.status)} withDot>
            {row.original.status}
          </StatusBadge>
          {!row.original.isActive && (
            <span className="text-xs text-muted-foreground">Inactive</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const pack = row.original
        const actions: RowAction[] = [
          {
            label: 'View details',
            icon: Package,
            onSelect: () => navigate(ROUTES.pack(pack.id)),
          },
        ]

        if (canWrite) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => navigate(ROUTES.packEdit(pack.id)),
          })

          if (pack.status !== 'ARCHIVED') {
            actions.push({
              label: 'Archive',
              icon: Trash2,
              destructive: true,
              separatorBefore: true,
              onSelect: () => onArchive(pack),
            })
          }
        }

        return <RowActions actions={actions} label={`Actions for ${pack.name}`} />
      },
    },
  ]
}
