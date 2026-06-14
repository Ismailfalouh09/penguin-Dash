import { Plus } from 'lucide-react'
import type { Permission } from '@/features/auth/roles'
import {
  ComingSoonState,
  DesignPreview,
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  PermissionGuard,
  SectionCard,
} from '@/shared/components/common'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

interface ModulePlaceholderProps {
  title: string
  /** Short purpose shown under the page title. */
  description: string
  /** One-line module summary for the planned-module card. */
  moduleSummary: string
  plannedFeatures: string[]
  /** Renders a (disabled) primary action gated by this permission. */
  primaryAction?: { label: string; permission?: Permission }
  /** Show the reusable Loading / Empty / Error state previews. */
  showStatePreviews?: boolean
  /** Routing context (e.g. the resolved :id) shown to confirm nested routes. */
  context?: { label: string; value: string }
}

/**
 * Shared scaffold for module placeholder pages. Provides the page header, a
 * planned-module notice, an optional permission-gated primary action, and an
 * optional preview of the reusable list states — all clearly non-functional.
 */
export function ModulePlaceholder({
  title,
  description,
  moduleSummary,
  plannedFeatures,
  primaryAction,
  showStatePreviews = false,
  context,
}: ModulePlaceholderProps) {
  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        actions={
          primaryAction && (
            <PermissionGuard permission={primaryAction.permission ?? 'write'}>
              <Button disabled>
                <Plus className="size-4" aria-hidden="true" />
                {primaryAction.label}
              </Button>
            </PermissionGuard>
          )
        }
      />

      <div className="mt-6 space-y-6">
        {context && (
          <SectionCard title="Routing context">
            <p className="text-sm text-muted-foreground">
              {context.label}:{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                {context.value}
              </code>
            </p>
          </SectionCard>
        )}

        <ComingSoonState description={moduleSummary} plannedFeatures={plannedFeatures} />

        {showStatePreviews && (
          <SectionCard
            title="Standard list states"
            description="Reusable loading, empty and error states this module will use."
          >
            <DesignPreview label="Design preview — component states">
              <Tabs defaultValue="loading">
                <TabsList>
                  <TabsTrigger value="loading">Loading</TabsTrigger>
                  <TabsTrigger value="empty">Empty</TabsTrigger>
                  <TabsTrigger value="error">Error</TabsTrigger>
                </TabsList>
                <TabsContent value="loading" className="pt-4">
                  <LoadingState variant="table" rows={4} />
                </TabsContent>
                <TabsContent value="empty" className="pt-4">
                  <EmptyState
                    title={`No ${title.toLowerCase()} yet`}
                    description="Items you create will appear here once the module is connected."
                  />
                </TabsContent>
                <TabsContent value="error" className="pt-4">
                  <ErrorState onRetry={() => undefined} />
                </TabsContent>
              </Tabs>
            </DesignPreview>
          </SectionCard>
        )}
      </div>
    </PageContainer>
  )
}
