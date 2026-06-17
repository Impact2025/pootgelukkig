import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { asielen } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { auth } from '@/auth'
import { stuurUitnodigingAsiel } from '@/lib/email'

export const dynamic = 'force-dynamic'

// GET: alle nieuw geïmporteerde asielen die nog niet benaderd zijn
export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }
  const entries = await db
    .select()
    .from(asielen)
    .where(eq(asielen.wervingStatus, 'nieuw'))
    .orderBy(asielen.regio, asielen.naam)
  return NextResponse.json({ data: entries })
}

// POST: uitnodigen of overslaan van geselecteerde asielen
// body: { ids: number[], actie: 'uitnodigen' | 'overslaan' }
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = (await req.json()) as { ids?: number[]; actie?: string }
  const ids = Array.isArray(body.ids) ? body.ids.filter((n) => Number.isInteger(n)) : []
  const actie = body.actie

  if (ids.length === 0) {
    return NextResponse.json({ error: 'Geen asielen geselecteerd' }, { status: 400 })
  }

  // Overslaan: markeren als overgeslagen, niet mailen
  if (actie === 'overslaan') {
    await db
      .update(asielen)
      .set({ wervingStatus: 'overgeslagen' })
      .where(inArray(asielen.id, ids))
    return NextResponse.json({ ok: true, overgeslagen: ids.length })
  }

  if (actie !== 'uitnodigen') {
    return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 })
  }

  // Uitnodigen: alleen asielen die nog op 'nieuw' staan en een e-mailadres hebben
  const teBenaderen = await db
    .select()
    .from(asielen)
    .where(inArray(asielen.id, ids))

  let verzonden = 0
  const mislukt: Array<{ id: number; naam: string; reden: string }> = []

  for (const asiel of teBenaderen) {
    if (asiel.wervingStatus !== 'nieuw') continue
    if (!asiel.email) {
      mislukt.push({ id: asiel.id, naam: asiel.naam, reden: 'Geen e-mailadres' })
      continue
    }

    const res = await stuurUitnodigingAsiel({
      asielEmail: asiel.email,
      asielNaam: asiel.naam,
      stad: asiel.stad,
      asielId: asiel.id,
    })

    if (res.ok) {
      await db
        .update(asielen)
        .set({ wervingStatus: 'uitgenodigd', uitnodigingVerstuurdOp: new Date() })
        .where(eq(asielen.id, asiel.id))
      verzonden++
    } else {
      mislukt.push({ id: asiel.id, naam: asiel.naam, reden: 'Versturen mislukt' })
    }
  }

  return NextResponse.json({ ok: true, verzonden, mislukt })
}
