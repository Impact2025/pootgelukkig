import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// POST /api/asielen/aanmelden — nieuw asiel meldt zichzelf aan via de start-pagina
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    naam?: string
    email?: string
    telefoon?: string | null
  }

  const naam = body.naam?.trim()
  const email = body.email?.trim()?.toLowerCase()

  if (!naam || !email) {
    return NextResponse.json({ error: 'Naam en e-mailadres zijn verplicht' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 })
  }

  // Check of het asiel al bestaat in de database (op email)
  const bestaand = await db
    .select({ id: asielen.id, wervingStatus: asielen.wervingStatus })
    .from(asielen)
    .where(eq(asielen.email, email))
    .limit(1)

  if (bestaand.length > 0) {
    const asiel = bestaand[0]
    if (asiel.wervingStatus === 'aangesloten') {
      return NextResponse.json({ error: 'Dit asiel is al geregistreerd. Log in via /auth/login.' }, { status: 409 })
    }
    // Update bestaand asiel naar 'aangesloten' als het nog in werving was
    await db
      .update(asielen)
      .set({ wervingStatus: 'aangesloten', naam, telefoon: body.telefoon ?? null })
      .where(eq(asielen.id, asiel.id))
    return NextResponse.json({ ok: true, nieuw: false })
  }

  // Nieuw asiel aanmaken
  await db.insert(asielen).values({
    naam,
    email,
    telefoon: body.telefoon ?? null,
    wervingStatus: 'aangesloten',
    bron: 'zelf-aanmelding',
    regio: '', // wordt later gevuld
    stad: '',  // wordt later gevuld
  })

  return NextResponse.json({ ok: true, nieuw: true })
}
