import { Badge } from '@/components/ui/badge'
import type { OrderStatus, DriverStatus, PaymentStatus } from '@/lib/types'

type Status = OrderStatus | DriverStatus | PaymentStatus | string

const STYLES: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  blocked: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  inactive: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  accepted: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  in_progress: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  failed: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
}

const LABELS: Record<string, string> = {
  active: 'Белсенді',
  pending: 'Күтуде',
  blocked: 'Бұғатталған',
  inactive: 'Белсенді емес',
  accepted: 'Қабылданды',
  in_progress: 'Орындалуда',
  completed: 'Аяқталды',
  cancelled: 'Бас тартылды',
  paid: 'Төленді',
  failed: 'Сәтсіз',
}

export function StatusBadge({ status }: { status: Status }) {
  const key = String(status)
  return (
    <Badge
      variant="outline"
      className={
        STYLES[key] ??
        'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'
      }
    >
      {LABELS[key] ?? key}
    </Badge>
  )
}
