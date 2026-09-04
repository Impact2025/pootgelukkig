export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  dossiers,
  begeleidingen,
  afspraken,
  organisaties,
} from '@/lib/db/schema'
import { and, eq, count, gte, ne, desc } from 'drizzle-orm'
import { chatStream, MODEL_SONNET } from '@/lib/ai/client'
import { haalRol, isGeldigeRol } from '@/lib/ai/rollen'

type Bericht = {
  rol: 'user' | 'assistant'
  inhoud: string
}

async function bouwCopilotContext(organisatieId: string | undefined | null): Promise<string> {
  const vandaag = new Date()

  let organisatieNaam = 'de organisatie'
  let organisatieInfo: { website?: string | null; telefoon?: string | null; contactEmail?: string | null } = {}

  if (organisatieId) {
    const [org] = await db
      .select({ naam: organisaties.naam, website: organisaties.website, telefoon: organisaties.telefoon, contactEmail: organisaties.contactEmail })
      .from(organisaties)
      .where(eq(organisaties.id, organisatieId))
      .limit(1)
    if (org) {
      organisatieNaam = org.naam
      organisatieInfo = { website: org.website, telefoon: org.telefoon, contactEmail: org.contactEmail }
    }
  }

  // Dossiers overzicht
  const alleDossiers = await db
    .select({
      id: dossiers.id,
      titel: dossiers.titel,
      categorie: dossiers.categorie,
      status: dossiers.status,
      createdAt: dossiers.createdAt,
    })
    .from(dossiers)
    .where(organisatieId ? and(eq(dossiers.organisatieId, organisatieId), ne(dossiers.status, 'afgerond')) : ne(dossiers.status, 'afgerond'))
    .orderBy(desc(dossiers.createdAt))
    .limit(50)

  // Openstaande begeleidingen
  const openBegeleidingen = await db
    .select({
      id: begeleidingen.id,
      startDatum: begeleidingen.startDatum,
      createdAt: begeleidingen.createdAt,
      dossierTitel: dossiers.titel,
    })
    .from(begeleidingen)
    .innerJoin(dossiers, eq(begeleidingen.dossierId, dossiers.id))
    .where(organisatieId ? and(eq(begeleidingen.status, 'gepland'), eq(begeleidingen.organisatieId, organisatieId)) : eq(begeleidingen.status, 'gepland'))
    .orderBy(begeleidingen.createdAt)
    .limit(20)

  // Recent afgeronde begeleidingen
  const [afgerondeBegeleidingen] = await db
    .select({ aantal: count() })
    .from(begeleidingen)
    .where(organisatieId ? and(eq(begeleidingen.status, 'afgerond'), eq(begeleidingen.organisatieId, organisatieId)) : eq(begeleidingen.status, 'afgerond'))

  // Afspraken komende 7 dagen
  const komende = await db
    .select({
      id: afspraken.id,
      type: afspraken.type,
      status: afspraken.status,
      bevestigdeDatum: afspraken.bevestigdeDatum,
      voorkeurDatum: afspraken.voorkeurDatum,
    })
    .from(afspraken)
    .where(
      organisatieId
        ? and(eq(afspraken.organisatieId, organisatieId), eq(afspraken.status, 'bevestigd'), gte(afspraken.bevestigdeDatum, vandaag))
        : and(eq(afspraken.status, 'bevestigd'), gte(afspraken.bevestigdeDatum, vandaag))
    )
    .orderBy(afspraken.bevestigdeDatum)
    .limit(10)

  const actief = alleDossiers.filter((d) => d.status === 'actief')
  const inBehandeling = alleDossiers.filter((d) => d.status === 'in_behandeling')

  const dossierLijst = actief
    .slice(0, 20)
    .map((d) => {
      const dagen = d.createdAt ? Math.floor((vandaag.getTime() - new Date(d.createdAt).getTime()) / 86400000) : null
      return `- ${d.titel} (${d.categorie})${dagen ? `, ${dagen} dagen open` : ''}`
    })
    .join('\n')

  const begeleidingLijst = openBegeleidingen
    .map((b) => {
      const dagen = Math.floor((vandaag.getTime() - new Date(b.createdAt).getTime()) / 86400000)
      return `- ${b.dossierTitel}, ${dagen} dagen geleden aangemaakt`
    })
    .join('\n')

  return `ORGANISATIE: ${organisatieNaam}
DATUM: ${vandaag.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

DOSSIERS (${alleDossiers.length} totaal):
  Actief: ${actief.length}
  In behandeling: ${inBehandeling.length}

ACTIEVE DOSSIERS:
${dossierLijst || '  Geen actieve dossiers'}

OPENSTAANDE (GEPLANDE) BEGELEIDINGEN (${openBegeleidingen.length}):
${begeleidingLijst || '  Geen openstaande begeleidingen'}

TOTAAL AFGERONDE BEGELEIDINGEN: ${afgerondeBegeleidingen?.aantal ?? 0}

KOMENDE AFSPRAKEN: ${komende.length}
${komende.slice(0, 5).map((a) => `- ${a.type} op ${a.bevestigdeDatum ? new Date(a.bevestigdeDatum).toLocaleDateString('nl-NL') : 'datum onbekend'}`).join('\n') || '  Geen komende afspraken'}`
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return new Response('Geen toegang', { status: 401 })
  }

  let body: { berichten: Bericht[]; rol?: unknown }
  try {
    body = await request.json() as { berichten: Bericht[]; rol?: unknown }
  } catch {
    return new Response('Ongeldig verzoek', { status: 400 })
  }

  if (!body.berichten?.length) {
    return new Response('Geen berichten', { status: 400 })
  }

  const organisatieId = session.user.organisatieId
  if (!organisatieId) {
    return new Response('Geen organisatie gekoppeld aan dit account', { status: 400 })
  }

  // Rol-gebaseerde systeemprompt (RAG-lite) of de algemene copilot-prompt
  const rolId = isGeldigeRol(body.rol) ? body.rol : null
  const rol = rolId ? haalRol(rolId) : null

  let context = ''
  try {
    context = await bouwCopilotContext(organisatieId)
  } catch (error) {
    console.error('Context bouw fout:', error)
  }

  let systemPrompt: string
  if (rol) {
    let rolContext = ''
    try {
      rolContext = await rol.bouwContext(organisatieId)
    } catch (error) {
      console.error(`Rol-context fout (${rol.id}):`, error)
    }
    systemPrompt = `${rol.systeemInstructie}

ORGANISATIE CONTEXT:
${context}

ROL-SPECIFIEKE DATA:
${rolContext}

STIJL:
- Persoonlijk en zorgvuldig, maar professioneel
- Concreet met namen en cijfers (gebruik echte data hierboven)
- Beknopt tenzij gevraagd om meer detail
- Gebruik **bold** voor belangrijke punten
- Alle tekst in het Nederlands

Als je iets niet weet of data mist, zeg dat eerlijk.`
  } else {
    systemPrompt = `Je bent de ImpactOS Copilot — een slimme, proactieve AI-assistent voor medewerkers van deze organisatie.

Je bent niet zomaar een chatbot. Je bent een echte werkmaatje dat:
- Alle actuele data kent van de organisatie
- Proactief signaleert wat aandacht nodig heeft
- Helpt met teksten schrijven (rapportages, subsidieaanvragen, communicatie)
- Praktische adviezen geeft op basis van echte data
- Altijd concreet en bruikbaar is

HUIDIGE ORGANISATIE-DATA:
${context}

JOUW MOGELIJKHEDEN:
- Beantwoord vragen over specifieke dossiers, begeleidingen, afspraken
- Schrijf conceptteksten (subsidies, rapportages, communicatie)
- Analyseer trends en geef aanbevelingen
- Stel vragen om taken beter te begrijpen
- Geef dagelijkse prioriteiten

STIJL:
- Persoonlijk en zorgvuldig, maar professioneel
- Concreet met namen en cijfers (gebruik echte data hierboven)
- Beknopt tenzij gevraagd om meer detail
- Gebruik **bold** voor belangrijke punten
- Alle tekst in het Nederlands

Als je iets niet weet of data mist, zeg dat eerlijk.`
  }

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...body.berichten.map((b) => ({ role: b.rol, content: b.inhoud })),
  ]

  try {
    const stream = await chatStream(messages, {
      model: MODEL_SONNET,
      maxTokens: 800,
      meta: { actie: rol ? `rol-${rol.id}` : 'copilot', userId: Number(session.user.id), organisatieId },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Copilot streaming fout:', error)
    return new Response('Er ging iets mis. Probeer opnieuw.', { status: 500 })
  }
}
