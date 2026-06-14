import { useNavigate } from 'react-router-dom'
import { Edit, Eye, PowerOff } from 'lucide-react'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { AttributeGroupResponse } from '@/lib/api'

interface UseAttributeGroupColumnsOptions {
  onDeactivate: (group: AttributeGroupResponse) => void
}

export function useAttributeGroupColumns({
  onDeactivate,
}: UseAttributeGroupColumnsOptions): ColumnDef<AttributeGroupResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canWrite = can('write')

  return [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          {row.original.code}
        </code>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      id: 'optionCount',
      header: 'Options',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.options?.length ?? 0}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const group = row.original
        const actions = []

        actions.push({
          label: 'View options',
          icon: Eye,
          onSelect: () => navigate(ROUTES.attributeGroup(group.id)),
        })

        if (canWrite) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => navigate(ROUTES.attributeGroupEdit(group.id)),
          })
          actions.push({
            label: 'Deactivate',
            icon: PowerOff,
            destructive: true,
            separatorBefore: true,
            onSelect: () => onDeactivate(group),
          })
        }

        return (
          <RowActions
            actions={actions}
            label={`Actions for ${group.name}`}
          />
        )
      },
    },
  ]
}
