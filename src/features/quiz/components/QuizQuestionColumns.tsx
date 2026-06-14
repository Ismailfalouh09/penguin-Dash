import { useNavigate } from 'react-router-dom'
import { Edit, PowerOff } from 'lucide-react'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { QuizQuestionResponse } from '@/lib/api'

interface UseQuizQuestionColumnsOptions {
  onDeactivate: (question: QuizQuestionResponse) => void
}

export function useQuizQuestionColumns({
  onDeactivate,
}: UseQuizQuestionColumnsOptions): ColumnDef<QuizQuestionResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canWrite = can('write')

  return [
    {
      accessorKey: 'stepOrder',
      header: '#',
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">{row.original.stepOrder}</span>
      ),
    },
    {
      accessorKey: 'questionText',
      header: 'Question',
      cell: ({ row }) => (
        <div className="max-w-xs font-medium">{row.original.questionText}</div>
      ),
    },
    {
      id: 'attributeGroup',
      header: 'Attribute group',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.attributeGroup?.name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'selectionType',
      header: 'Selection',
      cell: ({ row }) => (
        <StatusBadge tone={row.original.selectionType === 'SINGLE' ? 'neutral' : 'info'}>
          {row.original.selectionType}
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'isRequired',
      header: 'Required',
      cell: ({ row }) => (
        <StatusBadge tone={row.original.isRequired ? 'warning' : 'neutral'}>
          {row.original.isRequired ? 'Yes' : 'No'}
        </StatusBadge>
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
        const question = row.original
        const actions = []

        if (canWrite) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => navigate(ROUTES.quizQuestionEdit(question.id)),
          })
          actions.push({
            label: 'Deactivate',
            icon: PowerOff,
            destructive: true,
            separatorBefore: true,
            onSelect: () => onDeactivate(question),
          })
        }

        return (
          <RowActions
            actions={actions}
            label={`Actions for "${question.questionText}"`}
          />
        )
      },
    },
  ]
}
