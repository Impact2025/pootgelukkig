import { db } from '@/lib/db'
import {
  dieren,
  medischeRecords,
  welzijnLogs,
  adopties,
  afspraken,
  vrijwilligers,
  donoren,
  fondsenwervingCampagnes,
  evenementen,
} from '@/lib/db/schema'
import { and, eq, ne, lt, gte, desc, sql } from 'drizzle-orm'

// ─── Dieren ───────────────────────────────────────────────────────────────────

export async function haalDierenSamenvatting(asielId: number, limiet = 30): Promise<string> {
  const rijen = await db
    .select({
      naam: dieren.naam,
      soort: dieren.soort,
      status: dieren.status,
      binnen: dieren.binnengekomentOp,
    })
    .from(dieren)
    .where(and(eq(dieren.asielId, asielId), ne(dieren.status, 'geadopteerd')))
    .orderBy(desc(dieren.binnengekomentOp))
    .limit(limiet)
  if (rijen.length === 0) return '  Geen dieren in opvang'
  const vandaag = Date.now()
  return rijen
    .map((d) => {
      const dagen = d.binnen
        ? Math.floor((vandaag - new Date(d.binnen).getTime()) / 86400000)
        : null
      return `- ${d.naam} (${d.soort}) — ${d.status}${dagen != null ? `, ${dagen} dagen in asiel` : ''}`
    })
    .join('\n')
}

export async function haalLangsteWachters(asielId: number, drempelDagen = 60, limiet = 10): Promise<string> {
  const rijen = await db
    .select({ naam: dieren.naam, soort: dieren.soort, binnen: dieren.binnengekomentOp })
    .from(dieren)
    .where(and(eq(dieren.asielId, asielId), eq(dieren.status, 'beschikbaar')))
    .limit(100)
  const grens = Date.now() - drempelDagen * 86400000
  const lang = rijen
    .filter((d) => d.binnen && new Date(d.binnen).getTime() < grens)
    .slice(0, limiet)
  if (lang.length === 0) return '  Geen dieren boven drempel'
  return lang.map((d) => `- ${d.naam} (${d.soort})`).join('\n')
}

// ─── Medisch / Welzijn ──────────────────────────────────────────────────────

export async function haalMedischOpen(asielId: number): Promise<string> {
  const rijen = await db
    .select({
      titel: medischeRecords.titel,
      dierId: medischeRecords.dierId,
      volgende: medischeRecords.volgendeDatum,
      status: medischeRecords.status,
    })
    .from(medischeRecords)
    .innerJoin(dieren, eq(medischeRecords.dierId, dieren.id))
    .where(and(eq(dieren.asielId, asielId), eq(medischeRecords.status, 'aankomend'), lt(medischeRecords.volgendeDatum, new Date())))
    .limit(15)
  if (rijen.length === 0) return '  Geen openstaande medische acties'
  return rijen.map((r) => `- ${r.titel} (${r.status})`).join('\n')
}

export async function haalWelzijnStatus(asielId: number): Promise<string> {
  const zevenDagenGeleden = new Date(Date.now() - 7 * 86400000)
  const recent = await db
    .select({ dierId: welzijnLogs.dierId })
    .from(welzijnLogs)
    .innerJoin(dieren, eq(welzijnLogs.dierId, dieren.id))
    .where(and(eq(dieren.asielId, asielId), gte(welzijnLogs.gelogdOp, zevenDagenGeleden)))
  const recentIds = new Set(recent.map((r) => r.dierId))
  const beschikbaar = await db
    .select({ id: dieren.id, naam: dieren.naam })
    .from(dieren)
    .where(and(eq(dieren.asielId, asielId), eq(dieren.status, 'beschikbaar')))
    .limit(50)
  const zonder = beschikbaar.filter((d) => !recentIds.has(d.id)).slice(0, 10)
  if (zonder.length === 0) return '  Alle beschikbare dieren hebben recent een welzijn-log'
  return zonder.map((d) => `- ${d.naam}`).join('\n')
}

// ─── Vrijwilligers ────────────────────────────────────────────────────────────

