import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { usePackAttributeGroups } from '../hooks/use-packs'
import { PackAttributeInputDtoMatchType } from '@/lib/api/generated/models/packAttributeInputDtoMatchType'
import type {
  AttributeGroupResponse,
  AttributeMatchResponse,
  PackAttributeInputDto,
} from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const MATCH_TYPE_LABELS: Record<string, string> = {
  COMPATIBLE: 'Compatible',
  NOT_COMPATIBLE: 'Not compatible',
  BOOST: 'Boost',
}

interface PackCompatibilityEditorProps {
  value: PackAttributeInputDto[]
  onChange: (entries: PackAttributeInputDto[]) => void
  disabled?: boolean
}

export function PackCompatibilityEditor({
  value,
  onChange,
  disabled,
}: PackCompatibilityEditorProps) {
  const groupsQuery = usePackAttributeGroups()
  const rawGroups =
    groupsQuery.data?.status === 200
      ? (groupsQuery.data.data as unknown as PaginatedResponse<AttributeGroupResponse>)
      : null
  const groups = rawGroups?.data ?? []

  const [pendingGroupCode, setPendingGroupCode] = useState('')
  const [pendingOptionCode, setPendingOptionCode] = useState('')
  const [pendingMatchType, setPendingMatchType] = useState<string>(
    PackAttributeInputDtoMatchType.COMPATIBLE
  )
  const [pendingScore, setPendingScore] = useState('50')
  const [pendingHardFilter, setPendingHardFilter] = useState(false)

  const selectedGroup = groups.find((group) => group.code === pendingGroupCode) ?? null
  const usedOptionCodes = value
    .filter((entry) => entry.attributeGroupCode === pendingGroupCode)
    .map((entry) => entry.attributeOptionCode)
  const availableOptions = selectedGroup
    ? (selectedGroup.options ?? []).filter((option) => !usedOptionCodes.includes(option.code))
    : []

  const getGroupName = (groupCode: string) =>
    groups.find((group) => group.code === groupCode)?.name ?? groupCode

  const getOptionLabel = (groupCode: string, optionCode: string) => {
    const group = groups.find((candidate) => candidate.code === groupCode)
    return group?.options?.find((option) => option.code === optionCode)?.label ?? optionCode
  }

  const handleAdd = () => {
    if (!pendingGroupCode || !pendingOptionCode) return
    const score = Number.parseFloat(pendingScore)
    if (Number.isNaN(score) || score < 0 || score > 100) return

    onChange([
      ...value,
      {
        attributeGroupCode: pendingGroupCode,
        attributeOptionCode: pendingOptionCode,
        matchType: pendingMatchType as PackAttributeInputDto['matchType'],
        scoreValue: score,
        isHardFilter: pendingHardFilter,
      },
    ])
    setPendingOptionCode('')
  }

  if (groupsQuery.isLoading) {
    return <LoadingState label="Loading attribute groups..." />
  }

  if (groupsQuery.isError) {
    return (
      <ErrorState
        message="Could not load attribute groups."
        onRetry={() => groupsQuery.refetch()}
      />
    )
  }

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">No attribute groups are available.</p>
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <ul className="space-y-2" aria-label="Pack compatibility attributes">
          {value.map((entry, index) => (
            <li
              key={`${entry.attributeGroupCode}-${entry.attributeOptionCode}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="font-medium">{getGroupName(entry.attributeGroupCode)}</span>
              <span className="text-muted-foreground">/</span>
              <span>{getOptionLabel(entry.attributeGroupCode, entry.attributeOptionCode)}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {MATCH_TYPE_LABELS[entry.matchType] ?? entry.matchType} - {entry.scoreValue}
                {entry.isHardFilter ? ' - hard filter' : ''}
              </span>
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remove ${getGroupName(entry.attributeGroupCode)} / ${getOptionLabel(
                    entry.attributeGroupCode,
                    entry.attributeOptionCode
                  )}`}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="rounded p-1 hover:bg-muted"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="pack-attribute-group" className="text-xs text-muted-foreground">
                Attribute group
              </label>
              <Select
                value={pendingGroupCode}
                onValueChange={(next) => {
                  setPendingGroupCode(next)
                  setPendingOptionCode('')
                }}
              >
                <SelectTrigger id="pack-attribute-group">
                  <SelectValue placeholder="Select group..." />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.code} value={group.code}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pack-attribute-option" className="text-xs text-muted-foreground">
                Option
              </label>
              <Select
                value={pendingOptionCode}
                onValueChange={setPendingOptionCode}
                disabled={!pendingGroupCode || availableOptions.length === 0}
              >
                <SelectTrigger id="pack-attribute-option">
                  <SelectValue
                    placeholder={
                      pendingGroupCode
                        ? availableOptions.length === 0
                          ? 'All options used'
                          : 'Select option...'
                        : 'Select group first'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pack-attribute-match" className="text-xs text-muted-foreground">
                Match type
              </label>
              <Select value={pendingMatchType} onValueChange={setPendingMatchType}>
                <SelectTrigger id="pack-attribute-match">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MATCH_TYPE_LABELS).map(([valueKey, label]) => (
                    <SelectItem key={valueKey} value={valueKey}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label htmlFor="pack-attribute-score" className="text-xs text-muted-foreground">
                Score
              </label>
              <input
                id="pack-attribute-score"
                type="number"
                min={0}
                max={100}
                step={1}
                value={pendingScore}
                onChange={(event) => setPendingScore(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pendingHardFilter}
              onChange={(event) => setPendingHardFilter(event.target.checked)}
              className="size-4 rounded border border-border accent-primary"
            />
            Hard filter
          </label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!pendingGroupCode || !pendingOptionCode}
          >
            <Plus className="size-4" />
            Add attribute
          </Button>
        </div>
      )}
    </div>
  )
}

export function PackCompatibilityDisplay({ attributes }: { attributes: AttributeMatchResponse[] }) {
  if (attributes.length === 0) {
    return <p className="text-sm text-muted-foreground">No compatibility attributes defined.</p>
  }

  return (
    <ul className="space-y-2">
      {attributes.map((attribute) => (
        <li
          key={attribute.id}
          className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
        >
          <span className="font-medium">{attribute.attributeGroup.name}</span>
          <span className="text-muted-foreground">/</span>
          <span>{attribute.attributeOption.label}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {MATCH_TYPE_LABELS[attribute.matchType] ?? attribute.matchType} - {attribute.scoreValue}
            {attribute.isHardFilter ? ' - hard filter' : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}
