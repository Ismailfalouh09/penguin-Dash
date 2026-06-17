import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  FileImage,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/config/routes'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  PermissionGuard,
  SectionCard,
  StatusBadge,
} from '@/shared/components/common'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '@/features/orders/components/OrderColumns'
import { useDashboardMetrics } from '@/features/dashboard/hooks/use-dashboard-data'
import { isConcreteOrderId } from '@/features/orders/hooks/use-orders'
import type { AdminOrderDetailsResponse } from '@/lib/api'

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------

interface MetricCardProps {
  label: string
  icon: LucideIcon
  value: number | null
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  linkTo?: string
  tone?: 'default' | 'warning'
}

function MetricCard({
  label,
  icon: Icon,
  value,
  isLoading,
  isError,
  onRetry,
  linkTo,
  tone = 'default',
}: MetricCardProps) {
  const inner = (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span
          className={[
            'flex size-9 items-center justify-center rounded-md',
            tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-accent text-accent-foreground',
          ].join(' ')}
          aria-hidden="true"
        >
          <Icon className="size-[18px]" />
        </span>
        {isError && !isLoading && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onRetry()
            }}
            className="text-xs text-destructive underline-offset-2 hover:underline"
            aria-label={`Retry loading ${label}`}
          >
            Retry
          </button>
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-8 w-12" />
        ) : isError ? (
          <p className="text-2xl font-semibold text-muted-foreground" aria-hidden="true">
            —
          </p>
        ) : (
          <p
            className={[
              'text-2xl font-semibold tabular-nums',
              tone === 'warning' && (value ?? 0) > 0 ? 'text-warning' : 'text-foreground',
            ].join(' ')}
            aria-label={`${value ?? 0} ${label}`}
          >
            {value ?? 0}
          </p>
        )}
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )

  if (linkTo && !isLoading && !isError) {
    return (
      <Link
        to={linkTo}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {inner}
      </Link>
    )
  }

  return inner
}

// ---------------------------------------------------------------------------
// Shortcut button
// ---------------------------------------------------------------------------

interface ShortcutProps {
  label: string
  icon: LucideIcon
  to: string
  permission?: 'write' | 'read'
}

function Shortcut({ label, icon: Icon, to }: ShortcutProps) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link to={to}>
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  )
}

