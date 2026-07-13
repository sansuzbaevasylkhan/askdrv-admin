import { PaymentsView } from '@/components/payments-view'
import { getAdminSetting, getPayments } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
  const [payments, commissionRaw] = await Promise.all([
    getPayments(),
    getAdminSetting('commission_percent'),
  ])
  const initialCommission = commissionRaw ? Number(commissionRaw) : 10

  return (
    <PaymentsView
      initialPayments={payments}
      initialCommission={initialCommission}
    />
  )
}
