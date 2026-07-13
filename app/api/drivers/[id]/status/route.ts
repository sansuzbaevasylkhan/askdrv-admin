import { NextResponse } from 'next/server'
import { setDriverStatus } from '@/lib/queries'
import type { DriverStatus } from '@/lib/types'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await req.json()) as { status?: DriverStatus }
  if (!body.status) {
    return NextResponse.json({ error: 'status required' }, { status: 400 })
  }
  try {
    await setDriverStatus(id, body.status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    )
  }
}
