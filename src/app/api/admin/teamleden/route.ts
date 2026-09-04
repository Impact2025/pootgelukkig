import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users, teamUitnodigingen, organisaties } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import crypto from 'node:crypto'
import { z } from 'zod'
import { stuurTeamUitnodiging } from '@/lib/email'

export const dynamic = 'force-dynamic'

const GELDIG_DAGEN = 7

// GET — huidige teamleden + openstaande uitnodigingen van de eigen organisatie.
export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ teamleden: [], uitnodigingen: [] })

  const [teamleden, uitnodigingen] = await Promise.all([
    db
      .select({ id: users.id, naam: users.naam, email: users.email, aangemeldOp: users.aangemeldOp })
      .from(users)
      .where(eq(users.organisatieId, organisatieId)),
    db
      .select({ id: teamUitnodigingen.id, email: teamUitnodigingen.email, aangemaaktOp: teamUitnodigingen.aangemaaktOp, verlooptOp: teamUitnodigingen.verlooptOp })
      .from(teamUitnodigingen)
      .where(and(eq(teamUitnodigingen.organisatieId, organisatieId), eq(teamUitnodigingen.status, 'open'), gt(teamUitnodigingen.verlooptOp, new Date()))),
  ])

  return NextResponse.json({ teamleden, uitnodigingen, huidigeGebruikerId: Number(session.user.id) })
}

const uitnodigSchema = z.object({ email: z.string().email('Ongeldig e-mailadres') })

// POST — nodig een nieuw teamlid uit per e-mail.
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }
  const parsed = uitnodigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ fout: parsed.error.errors[0]?.message ?? 'Ongeldige invoer' }, { status: 400 })
  }
  const email = parsed.data.email.trim().toLowerCase()

  const [bestaandeGebruiker] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (bestaandeGebruiker) {
    return NextResponse.json({ fout: 'Er bestaat al een account met dit e-mailadres' }, { status: 409 })
  }

  const [openstaandeUitnodiging] = await db
    .select({ id: teamUitnodigingen.id })
    .from(teamUitnodigingen)
    .where(and(eq(teamUitnodigingen.organisatieId, organisatieId), eq(teamUitnodigingen.email, email), eq(teamUitnodigingen.status, 'open')))
    .limit(1)
  if (openstaandeUitnodiging) {
    return NextResponse.json({ fout: 'Dit e-mailadres is al uitgenodigd' }, { status: 409 })
  }

  const [organisatie] = await db.select({ naam: organisaties.naam }).from(organisaties).where(eq(organisaties.id, organisatieId)).limit(1)
  if (!organisatie) return NextResponse.json({ fout: 'Organisatie niet gevonden' }, { status: 404 })

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const verlooptOp = new Date(Date.now() + GELDIG_DAGEN * 24 * 60 * 60 * 1000)

  const [uitnodiging] = await db
    .insert(teamUitnodigingen)
    .values({
      organisatieId,
      email,
      tokenHash,
      uitgenodigdDoor: Number(session.user.id),
      verlooptOp,
    })
    .returning({ id: teamUitnodigingen.id, email: teamUitnodigingen.email, aangemaaktOp: teamUitnodigingen.aangemaaktOp, verlooptOp: teamUitnodigingen.verlooptOp })

  const mailResultaat = await stuurTeamUitnodiging({
    email,
    organisatieNaam: organisatie.naam,
    uitgenodigdDoorNaam: session.user.name ?? 'Een collega',
    token,
    geldigDagen: GELDIG_DAGEN,
  })

  return NextResponse.json({ uitnodiging, mailVerzonden: mailResultaat.ok }, { status: 201 })
}
