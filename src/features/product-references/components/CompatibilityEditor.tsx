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
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { useAttributeGroups } from '../hooks/use-product-references'
import { ReferenceAttributeInputDtoMatchType } from '@/lib/api/generated/models/referenceAttributeInputDtoMatchType'
import type { ReferenceAttributeInputDto, AttributeGroupResponse, AttributeMatchResponse } from '@/lib/api'
import type { PaginatedResponse } from '@/shared/lib/pagination'

const MATCH_TYPE_LABELS: Record<string, string> = {
  COMPATIBLE: 'Compatible',
  NOT_COMPATIBLE: 'Not compatible',
  BOOST: 'Boost',
}

interface CompatibilityEditorProps {
  /** Current attribute entries (edit mode pre-fills these). */
  value: ReferenceAttributeInputDto[]
  onChange: (entries: ReferenceAttributeInputDto[]) => void
  disabled?: boolean
}

/**
 * Lets admins build a list of (group, option, matchType, score) entries.
 * Loads live attribute groups from the backend — no hardcoded values.
 */
export function CompatibilityEditor({ value, onChange, disabled }: CompatibilityEditorProps) {
  const groupsQuery = useAttributeGroups()

  const rawGroups =
    groupsQuery.data?.status === 200
      ? (groupsQuery.data.data as unknown as PaginatedResponse<AttributeGroupResponse>)
      : null
  const groups: AttributeGroupResponse[] = rawGroups?.data ?? []

  const [pendingGroupCode, setPendingGroupCode] = useState('')
  const [pendingOptionCode, setPendingOptionCode] = useState('')
  const [pendingMatchType, setPendingMatchType] = useState<string>(
    ReferenceAttributeInputDtoMatchType.COMPATIBLE
  )
  const [pendingScore, setPendingScore] = useState('50')

  const selectedGroup = groups.find((g) => g.code === pendingGroupCode) ?? null

  const alreadyUsedOptionCodes = value
    .filter((v) => v.attributeGroupCode === pendingGroupCode)
    .map((v) => v.attributeOptionCode)

  const availableOptions = selectedGroup
    ? (selectedGroup.options ?? []).filter((o) => !alreadyUsedOptionCodes.includes(o.code))
    : []

  const handleAdd = () => {
    if (!pendingGroupCode || !pendingOptionCode) return
    const score = parseFloat(pendingScore)
    if (isNaN(score) || score < 0 || score > 100) return

    const entry: ReferenceAttributeInputDto = {
      attributeGroupCode: pendingGroupCode,
      attributeOptionCode: pendingOptionCode,
      matchType: pendingMatchType as ReferenceAttributeInputDto['matchType'],
      scoreValue: score,
    }

    onChange([...value, entry])
    setPendingOptionCode('')
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const getGroupName = (groupCode: string) =>
    groups.find((g) => g.code === groupCode)?.name ?? groupCode

  const getOptionLabel = (groupCode: string, optionCode: string) => {
    const group = groups.find((g) => g.code === groupCode)
    return group?.options?.find((o) => o.code === optionCode)?.label ?? optionCode
  }

  if (groupsQuery.isLoading) {
    return <LoadingState label="Loading attribute groups…" />
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
    return (
      <p className="text-sm text-muted-foreground">
        No attribute groups are available. Create attribute groups first.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <ul className="space-y-2" aria-label="Compatibility entries">
          {value.map((entry, i) => (
            <li
              key={`${entry.attributeGroupCode}-${entry.attributeOptionCode}-${i}`}
              className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
            >
              <span className="font-medium">{getGroupName(entry.attributeGroupCode)}</span>
              <span className="text-muted-foreground">/</span>
              <span>{getOptionLabel(entry.attributeGroupCode, entry.attributeOptionCode)}</span>
              <span className="ml-auto flex items-center gap-2 text-muted-foreground">
                <span
                  className={
                    entry.matchType === 'COMPATIBLE'
                      ? 'text-success'
                      : entry.matchType === 'NOT_COMPATIBLE'
                        ? 'text-destructive'
                        : 'text-info'
                  }
                >
                  {MATCH_TYPE_LABELS[entry.matchType] ?? entry.matchType}
                </span>
                <span>· {entry.scoreValue}</span>
                {!disabled && (
                  <button
                    type="button"
                    aria-label={`Remove ${getGroupName(entry.attributeGroupCode)} / ${getOptionLabel(entry.attributeGroupCode, entry.attributeOptionCode)}`}
                    onClick={() => handleRemove(i)}
                    className="ml-1 rounded p-0.5 hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Add compatibility rule
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="compat-group">
                Attribute group
              </label>
              <Select
                value={pendingGroupCode}
                onValueChange={(v) => {
                  setPendingGroupCode(v)
                  setPendingOptionCode('')
                }}
              >
                <SelectTrigger id="compat-group" aria-label="Select attribute group">
                  <SelectValue placeholder="Select group…" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.code} value={g.code}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="compat-option">
                Option
              </label>
              <Select
                value={pendingOptionCode}
                onValueChange={setPendingOptionCode}
                disabled={!pendingGroupCode || availableOptions.length === 0}
              >
                <SelectTrigger id="compat-option" aria-label="Select attribute option">
                  <SelectValue
                    placeholder={
                      !pendingGroupCode
                        ? 'Select group first'
                        : availableOptions.length === 0
                          ? 'All options used'
                          : 'Select option…'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.map((o) => (
                    <SelectItem key={o.code} value={o.code}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="compat-match-type">
                Match type
              </label>
              <Select value={pendingMatchType} onValueChange={setPendingMatchType}>
                <SelectTrigger id="compat-match-type" aria-label="Select match type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MATCH_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="compat-score">
                Score (0–100)
              </label>
              <input
                id="compat-score"
                type="number"
                min={0}
                max={100}
                step={1}
                value={pendingScore}
                onChange={(e) => setPendingScore(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Score value"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={
              !pendingGroupCode ||
              !pendingOptionCode ||
              isNaN(parseFloat(pendingScore)) ||
              parseFloat(pendingScore) < 0 ||
              parseFloat(pendingScore) > 100
            }
          >
            <Plus className="size-4" />
            Add rule
          </Button>
        </div>
      )}

      {value.length === 0 && disabled && (
        <p className="text-sm text-muted-foreground">No compatibility rules defined.</p>
      )}
    </div>
  )
}

/**
 * Read-only display of AttributeMatchResponse[] (from reference detail).
 * Groups entries by attribute group.
 */
export function CompatibilityDisplay({ attributes }: { attributes: AttributeMatchResponse[] }) {
  if (attributes.length === 0) {
    return <p className="text-sm text-muted-foreground">No compatibility rules defined.</p>
  }

  const grouped = attributes.reduce<Record<string, AttributeMatchResponse[]>>((acc, attr) => {
    const key = attr.attributeGroup.code
    if (!acc[key]) acc[key] = []
    acc[key].push(attr)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([groupCode, entries]) => (
        <div key={groupCode}>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {entries[0]?.attributeGroup.name ?? groupCode}
          </p>
          <ul className="space-y-1">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm"
              >
                <span>{entry.attributeOption.label}</span>
                <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={
                      entry.matchType === 'COMPATIBLE'
                        ? 'text-success'
                        : entry.matchType === 'NOT_COMPATIBLE'
                          ? 'text-destructive'
                          : 'text-info'
                    }
                  >
                    {MATCH_TYPE_LABELS[entry.matchType] ?? entry.matchType}
                  </span>
                  <span>· {entry.scoreValue}</span>
                  {entry.isHardFilter && (
                    <span className="rounded bg-warning/10 px-1 text-warning">hard filter</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
