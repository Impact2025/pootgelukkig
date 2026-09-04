import { db } from '@/lib/db'
import {
  dossiers,
  begeleidingen,
  welzijnLogs,
  vrijwilligers,
  donoren,
  fondsenwervingCampagnes,
  aiRollenConfig,
  kenniskluisDocumenten,
} from '@/lib/db/schema'
import { and, eq, ne, desc, sql } from 'drizzle-orm'
import type { AiRolId } from './types'

// ─── Kenniskluis (organisatie-brondocumenten: beleidsplan, Wmo-kader, fondsaanvragen) ──

// Prompt-budget over alle documenten samen — voorkomt dat veel PDF's het contextvenster opblazen.
const KENNISKLUIS_TOTAAL_BUDGET = 24_000

export async function haalKenniskluisContext(organisatieId: string): Promise<string> {
  const documenten = await db
    .select({ bestandsnaam: kenniskluisDocumenten.bestandsnaam, tekstInhoud: kenniskluisDocumenten.tekstInhoud })
    .from(kenniskluisDocumenten)
    .where(and(eq(kenniskluisDocumenten.organisatieId, organisatieId), eq(kenniskluisDocumenten.status, 'verwerkt')))
    .orderBy(desc(kenniskluisDocumenten.aangemaaktOp))

  if (documenten.length === 0) return '  Geen brondocumenten geüpload in de kenniskluis'

  let budgetOver = KENNISKLUIS_TOTAAL_BUDGET
  const secties: string[] = []
  for (const doc of documenten) {
    if (budgetOver <= 0 || !doc.tekstInhoud) continue
    const tekst = doc.tekstInhoud.slice(0, budgetOver)
    budgetOver -= tekst.length
    secties.push(`### ${doc.bestandsnaam}\n${tekst}`)
  }
  return secties.join('\n\n')
}

// ─── Dossiers (zorg-/hulpverleningstrajecten) ─────────────────────────────────

export async function haalDossiersSamenvatting(organisatieId: string, limiet = 30): Promise<string> {
  const rijen = await db
    .select({
      titel: dossiers.titel,
      categorie: dossiers.categorie,
      status: dossiers.status,
      samenvatting: dossiers.samenvatting,
      aangemaakt: dossiers.createdAt,
    })
    .from(dossiers)
    .where(and(eq(dossiers.organisatieId, organisatieId), ne(dossiers.status, 'afgerond')))
    .orderBy(desc(dossiers.createdAt))
    .limit(limiet)
  if (rijen.length === 0) return '  Geen actieve dossiers'
  return rijen
    .map((d) => `- ${d.titel} (${d.categorie}, ${d.status})${d.samenvatting ? ` — ${d.samenvatting.slice(0, 140)}` : ''}`)
    .join('\n')
}

/** Geanonimiseerde recent-afgeronde dossiers — bruikbaar als storytelling-materiaal (Conny) */
export async function haalAfgerondeDossiersSamenvatting(organisatieId: string, limiet = 10): Promise<string> {
  const rijen = await db
    .select({ categorie: dossiers.categorie, samenvatting: dossiers.samenvatting, updatedAt: dossiers.updatedAt })
    .from(dossiers)
    .where(and(eq(dossiers.organisatieId, organisatieId), eq(dossiers.status, 'afgerond')))
    .orderBy(desc(dossiers.updatedAt))
    .limit(limiet)
  if (rijen.length === 0) return '  Geen recent afgeronde trajecten'
  return rijen
    .map((d) => `- Traject (${d.categorie}): ${d.samenvatting ? d.samenvatting.slice(0, 200) : 'geen samenvatting beschikbaar'}`)
    .join('\n')
}

/** Trajectcijfers (begeleidingen) per status — basis voor rapportages (Mila) */
export async function haalBegeleidingCijfers(organisatieId: string): Promise<string> {
  const rijen = await db
    .select({ status: begeleidingen.status, aantal: sql<number>`count(*)::int` })
    .from(begeleidingen)
    .where(eq(begeleidingen.organisatieId, organisatieId))
    .groupBy(begeleidingen.status)
  if (rijen.length === 0) return '  Nog geen begeleidingen geregistreerd'
  return rijen.map((r) => `- ${r.status}: ${r.aantal}`).join('\n')
}

