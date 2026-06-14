import { useState } from 'react'
import { Activity, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { apiBaseUrl } from '@/config/env'
import { API_CONTRACT } from '@/lib/api/contract-info'
import { getApiErrorMessage } from '@/lib/api/errors'
import { appControllerGetHello } from '@/lib/api/generated/endpoints/health/health'
import {
  DesignPreview,
  PageContainer,
  PageHeader,
  SectionCard,
  StatusBadge,
} from '@/shared/components/common'
import { Button } from '@/shared/components/ui/button'

type ProbeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-all font-mono text-sm text-foreground">{value}</dd>
    </div>
  )
}

/**
 * Development-only API diagnostics. Shows the centralized configuration and the
 * backend contract metadata, and offers an on-demand connectivity probe against
 * the public health endpoint (`GET /`). It never displays secrets, requires no
 * authentication, and is not part of the dashboard navigation.
 */
export function DiagnosticsPage() {
  const [probe, setProbe] = useState<ProbeState>({ status: 'idle' })

  async function runHealthProbe() {
    setProbe({ status: 'loading' })
    try {
      const response = await appControllerGetHello()
      setProbe({
        status: 'success',
        message: `Reachable (HTTP ${response.status}).`,
      })
    } catch (error) {
      setProbe({ status: 'error', message: getApiErrorMessage(error) })
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="API diagnostics"
        description="Inspect the API integration configuration."
        actions={<StatusBadge tone="warning">Development only</StatusBadge>}
      />

      <div className="mt-6 space-y-6">
        <SectionCard
          title="Configuration"
          description="Resolved from the typed environment module."
        >
          <dl className="space-y-3">
            <InfoRow label="API base URL" value={apiBaseUrl} />
            <InfoRow label="Generated client" value="Available" />
          </dl>
        </SectionCard>

        <SectionCard
          title="Backend contract"
          description="Metadata for the OpenAPI contract the client was generated from."
        >
          <dl className="space-y-3">
            <InfoRow label="API title" value={API_CONTRACT.title} />
            <InfoRow label="Contract version" value={API_CONTRACT.version} />
            <InfoRow label="OpenAPI version" value={API_CONTRACT.openapi} />
            <InfoRow label="Backend package" value={API_CONTRACT.backendPackage} />
            <InfoRow label="Handoff" value={API_CONTRACT.handoff} />
            <InfoRow label="Contract source" value={API_CONTRACT.source} />
          </dl>
        </SectionCard>

        <SectionCard
          title="Connectivity probe"
          description="Calls the public health endpoint (GET /) through the generated client."
          action={
            <Button size="sm" onClick={runHealthProbe} disabled={probe.status === 'loading'}>
              {probe.status === 'loading' ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Activity className="size-4" aria-hidden="true" />
              )}
              Test connection
            </Button>
          }
        >
          <DesignPreview label="Live probe — requires the backend to be running">
            {probe.status === 'idle' && (
              <p className="text-sm text-muted-foreground">
                No probe run yet. The backend is not required for the dashboard to load.
              </p>
            )}
            {probe.status === 'loading' && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Contacting the API…
              </p>
            )}
            {probe.status === 'success' && (
              <p className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {probe.message}
              </p>
            )}
            {probe.status === 'error' && (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="size-4" aria-hidden="true" />
                {probe.message}
              </p>
            )}
          </DesignPreview>
        </SectionCard>
      </div>
    </PageContainer>
  )
}
