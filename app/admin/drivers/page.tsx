import { DriversTable } from '@/components/drivers-table'
import { getDrivers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function DriversPage() {
  const drivers = await getDrivers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Жүргізушілер</h1>
        <p className="text-sm text-muted-foreground">
          Барлық тіркелген жүргізушілер ({drivers.length})
        </p>
      </div>
      <DriversTable initialDrivers={drivers} />
    </div>
  )
}
