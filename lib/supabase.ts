import { createClient } from '@supabase/supabase-js'

// Support both Next.js (NEXT_PUBLIC_) and Expo (EXPO_PUBLIC_) env prefixes.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL!

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or EXPO_PUBLIC_* equivalents) in .env.local.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)