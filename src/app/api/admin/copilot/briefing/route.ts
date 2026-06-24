export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  dieren,
  adopties,
  afspraken,
  medischeRecords,
  welzijnLogs,
  asielen,
  berichten,
  gesprekken,
} from '@/lib/db/schema'
import { and, eq, count, lt, lte, gte, desc, ne, sql } from 'drizzle-orm'
import { chatCompletion } from '@/lib/ai/client'

export interface CopilotTaak {
  id: string
  prioriteit: 'urgent' | 'normaal' | 'info'
  icoon: string
  categorie: string
  titel: string
  beschrijving: string
  link?: string
  linkTekst?: string
}

export interface BriefingData {
  briefingTekst: string
  taken: CopilotTaak[]
  inzichten: string[]
  stats: {
    beschikbaar: number
    inOpvang: number
    openstaandeAdopties: number
    afgrondeAdopties: number
    onglezenBerichten: number
    medischeAlerts: number
    afsprakenVandaag: number
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  }

  const asielId = session.user.asielId
  const vandaag = new Date()
  const morgen = new Date(vandaag)
  morgen.setDate(morgen.getDate() + 1)
  morgen.setHours(23, 59, 59, 999)
  const zestigDagenGeleden = new Date(vandaag)
  zestigDagenGeleden.setDate(zestigDagenGeleden.getDate() - 60)
  const zeveDagenGeleden = new Date(vandaag)
  zeveDagenGeleden.setDate(zeveDagenGeleden.getDate() - 7)

