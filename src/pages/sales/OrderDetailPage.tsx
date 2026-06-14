import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function OrderDetailPage() {
  const { orderId } = useParams()

  return (
    <ModulePlaceholder
      title="Order details"
      description="View a single order and manage its status."
      moduleSummary="Full order view: items, customer details and status history."
      context={{ label: 'Order ID', value: orderId ?? 'unknown' }}
      primaryAction={{ label: 'Update status', permission: 'orders:update-status' }}
      plannedFeatures={[
        'Show order line items and totals',
        'Show customer and delivery details',
        'Update fulfilment status (write roles only)',
      ]}
    />
  )
}
