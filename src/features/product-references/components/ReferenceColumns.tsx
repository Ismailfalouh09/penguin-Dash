import { useNavigate } from 'react-router-dom'
import { Edit, PowerOff, Package, BarChart2 } from 'lucide-react'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { ProductReferenceResponse } from '@/lib/api'

interface UseReferenceColumnsOptions {
  onDeactivate: (ref: ProductReferenceResponse) => void
  onUpdateStock: (ref: ProductReferenceResponse) => void
}

export function useReferenceColumns({
  onDeactivate,
  onUpdateStock,
}: UseReferenceColumnsOptions): ColumnDef<ProductReferenceResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canWrite = can('write')
  const canMedia = can('media:manage')

  return [
    {
      accessorKey: 'image',
      header: 'Swatch',
      cell: ({ row }) => {
        const image = row.original.image
        if (!image) {
          return (
            <div className="flex size-10 items-center justify-center rounded border border-border bg-muted">
              <Package className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
          )
        }
        return (
          <img
            src={image.urls.swatch ?? image.urls.thumbnail}
            alt={typeof image.altText === 'string' ? image.altText : `Swatch for ${row.original.referenceName}`}
            className="size-10 rounded border border-border object-cover"
          />
        )
      },
    },
    {
      accessorKey: 'referenceCode',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.referenceCode}</span>
      ),
    },
    {
      accessorKey: 'referenceName',
      header: 'Name / Shade',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.referenceName}</div>
      ),
    },
    {
      accessorKey: 'priceDelta',
      header: 'Price delta',
      cell: ({ row }) => {
        const delta = row.original.priceDelta
        if (delta === 0) return <span className="text-muted-foreground">—</span>
        return (
          <span className={delta > 0 ? 'text-success' : 'text-destructive'}>
            {delta > 0 ? '+' : ''}{delta.toFixed(2)}
          </span>
        )
      },
    },
    {
      accessorKey: 'stockQuantity',
      header: 'Stock',
      cell: ({ row }) => {
        const { stockQuantity, reservedQuantity } = row.original
        const available = stockQuantity - reservedQuantity
        return (
          <div className="flex flex-col gap-0.5">
            <span className={available <= 0 ? 'text-destructive font-medium' : ''}>{stockQuantity}</span>
            {reservedQuantity > 0 && (
              <span className="text-xs text-muted-foreground">{reservedQuantity} reserved</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge tone={row.original.isActive ? 'success' : 'neutral'} withDot>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const ref = row.original
        const actions = []

        actions.push({
          label: 'View details',
          icon: Package,
          onSelect: () => navigate(ROUTES.productReference(ref.id)),
        })

        if (canWrite || canMedia) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => navigate(ROUTES.productReferenceEdit(ref.id)),
          })
        }

        if (canWrite) {
          actions.push({
            label: 'Update stock',
            icon: BarChart2,
            separatorBefore: true,
            onSelect: () => onUpdateStock(ref),
          })

          if (ref.isActive) {
            actions.push({
              label: 'Deactivate',
              icon: PowerOff,
              destructive: true,
              separatorBefore: true,
              onSelect: () => onDeactivate(ref),
            })
          }
        }

        return (
          <RowActions
            actions={actions}
            label={`Actions for ${ref.referenceName}`}
          />
        )
      },
    },
  ]
}