  try {
    // Asiel info
    let asielNaam = 'het asiel'
    if (asielId) {
      const [asiel] = await db.select({ naam: asielen.naam }).from(asielen).where(eq(asielen.id, asielId)).limit(1)
      if (asiel) asielNaam = asiel.naam
    }

    // Dieren stats
    const alleDescikbareDieren = await db
      .select({ id: dieren.id, naam: dieren.naam, soort: dieren.soort, ras: dieren.ras, binnengekomentOp: dieren.binnengekomentOp, status: dieren.status })
      .from(dieren)
      .where(asielId ? and(eq(dieren.asielId, asielId), ne(dieren.status, 'geadopteerd')) : ne(dieren.status, 'geadopteerd'))
      .orderBy(dieren.binnengekomentOp)

    const beschikbaar = alleDescikbareDieren.filter((d) => d.status === 'beschikbaar').length
    const inOpvang = alleDescikbareDieren.length
    const langeWachters = alleDescikbareDieren.filter(
      (d) => d.status === 'beschikbaar' && d.binnengekomentOp && new Date(d.binnengekomentOp) < zestigDagenGeleden
    )

    // Openstaande adopties
    const openAdopties = await db
      .select({
        id: adopties.id,
        aangevraagdOp: adopties.aangevraagdOp,
        dierNaam: dieren.naam,
      })
      .from(adopties)
      .innerJoin(dieren, eq(adopties.dierId, dieren.id))
      .where(asielId ? and(eq(adopties.status, 'aangevraagd'), eq(adopties.asielId, asielId)) : eq(adopties.status, 'aangevraagd'))
      .orderBy(adopties.aangevraagdOp)

    const [afgrondeAdopties] = await db
      .select({ aantal: count() })
      .from(adopties)
      .where(asielId ? and(eq(adopties.status, 'afgerond'), eq(adopties.asielId, asielId)) : eq(adopties.status, 'afgerond'))

    // Oudste openstaande adoptie
    const oudesteAdoptie = openAdopties[0]
    const oudesteAdoptieDagen = oudesteAdoptie
      ? Math.floor((vandaag.getTime() - new Date(oudesteAdoptie.aangevraagdOp).getTime()) / 86400000)
      : 0

    // Afspraken vandaag + aangevraagd
    const afsprakenVandaag = await db
      .select({ id: afspraken.id, type: afspraken.type, status: afspraken.status, bevestigdeDatum: afspraken.bevestigdeDatum })
      .from(afspraken)
      .where(
        asielId
          ? and(
              eq(afspraken.asielId, asielId),
              eq(afspraken.status, 'bevestigd'),
              gte(afspraken.bevestigdeDatum, vandaag),
              lte(afspraken.bevestigdeDatum, morgen)
            )
          : and(eq(afspraken.status, 'bevestigd'), gte(afspraken.bevestigdeDatum, vandaag), lte(afspraken.bevestigdeDatum, morgen))
      )

    const [afsprakenAangevraagd] = await db
      .select({ aantal: count() })
      .from(afspraken)
      .where(asielId ? and(eq(afspraken.status, 'aangevraagd'), eq(afspraken.asielId, asielId)) : eq(afspraken.status, 'aangevraagd'))

    // Medische alerts (achterstallig)
    const medischAchterstallig = await db
      .select({ id: medischeRecords.id, dierId: medischeRecords.dierId, titel: medischeRecords.titel, volgendeDatum: medischeRecords.volgendeDatum })
      .from(medischeRecords)
      .where(and(eq(medischeRecords.status, 'aankomend'), lt(medischeRecords.volgendeDatum, vandaag)))
      .limit(10)

    // Komende medische records (7 dagen)
    const medischKomend = await db
      .select({ id: medischeRecords.id, dierId: medischeRecords.dierId, titel: medischeRecords.titel, volgendeDatum: medischeRecords.volgendeDatum })
      .from(medischeRecords)
      .where(and(eq(medischeRecords.status, 'aankomend'), gte(medischeRecords.volgendeDatum, vandaag), lte(medischeRecords.volgendeDatum, morgen)))
      .limit(10)

    // Ongelezen berichten
    const [onglezenResult] = await db
      .select({ aantal: count() })
      .from(berichten)
      .innerJoin(gesprekken, eq(berichten.gesprekId, gesprekken.id))
      .where(and(eq(berichten.verzenderType, 'adoptant'), eq(berichten.gelezen, false)))

    // Welzijn: dieren zonder log afgelopen 7 dagen
    const dierenMetRecenteLog = await db
      .select({ dierId: welzijnLogs.dierId })
      .from(welzijnLogs)
      .where(gte(welzijnLogs.gelogdOp, zeveDagenGeleden))

    const dierenMetLogIds = new Set(dierenMetRecenteLog.map((l) => l.dierId))
    const dierenZonderLog = alleDescikbareDieren
      .filter((d) => d.status === 'beschikbaar' && !dierenMetLogIds.has(d.id))
      .slice(0, 5)

    // Trend: adopties deze week vs vorige week
    const [adopsiesDezeWeek] = await db
      .select({ aantal: count() })
      .from(adopties)
      .where(gte(adopties.aangevraagdOp, zeveDagenGeleden))

    const veertiendagenGeleden = new Date(vandaag)
    veertiendagenGeleden.setDate(veertiendagenGeleden.getDate() - 14)
    const [adopsiesVorigeWeek] = await db
      .select({ aantal: count() })
      .from(adopties)
      .where(and(gte(adopties.aangevraagdOp, veertiendagenGeleden), lt(adopties.aangevraagdOp, zeveDagenGeleden)))

    const ongelezen = Number(onglezenResult?.aantal ?? 0)
    const medischeAlertsAantal = medischAchterstallig.length

    // Bouw context voor AI
    const context = `
ASIEL: ${asielNaam}
DATUM: ${vandaag.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

DIEREN IN OPVANG: ${inOpvang} totaal, ${beschikbaar} beschikbaar voor adoptie
LANG IN ASIEL (>60 dagen): ${langeWachters.length} dieren${langeWachters.length > 0 ? ': ' + langeWachters.slice(0, 3).map((d) => `${d.naam} (${d.soort})`).join(', ') : ''}

OPENSTAANDE ADOPTIEVERZOEKEN: ${openAdopties.length}
${oudesteAdoptie ? `Oudste verzoek: ${oudesteAdoptie.dierNaam}, ${oudesteAdoptieDagen} dagen geleden` : ''}

AFSPRAKEN VANDAAG: ${afsprakenVandaag.length} bevestigde afspraken
AANGEVRAAGDE AFSPRAKEN: ${afsprakenAangevraagd?.aantal ?? 0} wachten op bevestiging

MEDISCHE ALERTS: ${medischeAlertsAantal} achterstallige behandelingen
MEDISCH KOMENDE 7 DAGEN: ${medischKomend.length} gepland

ONGELEZEN BERICHTEN: ${ongelezen}

DIEREN ZONDER WELZIJN LOG (7 dagen): ${dierenZonderLog.length}${dierenZonderLog.length > 0 ? ': ' + dierenZonderLog.map((d) => d.naam).join(', ') : ''}

ADOPTIE TREND: ${adopsiesDezeWeek?.aantal ?? 0} aanvragen deze week vs ${adopsiesVorigeWeek?.aantal ?? 0} vorige week
TOTAAL SUCCESVOLLE ADOPTIES: ${afgrondeAdopties?.aantal ?? 0}
`.trim()

    const prompt = `Je bent de slimme AI Copilot voor ${asielNaam}, een dierenasiel.

Analyseer de onderstaande actuele data en genereer:
1. Een persoonlijke, energieke dagelijkse briefing (2-4 zinnen) die de medewerker meteen up-to-speed brengt
2. Een geprioriteerde takenlijst gebaseerd op de data
3. 2-3 slimme inzichten of aanbevelingen

${context}

Retourneer ALLEEN dit JSON object (geen markdown, geen uitleg):
{
  "briefingTekst": "string met briefing (mag **bold** gebruiken)",
  "taken": [
    {
      "id": "uniek-id",
      "prioriteit": "urgent|normaal|info",
      "icoon": "material symbol naam",
      "categorie": "Adopties|Medisch|Berichten|Welzijn|Afspraken|Dieren",
      "titel": "Korte titel",
      "beschrijving": "Wat er precies speelt en waarom het belangrijk is",
      "link": "/admin/...",
      "linkTekst": "Actie tekst"
    }
  ],
  "inzichten": ["inzicht 1", "inzicht 2"]
}

Regels:
- Alleen taken opnemen als er ECHT iets te doen is (niet invullen bij 0 items)
- Urgent = direct actie nodig vandaag
- Normaal = actie nodig deze week
- Info = ter informatie / goed nieuws
- Material icon namen: notifications_active, medical_services, chat, pets, calendar_month, trending_up, warning, check_circle, schedule, favorite
- Alle tekst in het Nederlands`

    const antwoord = await chatCompletion([{ role: 'user', content: prompt }], { maxTokens: 1200, meta: { module: 'copilot' } })

    // Parse JSON
    const jsonMatch = antwoord.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Geen geldige JSON in AI antwoord')
    }

    const briefingData = JSON.parse(jsonMatch[0]) as Omit<BriefingData, 'stats'>

    const result: BriefingData = {
      ...briefingData,
      stats: {
        beschikbaar,
        inOpvang,
        openstaandeAdopties: openAdopties.length,
        afgrondeAdopties: Number(afgrondeAdopties?.aantal ?? 0),
        onglezenBerichten: ongelezen,
        medischeAlerts: medischeAlertsAantal,
        afsprakenVandaag: afsprakenVandaag.length,
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Briefing fout:', error)
    return NextResponse.json({ error: 'Briefing kon niet worden gegenereerd' }, { status: 500 })
  }
}
