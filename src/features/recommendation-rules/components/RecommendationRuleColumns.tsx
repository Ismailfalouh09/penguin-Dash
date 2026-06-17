import { useNavigate } from 'react-router-dom'
import { Edit, PowerOff } from 'lucide-react'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { RowActions } from '@/shared/components/data-table/RowActions'
import { useCurrentUser } from '@/features/auth/current-user'
import { ROUTES } from '@/config/routes'
import type { ColumnDef } from '@/shared/components/data-table/types'
import type { RecommendationRuleResponse } from '@/lib/api'

const CONDITION_TYPE_LABELS: Record<string, string> = {
  MUST_MATCH: 'Must match',
  SHOULD_MATCH: 'Should match',
  EXCLUDE_IF_MATCH: 'Exclude if match',
}

const TARGET_TYPE_LABELS: Record<string, string> = {
  PACK: 'Pack',
  PRODUCT: 'Product',
  REFERENCE: 'Reference',
}

interface UseRecommendationRuleColumnsOptions {
  onDeactivate: (rule: RecommendationRuleResponse) => void
}

export function useRecommendationRuleColumns({
  onDeactivate,
}: UseRecommendationRuleColumnsOptions): ColumnDef<RecommendationRuleResponse, unknown>[] {
  const navigate = useNavigate()
  const { can } = useCurrentUser()
  const canWrite = can('write')

  return [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.code}</span>
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
      accessorKey: 'targetType',
      header: 'Target',
      cell: ({ row }) => (
        <StatusBadge tone="info" withDot={false}>
          {TARGET_TYPE_LABELS[row.original.targetType] ?? row.original.targetType}
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'conditionType',
      header: 'Condition',
      cell: ({ row }) => (
        <StatusBadge tone="neutral" withDot={false}>
          {CONDITION_TYPE_LABELS[row.original.conditionType] ?? row.original.conditionType}
        </StatusBadge>
      ),
    },
    {
      accessorKey: 'scoreValue',
      header: 'Score',
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.scoreValue}</span>
      ),
    },
    {
      accessorKey: 'weight',
      header: 'Weight',
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.weight}</span>
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
        const rule = row.original
        const actions = []

        actions.push({
          label: 'View details',
          onSelect: () => navigate(ROUTES.recommendationRule(rule.id)),
        })

        if (canWrite) {
          actions.push({
            label: 'Edit',
            icon: Edit,
            onSelect: () => navigate(ROUTES.recommendationRuleEdit(rule.id)),
          })
          if (rule.isActive) {
            actions.push({
              label: 'Deactivate',
              icon: PowerOff,
              destructive: true,
              separatorBefore: true,
              onSelect: () => onDeactivate(rule),
            })
          }
        }

        return (
          <RowActions
            actions={actions}
            label={`Actions for ${rule.name}`}
          />
        )
      },
    },
  ]
}
