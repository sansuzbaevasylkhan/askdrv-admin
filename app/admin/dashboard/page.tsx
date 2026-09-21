import Link from 'next/link'
import { Car, Map as MapIcon, Wallet, Star, Clock, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { getDashboardStats, getRecentOrders, getRecentDrivers } from '@/lib/queries'
import { formatCurrency, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, recentOrders, recentDrivers] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(10),
    getRecentDrivers(10),
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Жалпы шолу — бүгінгі көрсеткіштер мен соңғы белсенділік
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Белсенді жүргізушілер"
          value={stats.activeDrivers}
          icon={Car}
          description={`${stats.blockedDrivers} бұғатталған`}
        />
        <StatCard
          title="Бүгінгі сапарлар"
          value={stats.todayOrders}
          icon={MapIcon}
          description="Соңғы 24 сағат"
        />
        <StatCard
          title="Бүгінгі табыс"
          value={formatCurrency(stats.todayRevenue)}
          icon={Wallet}
          description="Аяқталған сапарлардан"
        />
        <StatCard
          title="Орташа рейтинг"
          value={stats.avgRating.toFixed(1)}
          icon={Star}
          description="Барлық жүргізушілер бойынша"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Соңғы 10 сапар</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/admin/orders">Барлығы →</Link>}
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Статус</TableHead>
                  <TableHead>Жолаушы</TableHead>
                  <TableHead>Жүргізуші</TableHead>
                  <TableHead className="text-right">Баға</TableHead>
                  <TableHead>Уақыт</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Деректер жоқ
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-xs">
                        {o.passenger_first_name} {o.passenger_last_name}
                      </TableCell>
                      <TableCell className="text-xs">
                        {o.driver_first_name
                          ? `${o.driver_first_name} ${o.driver_last_name ?? ''}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(o.price)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(o.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              Жаңа жүргізушілер
            </CardTitle>
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
              {stats.blockedDrivers} бұғатталған
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDrivers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Деректер жоқ</p>
              ) : (
                recentDrivers.map((d) => (
                  <Link
                    key={d.id}
                    href={`/admin/drivers/${d.id}`}
                    className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <div>
                      <div className="font-medium">{d.first_name} {d.last_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.phone}
                      </div>
                    </div>
                    <StatusBadge status={d.is_blocked ? 'blocked' : 'active'} />
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
