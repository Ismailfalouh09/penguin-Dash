import { ModulePlaceholder } from '@/pages/_shared/ModulePlaceholder'

export function OrdersPage() {
  return (
    <ModulePlaceholder
      title="Orders"
      description="Review customer orders and update their status."
      moduleSummary="Customer orders (Cash on Delivery) with fulfilment status tracking."
      showStatePreviews
      plannedFeatures={[
        'List orders with search and pagination',
        'View order details',
        'Update order status (write roles only)',
      ]}
    />
  )
}
