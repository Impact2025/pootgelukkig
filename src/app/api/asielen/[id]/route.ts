import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { organisaties } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id: organisatieId } = await params

  // Asiel-gebruikers mogen alleen hun eigen organisatie bewerken
  if (session.user.rol === 'asiel' && session.user.organisatieId !== organisatieId) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await request.json()
  const {
    naam, telefoon, website, contactEmail, kvkNummer,
    // Onboarding-profiel — hetzelfde profiel dat Noor tijdens het intakegesprek invult
    // (src/lib/ai/onboarding.ts), hier handmatig te corrigeren zonder het gesprek te heropenen.
    rechtsvorm, werkveldCategorieen, gemeenten, teamgrootte, vrijwilligersAantal, grootsteKnelpunt, toneOfVoice,
  } = body

  const updates: Record<string, unknown> = {}
  if (naam !== undefined) updates.naam = naam
  if (telefoon !== undefined) updates.telefoon = telefoon
  if (website !== undefined) updates.website = website
  if (contactEmail !== undefined) updates.contactEmail = contactEmail
  if (kvkNummer !== undefined) updates.kvkNummer = kvkNummer
  if (rechtsvorm !== undefined) updates.rechtsvorm = rechtsvorm
  if (Array.isArray(werkveldCategorieen)) updates.werkveldCategorieen = werkveldCategorieen
  if (Array.isArray(gemeenten)) updates.gemeenten = gemeenten
  if (teamgrootte !== undefined) updates.teamgrootte = teamgrootte === '' || teamgrootte === null ? null : Number(teamgrootte)
  if (vrijwilligersAantal !== undefined) updates.vrijwilligersAantal = vrijwilligersAantal === '' || vrijwilligersAantal === null ? null : Number(vrijwilligersAantal)
  if (grootsteKnelpunt !== undefined) updates.grootsteKnelpunt = grootsteKnelpunt
  if (toneOfVoice !== undefined) updates.toneOfVoice = toneOfVoice

  if (Object.keys(updates).length > 0) {
    updates.updatedAt = new Date()
    await db.update(organisaties).set(updates).where(eq(organisaties.id, organisatieId))
  }

  return NextResponse.json({ succes: true })
}
