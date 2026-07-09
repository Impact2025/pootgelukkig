export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  dieren,
  adopties,
  afspraken,
  medischeRecords,
  asielen,
  users,
} from '@/lib/db/schema'
import { and, eq, count, lt, gte, ne, desc } from 'drizzle-orm'
import { chatStream } from '@/lib/ai/client'
import { haalRol, isGeldigeRol } from '@/lib/ai/rollen'

type Bericht = {
  rol: 'user' | 'assistant'
  inhoud: string
}

async function bouwCopilotContext(asielId: number | undefined | null): Promise<string> {
  const vandaag = new Date()
  const dertigDagenGeleden = new Date(vandaag)
  dertigDagenGeleden.setDate(dertigDagenGeleden.getDate() - 30)
  const zeveDagenGeleden = new Date(vandaag)
  zeveDagenGeleden.setDate(zeveDagenGeleden.getDate() - 7)
  const morgen = new Date(vandaag)
  morgen.setDate(morgen.getDate() + 1)
  morgen.setHours(23, 59, 59, 999)

  let asielNaam = 'het asiel'
  let asielConfig: { stad?: string | null; telefoon?: string | null; email?: string | null } = {}

  if (asielId) {
    const [asiel] = await db
      .select({ naam: asielen.naam, stad: asielen.stad, telefoon: asielen.telefoon, email: asielen.email })
      .from(asielen)
      .where(eq(asielen.id, asielId))
      .limit(1)
    if (asiel) {
      asielNaam = asiel.naam
      asielConfig = { stad: asiel.stad, telefoon: asiel.telefoon, email: asiel.email }
    }
  }

  // Dieren overzicht
  const alleDieren = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      soort: dieren.soort,
      ras: dieren.ras,
      status: dieren.status,
      leeftijdJaren: dieren.leeftijdJaren,
      geslacht: dieren.geslacht,
      binnengekomentOp: dieren.binnengekomentOp,
    })
    .from(dieren)
    .where(asielId ? and(eq(dieren.asielId, asielId), ne(dieren.status, 'geadopteerd')) : ne(dieren.status, 'geadopteerd'))
    .orderBy(desc(dieren.binnengekomentOp))
    .limit(50)

  // Openstaande adopties met detail
  const openAdopties = await db
    .select({
      id: adopties.id,
      aangevraagdOp: adopties.aangevraagdOp,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      userName: users.naam,
    })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .innerJoin(users, eq(adopties.userId, users.id))
    .where(asielId ? and(eq(adopties.status, 'aangevraagd'), eq(adopties.asielId, asielId)) : eq(adopties.status, 'aangevraagd'))
    .orderBy(adopties.aangevraagdOp)
    .limit(20)

  // Recente afgeronde adopties
  const [afgrondeAdopties] = await db
    .select({ aantal: count() })
    .from(adopties)
    .where(asielId ? and(eq(adopties.status, 'afgerond'), eq(adopties.asielId, asielId)) : eq(adopties.status, 'afgerond'))

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
      asielId
        ? and(eq(afspraken.asielId, asielId), eq(afspraken.status, 'bevestigd'), gte(afspraken.bevestigdeDatum, vandaag))
        : and(eq(afspraken.status, 'bevestigd'), gte(afspraken.bevestigdeDatum, vandaag))
    )
    .orderBy(afspraken.bevestigdeDatum)
    .limit(10)

  // Medische alerts
  const medischAchterstallig = await db
    .select({ titel: medischeRecords.titel, dierId: medischeRecords.dierId, volgendeDatum: medischeRecords.volgendeDatum })
    .from(medischeRecords)
    .where(and(eq(medischeRecords.status, 'aankomend'), lt(medischeRecords.volgendeDatum, vandaag)))
    .limit(10)

  const komendMedisch = await db
    .select({ titel: medischeRecords.titel, dierId: medischeRecords.dierId, volgendeDatum: medischeRecords.volgendeDatum })
    .from(medischeRecords)
    .where(and(eq(medischeRecords.status, 'aankomend'), gte(medischeRecords.volgendeDatum, vandaag), lt(medischeRecords.volgendeDatum, morgen)))
    .limit(10)

  const beschikbaar = alleDieren.filter((d) => d.status === 'beschikbaar')
  const inBehandeling = alleDieren.filter((d) => d.status === 'in_behandeling')

  const dierenLijst = beschikbaar
    .slice(0, 20)
    .map((d) => {
      const dagen = d.binnengekomentOp
        ? Math.floor((vandaag.getTime() - new Date(d.binnengekomentOp).getTime()) / 86400000)
        : null
      return `- ${d.naam} (${d.soort}${d.ras ? ` - ${d.ras}` : ''}, ${d.leeftijdJaren ?? '?'} jaar, ${d.geslacht ?? 'onbekend'})${dagen ? `, ${dagen} dagen in asiel` : ''}`
    })
    .join('\n')

  const adoptieLijst = openAdopties
    .map((a) => {
      const dagen = Math.floor((vandaag.getTime() - new Date(a.aangevraagdOp).getTime()) / 86400000)
      return `- ${a.dierNaam} (${a.dierSoort}) aangevraagd door ${a.userName}, ${dagen} dagen geleden`
    })
    .join('\n')

  return `ASIEL: ${asielNaam}${asielConfig.stad ? ` — ${asielConfig.stad}` : ''}
DATUM: ${vandaag.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}

DIEREN IN OPVANG (${alleDieren.length} totaal):
  Beschikbaar: ${beschikbaar.length}
  In behandeling: ${inBehandeling.length}

BESCHIKBARE DIEREN:
${dierenLijst || '  Geen beschikbare dieren'}

OPENSTAANDE ADOPTIEVERZOEKEN (${openAdopties.length}):
${adoptieLijst || '  Geen openstaande verzoeken'}

TOTAAL SUCCESVOLLE ADOPTIES: ${afgrondeAdopties?.aantal ?? 0}

KOMENDE AFSPRAKEN: ${komende.length}
${komende.slice(0, 5).map((a) => `- ${a.type} op ${a.bevestigdeDatum ? new Date(a.bevestigdeDatum).toLocaleDateString('nl-NL') : 'datum onbekend'}`).join('\n') || '  Geen komende afspraken'}

MEDISCHE ALERTS:
  Achterstallig: ${medischAchterstallig.length}${medischAchterstallig.length > 0 ? '\n' + medischAchterstallig.map((m) => `  - ${m.titel}`).join('\n') : ''}
  Komende 7 dagen: ${komendMedisch.length}${komendMedisch.length > 0 ? '\n' + komendMedisch.map((m) => `  - ${m.titel} (${m.volgendeDatum ? new Date(m.volgendeDatum).toLocaleDateString('nl-NL') : '?'})`).join('\n') : ''}`
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

  const asielId = session.user.asielId

  // Rol-gebaseerde systeemprompt (RAG-lite) of de algemene copilot-prompt
  const rolId = isGeldigeRol(body.rol) ? body.rol : null
  const rol = rolId ? haalRol(rolId) : null

  let context = ''
  try {
    context = await bouwCopilotContext(asielId)
  } catch (error) {
    console.error('Context bouw fout:', error)
  }

  let systemPrompt: string
  if (rol) {
    let rolContext = ''
    try {
      rolContext = await rol.bouwContext(Number(asielId))
    } catch (error) {
      console.error(`Rol-context fout (${rol.id}):`, error)
    }
    systemPrompt = `${rol.systeemInstructie}

ASIEL CONTEXT:
${context}

ROL-SPECIFIEKE DATA:
${rolContext}

STIJL:
- Persoonlijk en warm, maar professioneel
- Concreet met namen en cijfers (gebruik echte data hierboven)
- Beknopt tenzij gevraagd om meer detail
- Gebruik **bold** voor belangrijke punten
- Alle tekst in het Nederlands

Als je iets niet weet of data mist, zeg dat eerlijk.`
  } else {
    systemPrompt = `Je bent de PootGelukkig Asiel Copilot — een slimme, proactieve AI-assistent voor medewerkers van het asiel.

Je bent niet zomaar een chatbot. Je bent een echte werkmaatje dat:
- Alle actuele data kent van het asiel
- Proactief signaleert wat aandacht nodig heeft
- Helpt met teksten schrijven (dierenverhalen, sociale media, brieven)
- Praktische adviezen geeft op basis van echte data
- Altijd concreet en bruikbaar is

HUIDIGE ASIEL DATA:
${context}

JOUW MOGELIJKHEDEN:
- Beantwoord vragen over specifieke dieren, adopties, afspraken
- Schrijf adoptieverhalen en profielteksten voor dieren
- Genereer sociale media posts (Instagram, Facebook)
- Analyseer trends en geef aanbevelingen
- Stel vragen om taken beter te begrijpen
- Geef dagelijkse prioriteiten

STIJL:
- Persoonlijk en warm, maar professioneel
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
      maxTokens: 800,
      meta: { module: rol ? `rol-${rol.id}` : 'copilot', userId: Number(session.user.id), asielId: Number(asielId) },
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
