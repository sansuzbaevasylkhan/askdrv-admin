import { OrdersTable } from '@/components/orders-table'
import { getOrders } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Сапарлар</h1>
        <p className="text-sm text-muted-foreground">
          Барлық сапарлар ({orders.length})
        </p>
      </div>
      <OrdersTable initialOrders={orders} />
    </div>
  )
}
