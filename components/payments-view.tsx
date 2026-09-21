'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateOnly } from '@/lib/format'
import type { Payment } from '@/lib/types'

interface Props {
  initialPayments: Payment[]
  initialCommission: number
}

export function PaymentsView({ initialPayments, initialCommission }: Props) {
  const [payments, setPayments] = useState(initialPayments)
  const [commission, setCommission] = useState(String(initialCommission))
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  async function saveCommission() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'commission_percent', value: commission }),
      })
      if (res.ok) setSavedAt(new Date().toLocaleTimeString('ru-RU'))
    } finally {
      setSaving(false)
    }
  }

  async function markPaid(p: Payment) {
    setBusyId(p.id)
    try {
      const res = await fetch(`/api/payments/${p.id}/paid`, { method: 'POST' })
      if (res.ok) {
        setPayments((prev) =>
          prev.map((x) =>
            x.id === p.id
              ? { ...x, status: 'paid', paid_at: new Date().toISOString() }
              : x
          )
        )
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Төлемдер</h1>
        <p className="text-sm text-muted-foreground">
          Жүргізушілерге төленетін сомалар
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Комиссия пайызы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <Label className="text-xs">Пайыз (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
            </div>
            <Button onClick={saveCommission} disabled={saving}>
              {saving ? 'Сақталуда...' : 'Сақтау'}
            </Button>
            {savedAt ? (
              <span className="text-xs text-emerald-400">Сақталды: {savedAt}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Төлемдер тізімі</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Жүргізуші</TableHead>
                  <TableHead>Кезең</TableHead>
                  <TableHead className="text-right">Сапарлар</TableHead>
                  <TableHead className="text-right">Жалпы табыс</TableHead>
                  <TableHead className="text-right">Комиссия</TableHead>
                  <TableHead className="text-right">Таза сома</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Әрекет</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Төлемдер жоқ
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs">
                        {p.driver_name ?? p.driver_phone ?? p.driver_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateOnly(p.period_start)} — {formatDateOnly(p.period_end)}
                      </TableCell>
                      <TableCell className="text-right">{p.total_trips}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(p.gross_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.commission_percent}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(p.net_amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status !== 'paid' ? (
                          <Button
                            size="sm"
                            disabled={busyId === p.id}
                            onClick={() => markPaid(p)}
                          >
                            Төленді
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {formatDateOnly(p.paid_at)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
