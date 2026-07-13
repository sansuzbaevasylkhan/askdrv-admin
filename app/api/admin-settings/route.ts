import { NextResponse } from 'next/server'
import { setAdminSetting } from '@/lib/queries'

export async function POST(req: Request) {
  const body = (await req.json()) as { key?: string; value?: string }
  if (!body.key || typeof body.value !== 'string') {
    return NextResponse.json(
      { error: 'key and value required' },
      { status: 400 }
    )
  }
  try {
    await setAdminSetting(body.key, body.value)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown' },
      { status: 500 }
    )
  }
}
