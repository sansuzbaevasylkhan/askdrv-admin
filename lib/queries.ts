import { supabase } from './supabase'
import type {
  AdminSetting,
  Driver,
  Order,
  Passenger,
  Payment,
} from './types'
import { endOfDay, startOfDay } from './format'

// All queries are best-effort. If a table or column does not exist in your
// Supabase schema, Supabase returns an error and the caller renders an
// empty state. Adjust the column names below to match your real schema.

function logTableError(table: string, error: unknown) {
  // eslint-disable-next-line no-console
  console.warn(`[supabase] table "${table}" unavailable:`, error)
}

// ---------- Drivers ----------

export async function getDrivers(): Promise<Driver[]> {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    logTableError('drivers', error)
    return []
  }
  return (data ?? []) as Driver[]
}

export async function getDriver(id: string): Promise<Driver | null> {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    logTableError('drivers', error)
    return null
  }
  return (data as Driver | null) ?? null
}

export async function setDriverStatus(
  id: string,
  status: Driver['status']
): Promise<void> {
  const { error } = await supabase
    .from('drivers')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// ---------- Passengers ----------

export async function getPassengers(): Promise<Passenger[]> {
  const { data, error } = await supabase
    .from('passengers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    logTableError('passengers', error)
    return []
  }
  return (data ?? []) as Passenger[]
}

export async function setPassengerBlocked(
  id: string,
  isBlocked: boolean
): Promise<void> {
  const { error } = await supabase
    .from('passengers')
    .update({ is_blocked: isBlocked })
    .eq('id', id)
  if (error) throw error
}

// ---------- Orders ----------

export async function getOrders(filters?: {
  status?: Order['status']
  from?: string
  to?: string
}): Promise<Order[]> {
  let q = supabase.from('orders').select('*').order('created_at', {
    ascending: false,
  })
  if (filters?.status) q = q.eq('status', filters.status)
  if (filters?.from) q = q.gte('created_at', filters.from)
  if (filters?.to) q = q.lte('created_at', filters.to)
  const { data, error } = await q
  if (error) {
    logTableError('orders', error)
    return []
  }
  return (data ?? []) as Order[]
}

export async function getActiveOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['accepted', 'in_progress', 'pending'])
  if (error) {
    logTableError('orders', error)
    return []
  }
  return (data ?? []) as Order[]
}

// ---------- Dashboard stats ----------

export async function getDashboardStats() {
  const todayStart = startOfDay().toISOString()
  const todayEnd = endOfDay().toISOString()

  const [driversAll, pendingDrivers, todayOrders, completedToday, ratings] =
    await Promise.all([
      supabase
        .from('drivers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('drivers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd),
      supabase
        .from('orders')
        .select('price')
        .eq('status', 'completed')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd),
      supabase.from('drivers').select('rating').not('rating', 'is', null),
    ])

  // If drivers table is missing, count queries return errors we want to
  // surface in the console but not crash the dashboard.
  for (const r of [driversAll, pendingDrivers, ratings]) {
    if (r.error) logTableError('drivers', r.error)
  }
  for (const r of [todayOrders, completedToday]) {
    if (r.error) logTableError('orders', r.error)
  }

  const todayRevenue =
    completedToday.data?.reduce((sum, r) => sum + (r.price ?? 0), 0) ?? 0

  const ratingValues = (ratings.data ?? [])
    .map((r) => r.rating as number | null)
    .filter((v): v is number => typeof v === 'number')
  const avgRating = ratingValues.length
    ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
    : 0

  return {
    activeDrivers: driversAll.count ?? 0,
    pendingDrivers: pendingDrivers.count ?? 0,
    todayOrders: todayOrders.count ?? 0,
    todayRevenue,
    avgRating,
  }
}

export async function getRecentOrders(limit = 10): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    logTableError('orders', error)
    return []
  }
  return (data ?? []) as Order[]
}

export async function getRecentDrivers(limit = 10): Promise<Driver[]> {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    logTableError('drivers', error)
    return []
  }
  return (data ?? []) as Driver[]
}

// ---------- Statistics ----------

export async function getOrdersByPeriod(from: string, to: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, price, created_at, status, driver_id')
    .gte('created_at', from)
    .lte('created_at', to)
  if (error) {
    logTableError('orders', error)
    return []
  }
  return (data ?? []) as Pick<
    Order,
    'id' | 'price' | 'created_at' | 'status' | 'driver_id'
  >[]
}

// ---------- Payments ----------

export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('period_end', { ascending: false })
  if (error) {
    logTableError('payments', error)
    return []
  }
  return (data ?? []) as Payment[]
}

export async function markPaymentPaid(id: string): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ---------- Admin settings ----------

export async function getAdminSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  if (error) {
    // Treat missing table as "no value" so the admin page still works.
    return null
  }
  return (data as AdminSetting | null)?.value ?? null
}

export async function setAdminSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('admin_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
}