// ---------------------------------------------------------------------------
// Recent orders row
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function RecentOrderRow({ order }: { order: AdminOrderDetailsResponse }) {
  const content = (
    <>
      <span className="shrink-0 font-mono text-xs font-semibold text-foreground sm:w-32">
        {order.orderNumber}
      </span>
      <span className="flex-1 truncate text-sm text-foreground">
        {order.customer.fullName}
        {order.customerAddress?.city ? (
          <span className="ml-1 text-xs text-muted-foreground">· {order.customerAddress.city}</span>
        ) : null}
      </span>
      <span className="text-sm font-medium tabular-nums">
        {order.totalAmount.toFixed(2)}{' '}
        <span className="text-xs text-muted-foreground">{order.currency}</span>
      </span>
      <StatusBadge tone={ORDER_STATUS_TONE[order.orderStatus] ?? 'neutral'}>
        {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
      </StatusBadge>
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatDate(order.createdAt)}
      </span>
    </>
  )

  if (!isConcreteOrderId(order.orderId)) {
    return (
      <div className="flex flex-col gap-1 rounded-md p-2 sm:flex-row sm:items-center sm:gap-4">
        {content}
      </div>
    )
  }

  return (
    <Link
      to={ROUTES.order(order.orderId)}
      className="flex flex-col gap-1 rounded-md p-2 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-4"
      aria-label={`Order ${order.orderNumber} — view details`}
    >
      {content}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Alerts section
// ---------------------------------------------------------------------------

interface AlertItemProps {
  icon: LucideIcon
  title: string
  description: string
  linkTo: string
  linkLabel: string
  tone: 'warning' | 'error' | 'info'
}

function AlertItem({ icon: Icon, title, description, linkTo, linkLabel, tone }: AlertItemProps) {
  const toneStyles = {
    warning: 'border-warning/30 bg-warning/5 text-warning',
    error: 'border-destructive/30 bg-destructive/5 text-destructive',
    info: 'border-info/30 bg-info/5 text-info',
  }

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${toneStyles[tone]}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs opacity-80">{description}</p>
      </div>
      <Button asChild variant="ghost" size="sm" className="h-7 shrink-0 text-xs">
        <Link to={linkTo}>{linkLabel}</Link>
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function DashboardOverviewPage() {
  const {
    recentOrders,
    totalPendingOrders,
    totalActiveProducts,
    totalActivePacks,
    totalActiveRules,
    totalMedia,
  } = useDashboardMetrics()

  const pendingCount = totalPendingOrders.value ?? 0
  const activeRulesCount = totalActiveRules.value ?? 0

  const hasAlerts =
    (!totalPendingOrders.isLoading && !totalPendingOrders.isError && pendingCount > 0) ||
    (!totalActiveRules.isLoading && !totalActiveRules.isError && activeRulesCount === 0)

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        description="Operational summary of the store."
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
        {/* ── Metrics grid ─────────────────────────────────────────────── */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="mb-3 text-sm font-medium text-muted-foreground">
            At a glance
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <MetricCard
              label="Orders pending confirmation"
              icon={ClipboardCheck}
              value={totalPendingOrders.value}
              isLoading={totalPendingOrders.isLoading}
              isError={totalPendingOrders.isError}
              onRetry={totalPendingOrders.refetch}
              linkTo={ROUTES.orders}
              tone="warning"
            />
            <MetricCard
              label="Active products"
              icon={Package}
              value={totalActiveProducts.value}
              isLoading={totalActiveProducts.isLoading}
              isError={totalActiveProducts.isError}
              onRetry={totalActiveProducts.refetch}
              linkTo={ROUTES.products}
            />
            <MetricCard
              label="Active packs"
              icon={Boxes}
              value={totalActivePacks.value}
              isLoading={totalActivePacks.isLoading}
              isError={totalActivePacks.isError}
              onRetry={totalActivePacks.refetch}
              linkTo={ROUTES.packs}
            />
            <MetricCard
              label="Active recommendation rules"
              icon={Sparkles}
              value={totalActiveRules.value}
              isLoading={totalActiveRules.isLoading}
              isError={totalActiveRules.isError}
              onRetry={totalActiveRules.refetch}
              linkTo={ROUTES.recommendationRules}
            />
            <MetricCard
              label="Media assets"
              icon={FileImage}
              value={totalMedia.value}
              isLoading={totalMedia.isLoading}
              isError={totalMedia.isError}
              onRetry={totalMedia.refetch}
              linkTo={ROUTES.media}
            />
          </div>
        </section>

        {/* ── Alerts ───────────────────────────────────────────────────── */}
        {hasAlerts && (
          <section aria-labelledby="alerts-heading">
            <h2 id="alerts-heading" className="mb-3 text-sm font-medium text-muted-foreground">
              Needs attention
            </h2>
            <div className="space-y-2">
              {pendingCount > 0 && (
                <AlertItem
                  icon={AlertTriangle}
                  tone="warning"
                  title={`${pendingCount} order${pendingCount !== 1 ? 's' : ''} pending confirmation`}
                  description="Review and confirm or update these orders."
                  linkTo={ROUTES.orders}
                  linkLabel="View orders"
                />
              )}
              {activeRulesCount === 0 && (
                <AlertItem
                  icon={Sparkles}
                  tone="info"
                  title="No active recommendation rules"
                  description="Recommendations won't be served until at least one rule is active."
                  linkTo={ROUTES.recommendationRules}
                  linkLabel="Manage rules"
                />
              )}
            </div>
          </section>
        )}

        {/* ── Recent orders ─────────────────────────────────────────────── */}
        <SectionCard
          title="Recent orders"
          description="Last 5 customer orders."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.orders}>
                <ShoppingCart className="size-4" aria-hidden="true" />
                All orders
              </Link>
            </Button>
          }
        >
          {recentOrders.isLoading ? (
            <LoadingState variant="table" rows={5} label="Loading recent orders…" />
          ) : recentOrders.isError ? (
            <ErrorState
              title="Could not load recent orders"
              message="An error occurred while fetching the latest orders."
              onRetry={recentOrders.refetch}
            />
          ) : recentOrders.items.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Customer orders will appear here once the first order is placed."
            />
          ) : (
            <div className="-mx-1 divide-y divide-border">
              {recentOrders.items.map((order) => (
                <RecentOrderRow key={order.orderId} order={order} />
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Shortcuts ─────────────────────────────────────────────────── */}
        <SectionCard title="Quick actions" description="Jump straight into common workflows.">
          <div className="space-y-3">
            {/* Read-access shortcuts — all roles */}
            <div className="flex flex-wrap gap-2">
              <Shortcut label="Orders" icon={ShoppingCart} to={ROUTES.orders} />
              <Shortcut label="Products" icon={Package} to={ROUTES.products} />
              <Shortcut label="Packs" icon={Boxes} to={ROUTES.packs} />
              <Shortcut label="Media library" icon={FileImage} to={ROUTES.media} />
              <Shortcut label="Attributes & quiz" icon={Tag} to={ROUTES.attributes} />
              <Shortcut
                label="Recommendation rules"
                icon={Sparkles}
                to={ROUTES.recommendationRules}
              />
            </div>

            {/* Write-access shortcuts — OWNER / ADMIN only */}
            <PermissionGuard permission="write">
              <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                <Button asChild size="sm">
                  <Link to={ROUTES.productNew}>
                    <Plus className="size-4" aria-hidden="true" />
                    New product
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={ROUTES.packNew}>
                    <Plus className="size-4" aria-hidden="true" />
                    New pack
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={ROUTES.recommendationRuleNew}>
                    <Plus className="size-4" aria-hidden="true" />
                    New rule
                  </Link>
                </Button>
              </div>
            </PermissionGuard>
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  )
}
