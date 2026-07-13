'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Activity, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/format'

// react-leaflet relies on `window` — load it only on the client.
const LiveMap = dynamic(() => import('./live-map').then((m) => m.LiveMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-md border border-border bg-muted/30">
      <p className="text-sm text-muted-foreground">Карта жүктелуде...</p>
    </div>
  ),
})

interface Props {
  initialOrders: Order[]
}

export function LiveTracker({ initialOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  useEffect(() => {
    const channel = supabase
      .channel('active-trips')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => {
            const next = payload.eventType === 'DELETE'
              ? prev.filter((o) => o.id !== (payload.old as Order).id)
              : [...prev.filter((o) => o.id !== (payload.new as Order).id), payload.new as Order]
            // Keep only active ones to avoid unbounded growth.
            return next.filter((o) =>
              ['pending', 'accepted', 'in_progress'].includes(o.status)
            )
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Белсенді сапарлар
          </CardTitle>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
            {orders.length} белсенді
          </span>
        </CardHeader>
        <CardContent>
          <LiveMap orders={orders} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Белсенді сапарлар тізімі
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Қазір белсенді сапарлар жоқ
            </p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      #{o.id.slice(0, 8)}
                    </div>
                    <div className="text-sm">
                      {o.pickup_address} → {o.dropoff_address}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(o.created_at)} · {formatCurrency(o.price)}
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
