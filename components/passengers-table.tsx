'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateOnly } from '@/lib/format'
import type { AppUser } from '@/lib/types'

interface Props {
  initialPassengers: AppUser[]
}

export function PassengersTable({ initialPassengers }: Props) {
  const [passengers, setPassengers] = useState(initialPassengers)
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return passengers
    return passengers.filter((p) => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
      return fullName.includes(q) || p.phone.toLowerCase().includes(q)
    })
  }, [passengers, query])

  async function toggleBlock(p: AppUser) {
    setBusyId(p.id)
    const nextBlocked = !p.is_blocked
    try {
      const res = await fetch(`/api/passengers/${p.id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: nextBlocked }),
      })
      if (res.ok) {
        setPassengers((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, is_blocked: nextBlocked } : x))
        )
      }
    } finally {
      setBusyId(null)
    }
  }

  async function deletePassenger(p: AppUser) {
    const fullName = `${p.first_name} ${p.last_name}`.trim() || p.phone
    if (!window.confirm(`${fullName} аккаунтын толығымен жою керек пе? Бұл әрекетті кері қайтару мүмкін емес.`)) {
      return
    }
    setBusyId(p.id)
    try {
      const res = await fetch(`/api/passengers/${p.id}`, { method: 'DELETE' })
      if (res.ok) {
        setPassengers((prev) => prev.filter((x) => x.id !== p.id))
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Аты немесе телефон бойынша іздеу..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Аты</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Тіркелген күні</TableHead>
              <TableHead className="text-right">Сапарлар</TableHead>
              <TableHead className="text-right">Жалпы жұмсаған</TableHead>
              <TableHead className="text-right">Әрекет</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Жолаушылар табылмады
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.first_name} {p.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.phone}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateOnly(p.created_at)}
                  </TableCell>
                  <TableCell className="text-right">{p.total_trips ?? 0}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(p.total_spent ?? 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={p.is_blocked ? 'outline' : 'destructive'}
                        disabled={busyId === p.id}
                        onClick={() => toggleBlock(p)}
                      >
                        {p.is_blocked ? 'Белсендіру' : 'Бұғаттау'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === p.id}
                        onClick={() => deletePassenger(p)}
                      >
                        Жою
                      </Button>
                    </div>
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
