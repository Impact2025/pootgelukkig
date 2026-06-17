import { NextResponse } from 'next/server'
import { importeerAsielen } from '@/lib/asielen-import'

export const dynamic = 'force-dynamic'

// Vercel Cron: 1e van de maand om 06:00
// vercel.json: { "crons": [{ "path": "/api/cron/asielen-import", "schedule": "0 6 1 * *" }] }
//
// Zoekt alle Nederlandse asielen op uit de samengestelde bron en zet nieuwe
// asielen in de database met status 'nieuw'. Er gaat GEEN mail uit: dat gebeurt
// pas na handmatige goedkeuring via /admin/asielen-werving.

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resultaat = await importeerAsielen()
    return NextResponse.json({ ok: true, ...resultaat })
  } catch (err) {
    console.error('[Cron asielen-import] Mislukt:', err)
    return NextResponse.json({ ok: false, error: 'Import mislukt' }, { status: 500 })
  }
}
