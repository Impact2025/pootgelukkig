import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { dieren, asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const soort = searchParams.get('soort')
    const asielIdParam = searchParams.get('asielId')

    const beschikbareDieren = await db
      .select({
        id: dieren.id,
        naam: dieren.naam,
        soort: dieren.soort,
        ras: dieren.ras,
        leeftijdJaren: dieren.leeftijdJaren,
        geslacht: dieren.geslacht,
        hoofdFotoUrl: dieren.hoofdFotoUrl,
        verhaal: dieren.verhaal,
        gedragsProfiel: dieren.gedragsProfiel,
        medischPaspoort: dieren.medischPaspoort,
        status: dieren.status,
        asielNaam: asielen.naam,
        asielStad: asielen.stad,
      })
      .from(dieren)
      .leftJoin(asielen, eq(dieren.asielId, asielen.id))
      .where(eq(dieren.status, 'beschikbaar'))

    const gefilterd = beschikbareDieren.filter((d) => {
      if (soort && d.soort !== soort) return false
      if (asielIdParam && d.id !== parseInt(asielIdParam)) return false
      return true
    })

    return NextResponse.json({ data: gefilterd })
  } catch (error) {
    console.error('Animals GET fout:', error)
    return NextResponse.json({ error: 'Kon dieren niet ophalen' }, { status: 500 })
  }
}

const dierSchema = z.object({
  asielId: z.number().int().positive(),
  naam: z.string().min(1),
  soort: z.enum(['hond', 'kat', 'vogel', 'konijn', 'cavia', 'hamster', 'overig']),
  ras: z.string().nullable().optional(),
  leeftijdJaren: z.number().int().min(0).max(30).nullable().optional(),
  geslacht: z.string().nullable().optional(),
  verhaal: z.string().nullable().optional(),
  hoofdFotoUrl: z.string().url().nullable().optional(),
  gedragsProfiel: z
    .object({
      energieNiveau: z.enum(['laag', 'normaal', 'hoog', 'zeer_hoog']),
      kindvriendelijk: z.boolean(),
      katVriendelijk: z.boolean(),
      hondenVriendelijk: z.boolean(),
      alleenThuis: z.enum(['goed', 'matig', 'slecht']),
      trainbaarheid: z.enum(['laag', 'normaal', 'hoog']),
      blaffen: z.enum(['weinig', 'normaal', 'veel']),
      speelsheid: z.enum(['laag', 'normaal', 'hoog']),
      tags: z.array(z.string()),
    })
    .nullable()
    .optional(),
  medischPaspoort: z
    .object({
      gevaccineerd: z.boolean(),
      gecastreerd: z.boolean(),
      gechippt: z.boolean(),
      chipNummer: z.string().nullable().default(null),
      allergieën: z.array(z.string()),
    })
    .nullable()
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = dierSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const [nieuwDier] = await db
      .insert(dieren)
      .values({
        asielId: parsed.data.asielId,
        naam: parsed.data.naam,
        soort: parsed.data.soort,
        ras: parsed.data.ras ?? null,
        leeftijdJaren: parsed.data.leeftijdJaren ?? null,
        geslacht: parsed.data.geslacht ?? null,
        verhaal: parsed.data.verhaal ?? null,
        hoofdFotoUrl: parsed.data.hoofdFotoUrl ?? null,
        gedragsProfiel: parsed.data.gedragsProfiel ?? null,
        medischPaspoort: parsed.data.medischPaspoort ?? null,
      })
      .returning()

    return NextResponse.json({ data: nieuwDier }, { status: 201 })
  } catch (error) {
    console.error('Animals POST fout:', error)
    return NextResponse.json({ error: 'Kon dier niet opslaan' }, { status: 500 })
  }
}
