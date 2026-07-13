'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import type { Driver, DriverStatus } from '@/lib/types'

interface Props {
  initialDrivers: Driver[]
}

const STATUS_OPTIONS: { value: 'all' | DriverStatus; label: string }[] = [
  { value: 'all', label: 'Барлығы' },
  { value: 'active', label: 'Белсенді' },
  { value: 'pending', label: 'Күтуде' },
  { value: 'blocked', label: 'Бұғатталған' },
  { value: 'inactive', label: 'Белсенді емес' },
]

export function DriversTable({ initialDrivers }: Props) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | DriverStatus>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return drivers.filter((d) => {
      if (status !== 'all' && d.status !== status) return false
      if (!q) return true
      return (
        d.full_name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        (d.car_brand ?? '').toLowerCase().includes(q) ||
        (d.car_number ?? '').toLowerCase().includes(q)
      )
    })
  }, [drivers, query, status])

  async function toggleBlock(d: Driver) {
    setBusyId(d.id)
    const nextStatus: DriverStatus = d.status === 'blocked' ? 'active' : 'blocked'
    try {
      const res = await fetch(`/api/drivers/${d.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setDrivers((prev) =>
          prev.map((x) => (x.id === d.id ? { ...x, status: nextStatus } : x))
        )
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Аты, телефон, машина бойынша іздеу..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as 'all' | DriverStatus)}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Аты</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Машина</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Рейтинг</TableHead>
              <TableHead className="text-right">Сапарлар</TableHead>
              <TableHead className="text-right">Әрекет</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Жүргізушілер табылмады
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link
                      href={`/admin/drivers/${d.id}`}
                      className="font-medium hover:underline"
                    >
                      {d.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.phone}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {d.car_brand ?? '—'} {d.car_model ?? ''}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {d.car_number ?? '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {d.rating != null ? d.rating.toFixed(1) : '—'}
                  </TableCell>
                  <TableCell className="text-right">{d.total_trips}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={d.status === 'blocked' ? 'outline' : 'destructive'}
                      disabled={busyId === d.id}
                      onClick={() => toggleBlock(d)}
                    >
                      {d.status === 'blocked' ? 'Белсендіру' : 'Бұғаттау'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
