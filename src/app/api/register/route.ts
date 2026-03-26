import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { users, asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  naam: z.string().min(1, 'Naam is verplicht'),
  email: z.string().email('Ongeldig e-mailadres'),
  wachtwoord: z.string().min(1, 'Wachtwoord is verplicht'),
  rol: z.enum(['adoptant', 'asiel']).optional().default('adoptant'),
  postcode: z.string().optional(),
  asielNaam: z.string().optional(),
})

async function haalCoordinatenOp(postcode: string): Promise<{ stad: string; lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${postcode}&country=NL&format=json&limit=1&addressdetails=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PootGelukkig/1.0 (info@pootgelukkig.nl)' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.length) return null
    const adres = data[0].address ?? {}
    const stad = adres.city ?? adres.town ?? adres.village ?? adres.municipality ?? ''
    return { stad, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { naam, email, wachtwoord, rol, postcode, asielNaam } = parsed.data
    const hash = await bcrypt.hash(wachtwoord, 4)

    // Locatie ophalen via postcode
    const locatie = postcode ? await haalCoordinatenOp(postcode) : null

    // Asiel-record aanmaken (voor nieuwe asielen)
    let asielId: number | undefined

    if (rol === 'asiel' && asielNaam) {
      const [nieuwAsiel] = await db
        .insert(asielen)
        .values({
          naam: asielNaam,
          stad: locatie?.stad ?? '',
          regio: '',
          postcode: postcode ?? null,
          lat: locatie?.lat ?? null,
          lng: locatie?.lng ?? null,
        })
        .returning({ id: asielen.id })

      asielId = nieuwAsiel?.id
    }

    // Gebruiker aanmaken of bijwerken
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    const locatieVelden = postcode ? { postcode, stad: locatie?.stad ?? undefined } : {}

    let newUser
    if (existing) {
      const [updated] = await db
        .update(users)
        .set({ naam, wachtwoordHash: hash, rol, ...locatieVelden, ...(asielId ? { asielId } : {}) })
        .where(eq(users.email, email.toLowerCase()))
        .returning({ id: users.id, naam: users.naam, email: users.email })
      newUser = updated
    } else {
      const [inserted] = await db
        .insert(users)
        .values({ naam, email: email.toLowerCase(), wachtwoordHash: hash, rol, ...locatieVelden, asielId: asielId ?? null })
        .returning({ id: users.id, naam: users.naam, email: users.email })
      newUser = inserted
    }

    return NextResponse.json({ data: newUser }, { status: 201 })
  } catch (err) {
    console.error('Registratie fout:', err)
    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het opnieuw.' },
      { status: 500 }
    )
  }
}
