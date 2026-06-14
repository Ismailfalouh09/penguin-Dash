import { useCurrentUser } from '@/features/auth/current-user'
import { ROLE_LABELS } from '@/features/auth/roles'
import {
  ComingSoonState,
  PageContainer,
  PageHeader,
  SectionCard,
  StatusBadge,
} from '@/shared/components/common'

export function ProfilePage() {
  const { user, isPlaceholder } = useCurrentUser()

  return (
    <PageContainer>
      <PageHeader title="Profile" description="Your account details." />

      <div className="mt-6 space-y-6">
        <SectionCard
          title="Account"
          description="Loaded from GET /auth/me once authentication is implemented (Task 3)."
          action={isPlaceholder ? <StatusBadge tone="warning">Placeholder data</StatusBadge> : null}
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full name
              </dt>
              <dd className="mt-1 text-sm text-foreground">{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1 text-sm text-foreground">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Role
              </dt>
              <dd className="mt-1 text-sm text-foreground">{ROLE_LABELS[user.role]}</dd>
            </div>
          </dl>
        </SectionCard>

        <ComingSoonState
          description="Profile management for the signed-in admin."
          plannedFeatures={['Load the real profile from GET /auth/me', 'Display session details']}
        />
      </div>
    </PageContainer>
  )
}
