// Shared database types.
// NOTE: Column names are best-effort guesses based on typical ride-hailing
// schemas. If your Supabase tables use different names, update them here and
// the queries will compile/type-check again.

export type DriverStatus = 'active' | 'pending' | 'blocked' | 'inactive'
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface Driver {
  id: string
  full_name: string
  phone: string
  car_brand: string | null
  car_model: string | null
  car_number: string | null
  status: DriverStatus
  rating: number | null
  total_trips: number
  is_verified: boolean
  avatar_url: string | null
  bank_details: string | null
  documents: string[] | null
  created_at: string
}

export interface Passenger {
  id: string
  full_name: string
  phone: string
  total_trips: number
  total_spent: number
  is_blocked: boolean
  created_at: string
}

export interface Order {
  id: string
  passenger_id: string
  driver_id: string | null
  pickup_address: string
  dropoff_address: string
  status: OrderStatus
  price: number
  created_at: string
  completed_at: string | null
  // Optional realtime location data
  driver_lat?: number | null
  driver_lng?: number | null
}

export interface Payment {
  id: string
  driver_id: string
  period_start: string
  period_end: string
  total_trips: number
  gross_amount: number
  commission_percent: number
  net_amount: number
  status: PaymentStatus
  paid_at: string | null
  created_at: string
}

export interface AdminSetting {
  key: string
  value: string
  updated_at?: string
}
