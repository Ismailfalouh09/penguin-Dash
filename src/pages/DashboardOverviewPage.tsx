import { Link } from 'react-router-dom'
import {
  Boxes,
  ClipboardCheck,
  Package,
  PackageX,
  Plus,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/config/routes'
import {
  DesignPreview,
  EmptyState,
  PageContainer,
  PageHeader,
  PermissionGuard,
  SectionCard,
  StatusBadge,
} from '@/shared/components/common'
import { Button } from '@/shared/components/ui/button'

interface MetricCard {
  label: string
  icon: LucideIcon
}

const METRICS: MetricCard[] = [
  { label: 'Active products', icon: Package },
  { label: 'Active packs', icon: Boxes },
  { label: 'Orders to confirm', icon: ClipboardCheck },
  { label: 'Low-stock references', icon: PackageX },
]

function MetricPlaceholder({ label, icon: Icon }: MetricCard) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span
          className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground"
          aria-hidden="true"
        >
          <Icon className="size-[18px]" />
        </span>
        <StatusBadge tone="neutral" withDot={false}>
          Planned
        </StatusBadge>
      </div>
      <p className="mt-3 text-2xl font-semibold text-muted-foreground" aria-hidden="true">
        —
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function DashboardOverviewPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        description="Operational summary of the store. Live metrics are connected in later tasks."
        actions={
          <PermissionGuard permission="write">
            <Button asChild>
              <Link to={ROUTES.productNew}>
                <Plus className="size-4" aria-hidden="true" />
                New product
              </Link>
            </Button>
          </PermissionGuard>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Quick actions */}
        <SectionCard title="Quick actions" description="Jump straight into common workflows.">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.products}>
                <Package className="size-4" aria-hidden="true" />
                Products
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.packs}>
                <Boxes className="size-4" aria-hidden="true" />
                Packs
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.orders}>
                <ShoppingCart className="size-4" aria-hidden="true" />
                Orders
              </Link>
            </Button>
          </div>
        </SectionCard>

        {/* Metric placeholders — no invented numbers */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">At a glance</h2>
          <DesignPreview label="Design preview — metrics arrive with API integration">
            <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 lg:grid-cols-4">
              {METRICS.map((metric) => (
                <MetricPlaceholder key={metric.label} {...metric} />
              ))}
            </div>
          </DesignPreview>
        </div>

        {/* Operational lists */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title="Recent orders"
            description="Latest customer orders."
            action={<StatusBadge tone="info">Task 12</StatusBadge>}
          >
            <EmptyState
              icon={ShoppingCart}
              title="No order data yet"
              description="Recent orders will appear here once the Orders module is connected."
            />
          </SectionCard>

          <SectionCard
            title="Orders requiring confirmation"
            description="Orders awaiting a status update."
            action={<StatusBadge tone="info">Task 12</StatusBadge>}
          >
            <EmptyState
              icon={ClipboardCheck}
              title="Nothing to confirm"
              description="Orders that need attention will be listed here."
            />
          </SectionCard>

          <SectionCard
            title="Low-stock references"
            description="Product references running low."
            action={<StatusBadge tone="info">Task 8</StatusBadge>}
          >
            <EmptyState
              icon={PackageX}
              title="No stock data yet"
              description="Low-stock references will surface here once references are connected."
            />
          </SectionCard>

          <SectionCard
            title="Catalog health"
            description="Active products and packs."
            action={<StatusBadge tone="info">Task 7</StatusBadge>}
          >
            <EmptyState
              icon={Package}
              title="No catalog data yet"
              description="A summary of active products and packs will appear here."
            />
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  )
}
