import { Edit, PowerOff } from 'lucide-react'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { AttributeOptionResponse } from '@/lib/api'

interface UseAttributeOptionColumnsOptions {
  onEdit: (option: AttributeOptionResponse) => void
  onDeactivate: (option: AttributeOptionResponse) => void
}

export function useAttributeOptionColumns({
  onEdit,
  onDeactivate,
}: UseAttributeOptionColumnsOptions): ColumnDef<AttributeOptionResponse, unknown>[] {
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
      accessorKey: 'label',
      header: 'Label',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.label}</div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const option = row.original
        const actions = []

        if (canWrite) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => onEdit(option),
          })
          actions.push({
            label: 'Deactivate',
            icon: PowerOff,
            destructive: true,
            separatorBefore: true,
            onSelect: () => onDeactivate(option),
          })
        }

        return (
          <RowActions
            actions={actions}
            label={`Actions for ${option.label}`}
          />
        )
      },
    },
  ]
}
