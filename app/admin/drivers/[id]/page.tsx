import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, Car, Star, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import { getDriver, getOrders } from '@/lib/queries'
import { formatCurrency, formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const driver = await getDriver(id)
  if (!driver) notFound()

  const driverOrders = (await getOrders()).filter(
    (o) => o.driver_phone === driver.phone
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Link href="/admin/drivers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {driver.first_name} {driver.last_name}
          </h1>
          <p className="text-sm text-muted-foreground">Жүргізуші профилі</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={driver.is_blocked ? 'blocked' : 'active'} />
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="trips">Сапарлар тарихы</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Телефон</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono">{driver.phone}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Машина</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{driver.car_name ?? '—'}</p>
                <p className="font-mono text-sm text-muted-foreground">
                  {driver.car_number ?? '—'} {driver.car_color ? `· ${driver.car_color}` : ''}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Рейтинг</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {driver.average_rating != null ? driver.average_rating.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {driver.total_trips ?? 0} сапар · {driver.reviews_count ?? 0} пікір
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Тіркелген күні</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{formatDate(driver.created_at)}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Сапарлар тарихы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Күні</TableHead>
                    <TableHead>Бағыт</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Баға</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        Сапарлар жоқ
                      </TableCell>
                    </TableRow>
                  ) : (
                    driverOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(o.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{o.pickup_address}</div>
                          <div className="text-xs text-muted-foreground">
                            → {o.dropoff_address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={o.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(o.price)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
