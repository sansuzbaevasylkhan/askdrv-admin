-- Sattilik admin panel — supplementary Supabase tables
-- Run this in the Supabase SQL editor for the project referenced by
-- NEXT_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL.

-- ============================================================================
-- payments: payouts owed to drivers for completed trips in a period.
-- ============================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  period_start date not null,
  period_end date not null,
  total_trips integer not null default 0,
  gross_amount numeric(12, 2) not null default 0,
  commission_percent numeric(5, 2) not null default 10,
  net_amount numeric(12, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists payments_driver_id_idx on public.payments (driver_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists payments_period_idx on public.payments (period_start, period_end);

-- ============================================================================
-- admin_settings: simple key/value store for admin-configurable values
-- (commission percent, etc.).
-- ============================================================================
create table if not exists public.admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Seed default commission if missing.
insert into public.admin_settings (key, value)
values ('commission_percent', '10')
on conflict (key) do nothing;

-- ============================================================================
-- Realtime: emit change events for the orders table so the live tracking
-- page can subscribe via supabase.channel('active-trips').
-- ============================================================================
-- If your project does not already have realtime enabled for `orders`:
alter publication supabase_realtime add table public.orders;
