import { NextResponse } from 'next/server'
import { setPassengerBlocked } from '@/lib/queries'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await req.json()) as { blocked?: boolean }
  if (typeof body.blocked !== 'boolean') {
    return NextResponse.json({ error: 'blocked required' }, { status: 400 })
  }
  try {
    await setPassengerBlocked(id, body.blocked)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    )
  }
}
