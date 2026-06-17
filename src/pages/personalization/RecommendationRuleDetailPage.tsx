import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/components/common/PageContainer'
import { PageHeader } from '@/shared/components/common/PageHeader'
import { PermissionGuard } from '@/shared/components/common/PermissionGuard'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { StatusBadge } from '@/shared/components/common/StatusBadge'
import { ROUTES } from '@/config/routes'
import { useRecommendationRuleDetail } from '@/features/recommendation-rules/hooks/use-recommendation-rules'
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

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export function RecommendationRuleDetailPage() {
  const { ruleId } = useParams<{ ruleId: string }>()
  const id = ruleId ?? ''

  const query = useRecommendationRuleDetail(id)

  const rule =
    query.data?.status === 200
      ? (query.data.data as unknown as RecommendationRuleResponse)
      : null

  if (query.isLoading) {
    return (
      <PageContainer>
        <LoadingState label="Loading rule…" />
      </PageContainer>
    )
  }

  if (query.isError || query.data?.status === 404 || !rule) {
    return (
      <PageContainer>
        <div className="space-y-4 py-12 text-center">
          {query.isError ? (
            <ErrorState
              message="Could not load rule details."
              onRetry={() => query.refetch()}
            />
          ) : (
            <>
              <p className="text-muted-foreground">Recommendation rule not found.</p>
              <Button asChild variant="outline">
                <Link to={ROUTES.recommendationRules}>
                  <ArrowLeft className="mr-2 size-4" />
                  Back to rules
                </Link>
              </Button>
            </>
          )}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.recommendationRules}>
              <ArrowLeft className="mr-1 size-4" />
              Rules
            </Link>
          </Button>
        </div>

        <PageHeader
          title={rule.name}
          description={`Code: ${rule.code}`}
          actions={
            <PermissionGuard permission="write">
              <Button asChild variant="outline">
                <Link to={ROUTES.recommendationRuleEdit(id)}>
                  <Edit className="mr-2 size-4" />
                  Edit rule
                </Link>
              </Button>
            </PermissionGuard>
          }
        />

        <div className="rounded-lg border bg-card p-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Code">
              <span className="font-mono text-xs">{rule.code}</span>
            </DetailField>
            <DetailField label="Name">{rule.name}</DetailField>
            <DetailField label="Status">
              <StatusBadge tone={rule.isActive ? 'success' : 'neutral'}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </StatusBadge>
            </DetailField>
            <DetailField label="Target type">
              <StatusBadge tone="info" withDot={false}>
                {TARGET_TYPE_LABELS[rule.targetType] ?? rule.targetType}
              </StatusBadge>
            </DetailField>
            <DetailField label="Condition type">
              <StatusBadge tone="neutral" withDot={false}>
                {CONDITION_TYPE_LABELS[rule.conditionType] ?? rule.conditionType}
              </StatusBadge>
            </DetailField>
            <DetailField label="Score value">
              <span className="tabular-nums">{rule.scoreValue}</span>
            </DetailField>
            <DetailField label="Weight">
              <span className="tabular-nums">{rule.weight}</span>
            </DetailField>
          </dl>
        </div>

        <p className="text-xs text-muted-foreground">
          Rule changes affect future recommendation previews and results only. Previously stored results are not recalculated.
        </p>
      </div>
    </PageContainer>
  )
}
