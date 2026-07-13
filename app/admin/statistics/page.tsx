import { StatisticsView } from '@/components/statistics-view'
import { getOrders } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  const orders = await getOrders()

  return <StatisticsView initialOrders={orders} />
}
