import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { organisaties } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { auth } from '@/auth'
import { stuurUitnodigingAsielV2 } from '@/lib/email'

export const dynamic = 'force-dynamic'

// GET: alle nieuw geïmporteerde organisaties die nog niet benaderd zijn
export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }
  const entries = await db
    .select()
    .from(organisaties)
    .where(eq(organisaties.wervingStatus, 'nieuw'))
    .orderBy(organisaties.naam)
  return NextResponse.json({ data: entries })
}

// POST: uitnodigen of overslaan van geselecteerde organisaties
// body: { ids: string[], actie: 'uitnodigen' | 'overslaan' }
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = (await req.json()) as { ids?: string[]; actie?: string }
  const ids = Array.isArray(body.ids) ? body.ids.filter((n) => typeof n === 'string' && n.length > 0) : []
  const actie = body.actie

  if (ids.length === 0) {
    return NextResponse.json({ error: 'Geen organisaties geselecteerd' }, { status: 400 })
  }

  // Overslaan: markeren als overgeslagen, niet mailen
  if (actie === 'overslaan') {
    await db
      .update(organisaties)
      .set({ wervingStatus: 'overgeslagen' })
      .where(inArray(organisaties.id, ids))
    return NextResponse.json({ ok: true, overgeslagen: ids.length })
  }

  if (actie !== 'uitnodigen') {
    return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 })
  }

  // Uitnodigen: alleen organisaties die nog op 'nieuw' staan en een e-mailadres hebben
  const teBenaderen = await db
    .select()
    .from(organisaties)
    .where(inArray(organisaties.id, ids))

  let verzonden = 0
  const mislukt: Array<{ id: string; naam: string; reden: string }> = []

  for (const organisatie of teBenaderen) {
    if (organisatie.wervingStatus !== 'nieuw') continue
    if (!organisatie.contactEmail) {
      mislukt.push({ id: organisatie.id, naam: organisatie.naam, reden: 'Geen e-mailadres' })
      continue
    }

    const res = await stuurUitnodigingAsielV2({
      asielEmail: organisatie.contactEmail,
      asielNaam: organisatie.naam,
      stad: '',
      organisatieId: organisatie.id,
    })

    if (res.ok) {
      await db
        .update(organisaties)
        .set({ wervingStatus: 'uitgenodigd', uitnodigingVerstuurdOp: new Date() })
        .where(eq(organisaties.id, organisatie.id))
      verzonden++
    } else {
      mislukt.push({ id: organisatie.id, naam: organisatie.naam, reden: 'Versturen mislukt' })
    }
  }

  return NextResponse.json({ ok: true, verzonden, mislukt })
}
