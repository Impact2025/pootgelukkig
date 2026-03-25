import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { adopties, dieren, users, asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { chatCompletion } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const adoptieId = parseInt(id)
  if (isNaN(adoptieId)) return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 })

  // Ophalen adoptiedata
  const [adoptieData] = await db
    .select({
      id: adopties.id,
      adoptieDatum: adopties.adoptieDatum,
      aangevraagdOp: adopties.aangevraagdOp,
      userName: users.naam,
      userEmail: users.email,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierRas: dieren.ras,
      leeftijdJaren: dieren.leeftijdJaren,
      medischPaspoort: dieren.medischPaspoort,
      asielNaam: asielen.naam,
      asielAdres: asielen.adres,
      asielEmail: asielen.email,
      asielTelefoon: asielen.telefoon,
    })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .innerJoin(users, eq(adopties.userId, users.id))
    .innerJoin(asielen, eq(adopties.asielId, asielen.id))
    .where(eq(adopties.id, adoptieId))
    .limit(1)

  if (!adoptieData) {
    return NextResponse.json({ error: 'Adoptie niet gevonden' }, { status: 404 })
  }

  const datum = new Date(adoptieData.adoptieDatum ?? adoptieData.aangevraagdOp)
    .toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  const chipNummer = adoptieData.medischPaspoort?.chipNummer ?? 'onbekend'
  const geboortejaar = adoptieData.leeftijdJaren
    ? new Date().getFullYear() - adoptieData.leeftijdJaren
    : 'onbekend'

  const prompt = `Genereer een professioneel adoptiecontract voor een Nederlands dierenasiel.
Gebruik de volgende gegevens en maak een volledig juridisch correct contract in het Nederlands.

Asiel: ${adoptieData.asielNaam}, ${adoptieData.asielAdres ?? 'adres onbekend'}
Dier: ${adoptieData.dierNaam}, ${adoptieData.dierSoort}, ${adoptieData.dierRas ?? 'ras onbekend'}, geboortejaar ca. ${geboortejaar}, chipnummer: ${chipNummer}
Adoptant: ${adoptieData.userName}, ${adoptieData.userEmail}, adres onbekend
Datum: ${datum}
Adoptiebijdrage: standaard tarieven

Verplichte clausules:
1. Identificatiegegevens dier en adoptant
2. Verplichtingen adoptant (dierenwelzijn, chip overschrijving binnen 30 dagen)
3. Terugname verplichting (adoptant moet dier teruggeven aan asiel, niet doorplaatsen)
4. Verbod op gebruik als fokdier (tenzij anders overeengekomen)
5. Recht op huisbezoek door asiel eerste 6 maanden
6. Aansprakelijkheidsclausule
7. Handtekeningvelden

Return ONLY clean HTML (no markdown, no \`\`\`html wrapper). Use inline styles for professional formatting. Black text on white background. Include header with shelter logo placeholder.`

  const html = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { maxTokens: 3000 }
  )

  return NextResponse.json({ data: { html } })
}
