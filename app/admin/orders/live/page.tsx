import { LiveTracker } from '@/components/live-tracker'
import { getActiveOrders } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function LiveTrackingPage() {
  const orders = await getActiveOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live трекинг</h1>
        <p className="text-sm text-muted-foreground">
          Белсенді сапарлар нақты уақыт режімінде
        </p>
      </div>
      <LiveTracker initialOrders={orders} />
    </div>
  )
}
