import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { clienten, dossiers } from '@/lib/db/schema'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const intakeSchema = z.object({
  voornaam: z.string().min(1, 'Voornaam is verplicht'),
  achternaam: z.string().min(1, 'Achternaam is verplicht'),
  email: z.string().email().optional().or(z.literal('')),
  telefoon: z.string().optional(),
  hulpvraagOmschrijving: z.string().min(1, 'Hulpvraag is verplicht'),
  categorie: z.enum(['wmo', 'participatie', 'jeugd', 'reintegratie', 'overig']),
  gewensteOndersteuning: z.string().optional(),
  situatieOmschrijving: z.string().optional(),
})

// POST /api/intake — nieuw cliëntintake: schrijft een cliënt + een dossier (status 'intake') weg.
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) {
    return NextResponse.json({ fout: 'Geen organisatie gekoppeld aan dit account' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }

  const parsed = intakeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ fout: parsed.error.errors[0]?.message ?? 'Ongeldige invoer' }, { status: 400 })
  }
  const d = parsed.data

  try {
    const [client] = await db
      .insert(clienten)
      .values({
        organisatieId,
        voornaam: d.voornaam,
        achternaam: d.achternaam,
        email: d.email || null,
        telefoon: d.telefoon || null,
        hulpvraagOmschrijving: d.hulpvraagOmschrijving,
        profielData: d.gewensteOndersteuning ? { gewensteOndersteuning: d.gewensteOndersteuning } : {},
        status: 'aangemeld',
      })
      .returning()

    const dossierNummer = `${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`
    const [dossier] = await db
      .insert(dossiers)
      .values({
        organisatieId,
        dossierNummer,
        titel: `Intake ${d.voornaam} ${d.achternaam}`,
        categorie: d.categorie,
        status: 'intake',
        samenvatting: d.situatieOmschrijving || d.hulpvraagOmschrijving,
        intakeData: {
          hulpvraag: d.hulpvraagOmschrijving,
          gewensteOndersteuning: d.gewensteOndersteuning ?? null,
          situatieOmschrijving: d.situatieOmschrijving ?? null,
        },
        vertrouwelijk: true,
      })
      .returning()

    return NextResponse.json({ ok: true, client, dossier }, { status: 201 })
  } catch (error) {
    console.error('Intake opslaan mislukt:', error)
    return NextResponse.json({ fout: 'Opslaan mislukt. Probeer opnieuw.' }, { status: 500 })
  }
}
