import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { organisaties, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

function slugify(naam: string): string {
  return naam
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 140) || `organisatie-${Date.now()}`
}

// POST /api/asielen/aanmelden — nieuwe organisatie meldt zichzelf aan via de start-pagina.
// Maakt meteen een inlogbaar account aan (rol 'asiel') zodat de gebruiker direct doorkan
// naar de chat-onboarding (/admin/onboarding) — geen aparte "wacht op e-mail"-stap meer nodig.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    naam?: string
    email?: string
    telefoon?: string | null
    wachtwoord?: string
  }

  const naam = body.naam?.trim()
  const email = body.email?.trim()?.toLowerCase()
  const wachtwoord = body.wachtwoord ?? ''

  if (!naam || !email) {
    return NextResponse.json({ error: 'Naam en e-mailadres zijn verplicht' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
  }
  if (wachtwoord.length < 8) {
    return NextResponse.json({ error: 'Wachtwoord moet minimaal 8 tekens zijn' }, { status: 400 })
  }

  const bestaandeGebruiker = await db
    .select({ id: users.id, wachtwoordHash: users.wachtwoordHash, organisatieId: users.organisatieId })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (bestaandeGebruiker.length > 0 && bestaandeGebruiker[0].wachtwoordHash) {
    return NextResponse.json({ error: 'Dit e-mailadres is al geregistreerd. Log in via /auth/login.' }, { status: 409 })
  }

  // Organisatie ophalen of aanmaken
  const bestaandeOrganisatie = await db
    .select({ id: organisaties.id, wervingStatus: organisaties.wervingStatus })
    .from(organisaties)
    .where(eq(organisaties.contactEmail, email))
    .limit(1)

  let organisatieId: string

  if (bestaandeOrganisatie.length > 0) {
    organisatieId = bestaandeOrganisatie[0].id
    await db
      .update(organisaties)
      .set({ wervingStatus: 'aangesloten', naam, telefoon: body.telefoon ?? null, updatedAt: new Date() })
      .where(eq(organisaties.id, organisatieId))
  } else {
    const [nieuw] = await db
      .insert(organisaties)
      .values({
        naam,
        slug: slugify(naam),
        contactEmail: email,
        telefoon: body.telefoon ?? null,
        wervingStatus: 'aangesloten',
        bron: 'zelf-aanmelding',
        status: 'proef',
      })
      .returning({ id: organisaties.id })
    organisatieId = nieuw.id
  }

  const wachtwoordHash = await bcrypt.hash(wachtwoord, 10)

  if (bestaandeGebruiker.length > 0) {
    // Bestaat al (bv. eerder aangemaakt zonder wachtwoord) — activeer het account alsnog.
    await db
      .update(users)
      .set({ naam, wachtwoordHash, organisatieId, rol: 'asiel', bijgewerktOp: new Date() })
      .where(eq(users.id, bestaandeGebruiker[0].id))
  } else {
    await db.insert(users).values({
      naam,
      email,
      wachtwoordHash,
      rol: 'asiel',
      organisatieId,
      profielVoltooid: false,
    })
  }

  return NextResponse.json({ ok: true })
}