/** Veldlogs (voortgangs-/welzijnsregistraties, dossier-gebonden) van de laatste periode */
export async function haalVeldlogsSamenvatting(organisatieId: string, dagen = 30, limiet = 20): Promise<string> {
  const sinds = new Date(Date.now() - dagen * 86400000)
  const rijen = await db
    .select({ notitie: welzijnLogs.notitie, gelogdOp: welzijnLogs.gelogdOp, dossierTitel: dossiers.titel })
    .from(welzijnLogs)
    .innerJoin(dossiers, eq(welzijnLogs.dossierId, dossiers.id))
    .where(and(eq(dossiers.organisatieId, organisatieId), sql`${welzijnLogs.gelogdOp} >= ${sinds}`))
    .orderBy(desc(welzijnLogs.gelogdOp))
    .limit(limiet)
  if (rijen.length === 0) return '  Geen veldlogs in deze periode'
  return rijen.map((r) => `- ${r.dossierTitel}: ${r.notitie ?? 'geen notitie'} (${new Date(r.gelogdOp).toLocaleDateString('nl-NL')})`).join('\n')
}

// ─── Vrijwilligers / maatjes ────────────────────────────────────────────────────

export async function haalVrijwilligersSamenvatting(organisatieId: string): Promise<string> {
  const rijen = await db
    .select({ naam: vrijwilligers.naam, functie: vrijwilligers.functie, status: vrijwilligers.status, uren: vrijwilligers.urenPerWeek })
    .from(vrijwilligers)
    .where(eq(vrijwilligers.organisatieId, organisatieId))
    .limit(30)
  if (rijen.length === 0) return '  Geen vrijwilligers/maatjes geregistreerd'
  const totaalUren = rijen.reduce((s, r) => s + (r.uren ?? 0), 0)
  return `${rijen.length} vrijwilligers/maatjes (${totaalUren} uur/week totaal)\n` +
    rijen.map((r) => `- ${r.naam} — ${r.functie} (${r.status}, ${r.uren ?? 0} u/u)`).join('\n')
}

// ─── Donoren / fondsen / subsidiecampagnes ──────────────────────────────────────

export async function haalFondsenSamenvatting(organisatieId: string): Promise<string> {
  const d = await db
    .select({ naam: donoren.naam, segment: donoren.segment, totaal: donoren.totaalGedoneerd })
    .from(donoren)
    .where(eq(donoren.organisatieId, organisatieId))
    .orderBy(desc(donoren.totaalGedoneerd))
    .limit(20)
  const c = await db
    .select({ naam: fondsenwervingCampagnes.naam, type: fondsenwervingCampagnes.type, opgehaald: fondsenwervingCampagnes.opgehaaldBedrag, doel: fondsenwervingCampagnes.doelBedrag })
    .from(fondsenwervingCampagnes)
    .where(eq(fondsenwervingCampagnes.organisatieId, organisatieId))
    .limit(10)
  const donorStr = d.length
    ? d.map((x) => `- ${x.naam} (${x.segment}) — €${x.totaal ?? 0}`).join('\n')
    : '  Geen donoren/fondsen geregistreerd'
  const campStr = c.length
    ? c.map((x) => `- ${x.naam} (${x.type}): €${x.opgehaald ?? 0}/€${x.doel ?? 0}`).join('\n')
    : '  Geen lopende campagnes/subsidietrajecten'
  return `DONOREN/FONDSEN (top 20):\n${donorStr}\n\nCAMPAGNES/SUBSIDIES:\n${campStr}`
}

// ─── Lichte kennisbank-retrieve (voor de webassistent 'Samen') ────────────────

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

// ─── Organisatie-specifieke rol-configuratie (custom system-prompt/instellingen) ─

export interface RolConfig {
  actief: boolean
  systemPrompt: string | null
  instellingen: Record<string, unknown>
}

export async function haalRolConfig(organisatieId: string, rol: AiRolId): Promise<RolConfig | null> {
  const [rij] = await db
    .select({
      actief: aiRollenConfig.actief,
      systemPrompt: aiRollenConfig.systemPrompt,
      instellingen: aiRollenConfig.instellingen,
    })
    .from(aiRollenConfig)
    .where(and(eq(aiRollenConfig.organisatieId, organisatieId), eq(aiRollenConfig.rol, rol)))
    .limit(1)
  if (!rij) return null
  return { actief: rij.actief, systemPrompt: rij.systemPrompt, instellingen: rij.instellingen ?? {} }
}
