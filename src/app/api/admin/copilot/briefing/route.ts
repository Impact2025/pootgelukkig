export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  dossiers,
  begeleidingen,
  afspraken,
  medischeRecords,
  welzijnLogs,
  organisaties,
  berichten,
  gesprekken,
} from '@/lib/db/schema'
import { and, eq, count, lt, lte, gte, ne } from 'drizzle-orm'
import { chatCompletion, MODEL_SONNET } from '@/lib/ai/client'

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
    actief: number
    totaalDossiers: number
    openstaandeBegeleidingen: number
    afgerondeBegeleidingen: number
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

  const organisatieId = session.user.organisatieId
  if (!organisatieId) {
    return NextResponse.json({ error: 'Geen organisatie gekoppeld aan dit account' }, { status: 400 })
  }

  const vandaag = new Date()
  const morgen = new Date(vandaag)
  morgen.setDate(morgen.getDate() + 1)
  morgen.setHours(23, 59, 59, 999)
  const zestigDagenGeleden = new Date(vandaag)
  zestigDagenGeleden.setDate(zestigDagenGeleden.getDate() - 60)
  const zevenDagenGeleden = new Date(vandaag)
  zevenDagenGeleden.setDate(zevenDagenGeleden.getDate() - 7)

  try {
    // Organisatie info
    let organisatieNaam = 'de organisatie'
    const [org] = await db.select({ naam: organisaties.naam }).from(organisaties).where(eq(organisaties.id, organisatieId)).limit(1)
    if (org) organisatieNaam = org.naam

    // Dossiers stats
    const alleDossiers = await db
      .select({ id: dossiers.id, titel: dossiers.titel, categorie: dossiers.categorie, createdAt: dossiers.createdAt, status: dossiers.status })
      .from(dossiers)
      .where(and(eq(dossiers.organisatieId, organisatieId), ne(dossiers.status, 'afgerond')))
      .orderBy(dossiers.createdAt)

    const actief = alleDossiers.filter((d) => d.status === 'actief').length
    const totaalDossiers = alleDossiers.length
    const langOpen = alleDossiers.filter(
      (d) => d.status === 'actief' && d.createdAt && new Date(d.createdAt) < zestigDagenGeleden
    )

    // Openstaande begeleidingen
    const openBegeleidingen = await db
      .select({
        id: begeleidingen.id,
        createdAt: begeleidingen.createdAt,
        dossierTitel: dossiers.titel,
      })
      .from(begeleidingen)
      .innerJoin(dossiers, eq(begeleidingen.dossierId, dossiers.id))
      .where(and(eq(begeleidingen.status, 'gepland'), eq(begeleidingen.organisatieId, organisatieId)))
      .orderBy(begeleidingen.createdAt)

    const [afgerondeBegeleidingen] = await db
      .select({ aantal: count() })
      .from(begeleidingen)
      .where(and(eq(begeleidingen.status, 'afgerond'), eq(begeleidingen.organisatieId, organisatieId)))

    // Oudste openstaande begeleiding
    const oudsteBegeleiding = openBegeleidingen[0]
    const oudsteBegeleidingDagen = oudsteBegeleiding
      ? Math.floor((vandaag.getTime() - new Date(oudsteBegeleiding.createdAt).getTime()) / 86400000)
      : 0

    // Afspraken vandaag + aangevraagd
    const afsprakenVandaag = await db
      .select({ id: afspraken.id, type: afspraken.type, status: afspraken.status, bevestigdeDatum: afspraken.bevestigdeDatum })
      .from(afspraken)
      .where(
        and(
          eq(afspraken.organisatieId, organisatieId),
          eq(afspraken.status, 'bevestigd'),
          gte(afspraken.bevestigdeDatum, vandaag),
          lte(afspraken.bevestigdeDatum, morgen)
        )
      )

    const [afsprakenAangevraagd] = await db
      .select({ aantal: count() })
      .from(afspraken)
      .where(and(eq(afspraken.status, 'aangevraagd'), eq(afspraken.organisatieId, organisatieId)))

    // Medische alerts (achterstallig) — dossier-gebonden
    const medischAchterstallig = await db
      .select({ id: medischeRecords.id, dossierId: medischeRecords.dossierId, titel: medischeRecords.titel, volgendeDatum: medischeRecords.volgendeDatum })
      .from(medischeRecords)
      .innerJoin(dossiers, eq(medischeRecords.dossierId, dossiers.id))
      .where(and(eq(dossiers.organisatieId, organisatieId), eq(medischeRecords.status, 'aankomend'), lt(medischeRecords.volgendeDatum, vandaag)))
      .limit(10)

    // Komende medische records (7 dagen)
    const medischKomend = await db
      .select({ id: medischeRecords.id, dossierId: medischeRecords.dossierId, titel: medischeRecords.titel, volgendeDatum: medischeRecords.volgendeDatum })
      .from(medischeRecords)
      .innerJoin(dossiers, eq(medischeRecords.dossierId, dossiers.id))
      .where(and(eq(dossiers.organisatieId, organisatieId), eq(medischeRecords.status, 'aankomend'), gte(medischeRecords.volgendeDatum, vandaag), lte(medischeRecords.volgendeDatum, morgen)))
      .limit(10)

    // Ongelezen berichten
    const [onglezenResult] = await db
      .select({ aantal: count() })
      .from(berichten)
      .innerJoin(gesprekken, eq(berichten.gesprekId, gesprekken.id))
      .where(and(eq(gesprekken.organisatieId, organisatieId), eq(berichten.verzenderType, 'adoptant'), eq(berichten.gelezen, false)))

    // Veldlogs: dossiers zonder log afgelopen 7 dagen
    const dossiersMetRecenteLog = await db
      .select({ dossierId: welzijnLogs.dossierId })
      .from(welzijnLogs)
      .innerJoin(dossiers, eq(welzijnLogs.dossierId, dossiers.id))
      .where(and(eq(dossiers.organisatieId, organisatieId), gte(welzijnLogs.gelogdOp, zevenDagenGeleden)))

    const dossiersMetLogIds = new Set(dossiersMetRecenteLog.map((l) => l.dossierId))
    const dossiersZonderLog = alleDossiers
      .filter((d) => d.status === 'actief' && !dossiersMetLogIds.has(d.id))
      .slice(0, 5)

    // Trend: begeleidingen deze week vs vorige week
    const [begeleidingenDezeWeek] = await db
      .select({ aantal: count() })
      .from(begeleidingen)
      .where(and(eq(begeleidingen.organisatieId, organisatieId), gte(begeleidingen.createdAt, zevenDagenGeleden)))

    const veertiendagenGeleden = new Date(vandaag)
    veertiendagenGeleden.setDate(veertiendagenGeleden.getDate() - 14)
    const [begeleidingenVorigeWeek] = await db
      .select({ aantal: count() })
      .from(begeleidingen)
      .where(and(eq(begeleidingen.organisatieId, organisatieId), gte(begeleidingen.createdAt, veertiendagenGeleden), lt(begeleidingen.createdAt, zevenDagenGeleden)))

    const ongelezen = Number(onglezenResult?.aantal ?? 0)
    const medischeAlertsAantal = medischAchterstallig.length

    // Bouw context voor AI
    const context = `
ORGANISATIE: ${organisatieNaam}
DATUM: ${vandaag.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

DOSSIERS: ${totaalDossiers} totaal, ${actief} actief
LANG OPEN (>60 dagen): ${langOpen.length} dossiers${langOpen.length > 0 ? ': ' + langOpen.slice(0, 3).map((d) => `${d.titel} (${d.categorie})`).join(', ') : ''}

OPENSTAANDE (GEPLANDE) BEGELEIDINGEN: ${openBegeleidingen.length}
${oudsteBegeleiding ? `Oudste begeleiding: ${oudsteBegeleiding.dossierTitel}, ${oudsteBegeleidingDagen} dagen geleden` : ''}

AFSPRAKEN VANDAAG: ${afsprakenVandaag.length} bevestigde afspraken
AANGEVRAAGDE AFSPRAKEN: ${afsprakenAangevraagd?.aantal ?? 0} wachten op bevestiging

MEDISCHE/ZORG-ALERTS: ${medischeAlertsAantal} achterstallige acties
KOMENDE 7 DAGEN: ${medischKomend.length} gepland

ONGELEZEN BERICHTEN: ${ongelezen}

DOSSIERS ZONDER VELDLOG (7 dagen): ${dossiersZonderLog.length}${dossiersZonderLog.length > 0 ? ': ' + dossiersZonderLog.map((d) => d.titel).join(', ') : ''}

BEGELEIDING-TREND: ${begeleidingenDezeWeek?.aantal ?? 0} nieuw deze week vs ${begeleidingenVorigeWeek?.aantal ?? 0} vorige week
TOTAAL AFGERONDE BEGELEIDINGEN: ${afgerondeBegeleidingen?.aantal ?? 0}
`.trim()

    const prompt = `Je bent de slimme AI Copilot voor ${organisatieNaam}, een organisatie in het sociaal domein binnen ImpactOS.

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
      "categorie": "Begeleidingen|Zorg|Berichten|Veldlogs|Afspraken|Dossiers",
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
- Material icon namen: notifications_active, medical_services, chat, description, calendar_month, trending_up, warning, check_circle, schedule, favorite
- Alle tekst in het Nederlands`

    const antwoord = await chatCompletion([{ role: 'user', content: prompt }], {
      model: MODEL_SONNET,
      maxTokens: 1200,
      meta: { actie: 'copilot-briefing', organisatieId },
    })

    // Parse JSON
    const jsonMatch = antwoord.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Geen geldige JSON in AI antwoord')
    }

    const briefingData = JSON.parse(jsonMatch[0]) as Omit<BriefingData, 'stats'>

    const result: BriefingData = {
      ...briefingData,
      stats: {
        actief,
        totaalDossiers,
        openstaandeBegeleidingen: openBegeleidingen.length,
        afgerondeBegeleidingen: Number(afgerondeBegeleidingen?.aantal ?? 0),
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
