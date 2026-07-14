import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dieren, asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { chatStream } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'

type Bericht = {
  rol: 'user' | 'assistant'
  inhoud: string
}

function formatteerOpeningstijden(
  ot: NonNullable<typeof asielen.$inferSelect.openingstijden>
): string {
  const dagen: Record<string, string> = {
    ma: 'Maandag',
    di: 'Dinsdag',
    wo: 'Woensdag',
    do: 'Donderdag',
    vr: 'Vrijdag',
    za: 'Zaterdag',
    zo: 'Zondag',
  }
  const regels = Object.entries(dagen).map(([key, naam]) => {
    const dag = ot[key as keyof typeof ot]
    if (!dag || typeof dag !== 'object' || !('open' in dag)) return null
    if (!dag.open) return `${naam}: Gesloten`
    return `${naam}: ${dag.van} – ${dag.tot}`
  }).filter(Boolean)

  if (ot.notitie) regels.push(`Opmerking: ${ot.notitie}`)
  return regels.join('\n')
}

function bouwSystemPrompt(
  asiel: typeof asielen.$inferSelect,
  dier: typeof dieren.$inferSelect | null,
  gebruikerNaam: string
): string {
  const openingstijdenTekst = asiel.openingstijden
    ? formatteerOpeningstijden(asiel.openingstijden)
    : 'Niet beschikbaar — bel het asiel voor actuele tijden.'

  const adoptieProcedure = asiel.asielConfig?.adoptieProcedure
  const procedureTekst = adoptieProcedure
    ? [
        adoptieProcedure.minimumLeeftijdAdoptant ? `Minimumleeftijd adoptant: ${adoptieProcedure.minimumLeeftijdAdoptant} jaar` : null,
        adoptieProcedure.tuinVereist ? 'Tuin vereist: ja' : null,
        adoptieProcedure.huisbezoekVereist ? 'Huisbezoek vereist: ja' : null,
        adoptieProcedure.wachttijdDagen ? `Wachttijd: ca. ${adoptieProcedure.wachttijdDagen} dagen` : null,
        adoptieProcedure.vereisten ? `Vereisten: ${adoptieProcedure.vereisten}` : null,
      ].filter(Boolean).join('\n')
    : null

  let dierSectie = ''
  if (dier) {
    const g = dier.gedragsProfiel
    const m = dier.medischPaspoort
    const leeftijd = dier.leeftijdJaren != null
      ? `${dier.leeftijdJaren} jaar${dier.leeftijdMaanden ? ` en ${dier.leeftijdMaanden} maanden` : ''}`
      : 'onbekend'

    dierSectie = `
DIER WAARVOOR DE BEZOEKER INTERESSE HEEFT:
  Naam: ${dier.naam}
  Soort: ${dier.soort}${dier.ras ? ` (${dier.ras})` : ''}
  Leeftijd: ${leeftijd}
  Geslacht: ${dier.geslacht ?? 'onbekend'}
  Gewicht: ${dier.gewichtKg ? `${dier.gewichtKg} kg` : 'onbekend'}
  Status: ${dier.status === 'beschikbaar' ? '✅ Beschikbaar voor adoptie' : dier.status === 'in_behandeling' ? '⏳ In behandeling' : dier.status === 'geadopteerd' ? '❌ Geadopteerd' : 'Niet beschikbaar'}
  Verhaal: ${dier.verhaal ?? 'Geen verhaal beschikbaar.'}
${g ? `  Gedrag:
    - Energieniveau: ${g.energieNiveau}
    - Kindvriendelijk: ${g.kindvriendelijk ? 'ja' : 'nee'}
    - Met katten: ${g.katVriendelijk ? 'ja' : 'nee'}
    - Met honden: ${g.hondenVriendelijk ? 'ja' : 'nee'}
    - Alleen thuis: ${g.alleenThuis}
    - Trainbaarheid: ${g.trainbaarheid}
    - Speelsheid: ${g.speelsheid}
    - Tags: ${g.tags?.join(', ') || 'geen'}` : ''}
${m ? `  Medisch:
    - Gevaccineerd: ${m.gevaccineerd ? 'ja' : 'nee'}
    - Gecastreerd: ${m.gecastreerd ? 'ja' : 'nee'}
    - Gechippt: ${m.gechippt ? 'ja' : 'nee'}
    - Aandoeningen: ${m.allergieën?.length ? m.allergieën.join(', ') : 'geen bekende'}` : ''}`
  }

  return `Je bent Dr. Poot — dierenwelzijn-expert en vriendelijke, behulpzame AI voor adoptanten van ${asiel.naam}.

Je helpt bezoekers met vragen over het asiel, dieren, het adoptieproces en praktische informatie.
Je spreekt met de warmte en deskundigheid van een dierenarts die het beste met dier én mens voorheeft, maar blijft beknopt en concreet. Antwoord altijd in het Nederlands.
Als je iets niet zeker weet, verwijs dan door naar het asiel.

ASIEL INFORMATIE:
  Naam: ${asiel.naam}
  Adres: ${asiel.adres ?? 'Niet beschikbaar'}${asiel.stad ? `, ${asiel.stad}` : ''}
  Telefoon: ${asiel.telefoon ?? 'Niet beschikbaar'}
  E-mail: ${asiel.email ?? 'Niet beschikbaar'}
  Website: ${asiel.website ?? 'Niet beschikbaar'}
  Beschrijving: ${asiel.beschrijving ?? 'Een liefdevol asiel voor dieren in nood.'}

OPENINGSTIJDEN:
${openingstijdenTekst}
${procedureTekst ? `\nADOPTIEPROCEDURE:\n${procedureTekst}` : ''}
${dierSectie}
BEZOEKER: ${gebruikerNaam}

Veelgestelde vragen die je kunt beantwoorden:
- Openingstijden en locatie
- Hoe verloopt de adoptie?
- Wat zijn de adoptieprocedure en kosten?
- Informatie over het specifieke dier (gedrag, gezondheid, karakter)
- Hoe een kennismakingsafspraak te maken
- Of een dier nog beschikbaar is
- Wat er nodig is om te adopteren`
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Niet ingelogd', { status: 401 })
  }

  let body: { berichten: Bericht[]; animalId?: number | string }
  try {
    body = await request.json() as { berichten: Bericht[]; animalId?: number | string }
  } catch {
    return new Response('Ongeldig verzoek', { status: 400 })
  }

  const { berichten, animalId } = body

  if (!berichten?.length) {
    return new Response('Geen berichten meegestuurd', { status: 400 })
  }

  // Haal dier op (als animalId gegeven)
  let dier: typeof dieren.$inferSelect | null = null
  let asiel: typeof asielen.$inferSelect | null = null

  try {
    if (animalId) {
      const dierId = typeof animalId === 'string' ? parseInt(animalId) : animalId
      if (!isNaN(dierId)) {
        const [gevondenDier] = await db
          .select()
          .from(dieren)
          .where(eq(dieren.id, dierId))
          .limit(1)

        if (gevondenDier) {
          dier = gevondenDier
          const [gevondenAsiel] = await db
            .select()
            .from(asielen)
            .where(eq(asielen.id, gevondenDier.asielId))
            .limit(1)
          asiel = gevondenAsiel ?? null
        }
      }
    }

    // Fallback: eerste actieve asiel als geen dier gevonden
    if (!asiel) {
      const [eersteAsiel] = await db
        .select()
        .from(asielen)
        .where(eq(asielen.actief, true))
        .limit(1)
      asiel = eersteAsiel ?? null
    }
  } catch (error) {
    console.error('DB fout in assistent:', error)
  }

  if (!asiel) {
    return new Response('Asiel niet gevonden', { status: 404 })
  }

  const systemPrompt = bouwSystemPrompt(asiel, dier, session.user.name ?? 'Bezoeker')

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...berichten.map((b) => ({
      role: b.rol,
      content: b.inhoud,
    })),
  ]

  try {
    const stream = await chatStream(messages, { maxTokens: 600, meta: { module: 'assistent' } })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('AI streaming fout:', error)
    return new Response('Er ging iets mis. Probeer het opnieuw.', { status: 500 })
  }
}
