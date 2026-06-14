import { useNavigate } from 'react-router-dom'
import { Edit, PowerOff } from 'lucide-react'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { AdminBrandResponse } from '@/lib/api'

interface UseBrandColumnsOptions {
  onDeactivate: (brand: AdminBrandResponse) => void
}

export function useBrandColumns({ onDeactivate }: UseBrandColumnsOptions): ColumnDef<AdminBrandResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canWrite = can('write')

  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
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
        const brand = row.original
        const actions = []

        if (canWrite) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => navigate(ROUTES.brandEdit(brand.id)),
          })
          if (brand.isActive) {
            actions.push({
              label: 'Deactivate',
              icon: PowerOff,
              destructive: true,
              separatorBefore: true,
              onSelect: () => onDeactivate(brand),
            })
          }
        }

        return (
          <RowActions
            actions={actions}
            label={`Actions for ${brand.name}`}
          />
        )
      },
    },
  ]
}