export async function haalVrijwilligersSamenvatting(asielId: number): Promise<string> {
  const rijen = await db
    .select({ naam: vrijwilligers.naam, functie: vrijwilligers.functie, status: vrijwilligers.status, uren: vrijwilligers.urenPerWeek })
    .from(vrijwilligers)
    .where(eq(vrijwilligers.asielId, asielId))
    .limit(30)
  if (rijen.length === 0) return '  Geen vrijwilligers geregistreerd'
  const totaalUren = rijen.reduce((s, r) => s + (r.uren ?? 0), 0)
  return `${rijen.length} vrijwilligers (${totaalUren} uur/week totaal)\n` +
    rijen.map((r) => `- ${r.naam} — ${r.functie} (${r.status}, ${r.uren ?? 0} u/u)`).join('\n')
}

// ─── Donoren / Campagnes ──────────────────────────────────────────────────────

export async function haalDonorenSamenvatting(asielId: number): Promise<string> {
  const d = await db
    .select({ id: donoren.id, naam: donoren.naam, segment: donoren.segment, totaal: donoren.totaalGedoneerd })
    .from(donoren)
    .where(eq(donoren.asielId, asielId))
    .orderBy(desc(donoren.totaalGedoneerd))
    .limit(20)
  const c = await db
    .select({ naam: fondsenwervingCampagnes.naam, opgehaald: fondsenwervingCampagnes.opgehaaldBedrag, doel: fondsenwervingCampagnes.doelBedrag })
    .from(fondsenwervingCampagnes)
    .where(eq(fondsenwervingCampagnes.asielId, asielId))
    .limit(10)
  const donorStr = d.length
    ? d.map((x) => `- ${x.naam} (${x.segment}) — €${x.totaal ?? 0}`).join('\n')
    : '  Geen donoren'
  const campStr = c.length
    ? c.map((x) => `- ${x.naam}: €${x.opgehaald ?? 0}/€${x.doel ?? 0}`).join('\n')
    : '  Geen campagnes'
  return `DONOREN (top 20):\n${donorStr}\n\nCAMPAGNES:\n${campStr}`
}

// ─── Evenementen ──────────────────────────────────────────────────────────────

export async function haalEvenementenSamenvatting(asielId: number): Promise<string> {
  const rijen = await db
    .select({ titel: evenementen.titel, type: evenementen.type, startOp: evenementen.startOp, status: evenementen.status })
    .from(evenementen)
    .where(eq(evenementen.asielId, asielId))
    .orderBy(desc(evenementen.startOp))
    .limit(10)
  if (rijen.length === 0) return '  Geen evenementen gepland'
  return rijen.map((e) => `- ${e.titel} (${e.type}) op ${e.startOp ? new Date(e.startOp).toLocaleDateString('nl-NL') : '?'} — ${e.status}`).join('\n')
}

// ─── Lichte kennisbank-retrieve (voor tekst-rollen) ───────────────────────────

export async function retrieveKennisbank(query: string, max = 5): Promise<string> {
  const term = `%${query.replace(/\s+/g, '%')}%`
  try {
    const rijen = (await db.execute(
      sql`SELECT titel, slug FROM blog_posts WHERE status='gepubliceerd' AND inhoud_md ILIKE ${term} LIMIT ${max}`
    )) as { rows?: { titel: string; slug: string }[] }
    const rows = rijen.rows ?? []
    if (rows.length === 0) return '  Geen relevante bestaande artikelen'
    return rows.map((r) => `- ${r.titel} (/blog/${r.slug})`).join('\n')
  } catch {
    return '  Kennisbank niet beschikbaar'
  }
}

// ─── Adoptie-cijfers (voor rapportage) ────────────────────────────────────────

export async function haalAdoptieCijfers(asielId: number): Promise<string> {
  const [afgerond] = await db
    .select({ aantal: sql<number>`count(*)::int` })
    .from(adopties)
    .where(and(eq(adopties.asielId, asielId), eq(adopties.status, 'afgerond')))
  const [aangevraagd] = await db
    .select({ aantal: sql<number>`count(*)::int` })
    .from(adopties)
    .where(and(eq(adopties.asielId, asielId), eq(adopties.status, 'aangevraagd')))
  const [bevestigd] = await db
    .select({ aantal: sql<number>`count(*)::int` })
    .from(afspraken)
    .where(and(eq(afspraken.asielId, asielId), eq(afspraken.status, 'bevestigd')))
  return `Adopties afgerond: ${afgerond?.aantal ?? 0}\nAdopties aangevraagd (open): ${aangevraagd?.aantal ?? 0}\nBevestigde afspraken: ${bevestigd?.aantal ?? 0}`
}
