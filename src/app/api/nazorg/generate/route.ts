import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { adopties, dieren, nazorgDagen } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { chatCompletion } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { adoptionId } = await request.json()
  const userId = parseInt(session.user.id)

  // Verificeer eigenaarschap
  const [adoptie] = await db
    .select({
      id: adopties.id,
      dierId: adopties.dierId,
      adoptieDatum: adopties.adoptieDatum,
    })
    .from(adopties)
    .where(and(eq(adopties.id, adoptionId), eq(adopties.userId, userId)))
    .limit(1)

  if (!adoptie) return NextResponse.json({ error: 'Adoptie niet gevonden' }, { status: 404 })

  // Check of al gegenereerd
  const bestaand = await db
    .select({ id: nazorgDagen.id })
    .from(nazorgDagen)
    .where(eq(nazorgDagen.adoptieId, adoptionId))
    .limit(1)

  if (bestaand.length > 0) {
    return NextResponse.json({ message: 'Al gegenereerd' })
  }

  // Dierinfo ophalen
  const [dier] = await db
    .select({ naam: dieren.naam, soort: dieren.soort, ras: dieren.ras, gedragsProfiel: dieren.gedragsProfiel })
    .from(dieren)
    .where(eq(dieren.id, adoptie.dierId))
    .limit(1)

  if (!dier) return NextResponse.json({ error: 'Dier niet gevonden' }, { status: 404 })

  // AI: genereer eerste 14 dagen gepersonaliseerd
  let dagData: {
    dag: number
    focusOnderwerp: string
    beschrijving: string
    tips: string[]
    checklist: { item: string; voltooid: boolean }[]
  }[] = []

  try {
    const prompt = `Je bent een expert dierengedragspsycholoog. Genereer een nazorgplan voor de eerste 14 dagen na adoptie.

Dier: ${dier.naam} (${dier.ras ?? dier.soort})
Gedragsprofiel: ${JSON.stringify(dier.gedragsProfiel ?? {})}

Geef voor elke dag (1 t/m 14) een JSON object. Antwoord ALLEEN met een JSON array, geen extra tekst:
[
  {
    "dag": 1,
    "focusOnderwerp": "korte titel (max 30 tekens)",
    "beschrijving": "wat te verwachten vandaag (2-3 zinnen, gebruik de naam ${dier.naam})",
    "tips": ["tip 1", "tip 2", "tip 3"],
    "checklist": [
      {"item": "taak beschrijving", "voltooid": false},
      {"item": "taak beschrijving", "voltooid": false},
      {"item": "taak beschrijving", "voltooid": false}
    ]
  }
]

Richtlijn: dag 1-3 = ontzetten en rust, dag 4-7 = eerste verkenning, dag 8-14 = routines bouwen.
Alles in het NEDERLANDS. Wees specifiek voor dit dier.`

    const antwoord = await chatCompletion(
      [{ role: 'user', content: prompt }],
      { maxTokens: 4000, meta: { module: 'nazorg' } }
    )

    const match = antwoord.match(/\[[\s\S]*\]/)
    if (match) {
      dagData = JSON.parse(match[0])
    }
  } catch {
    // Fallback naar templates als AI faalt
  }

  // Templates voor dagen zonder AI data
  const TEMPLATES = [
    { focusOnderwerp: 'Rust & Veiligheid', beschrijving: `${dier.naam} heeft tijd nodig om te settelen. Geef ruimte en rust.`, tips: ['Zorg voor een rustige plek', 'Beperk bezoek de eerste dagen', 'Laat het dier zelf verkennen'], checklist: [{ item: 'Rustplek ingericht', voltooid: false }, { item: 'Voerbak gevuld', voltooid: false }, { item: 'Waterbak gevuld', voltooid: false }] },
    { focusOnderwerp: 'Eerste Verkenning', beschrijving: `${dier.naam} begint het huis te ontdekken. Begeleid rustig.`, tips: ['Loop samen door het huis', 'Beloon rustig gedrag', 'Wees consistent'], checklist: [{ item: 'Huis verkend', voltooid: false }, { item: 'Buiten geweest (indien van toepassing)', voltooid: false }, { item: 'Naam geleerd', voltooid: false }] },
    { focusOnderwerp: 'Routines Opbouwen', beschrijving: `Consistentie is key. Eet- en slaaptijden structureren.`, tips: ['Hou vaste eet-tijden aan', 'Zelfde route voor uitlaten', 'Rustig avondritueel'], checklist: [{ item: 'Voerschema gevolgd', voltooid: false }, { item: 'Bewegingsmoment gehad', voltooid: false }, { item: 'Rustige avond gecreëerd', voltooid: false }] },
  ]

  // Alle 100 dagen aanmaken
  const teInvoegen = []
  for (let dag = 1; dag <= 100; dag++) {
    const aiDag = dagData.find((d) => d.dag === dag)
    const template = TEMPLATES[(dag - 1) % TEMPLATES.length]
    const bron = aiDag ?? template

    teInvoegen.push({
      adoptieId: adoptionId,
      dagNummer: dag,
      focusOnderwerp: bron.focusOnderwerp,
      beschrijving: bron.beschrijving,
      tips: bron.tips,
      checklist: bron.checklist,
    })
  }

  // Batch insert (50 tegelijk)
  for (let i = 0; i < teInvoegen.length; i += 50) {
    await db.insert(nazorgDagen).values(teInvoegen.slice(i, i + 50))
  }

  return NextResponse.json({ success: true, aantalDagen: teInvoegen.length })
}
