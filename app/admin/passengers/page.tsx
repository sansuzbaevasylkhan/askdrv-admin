import { PassengersTable } from '@/components/passengers-table'
import { getPassengers } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function PassengersPage() {
  const passengers = await getPassengers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Жолаушылар</h1>
        <p className="text-sm text-muted-foreground">
          Барлық тіркелген жолаушылар ({passengers.length})
        </p>
      </div>
      <PassengersTable initialPassengers={passengers} />
    </div>
  )
}
