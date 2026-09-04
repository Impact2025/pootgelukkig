import { db } from '@/lib/db'
import { users, dossiers, aiGebruik, mailLog, matches, begeleidingen } from '@/lib/db/schema'
import { and, eq, gte, lt, count, sum, desc, sql, type SQL } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

// ─── Gebruikersoverzicht ──────────────────────────────────────────────────────

export interface GebruikerRij {
  id: number
  naam: string
  email: string
  rol: string
  stad: string | null
  organisatieId: string | null
  aangemeldOp: Date
  aantalDossiers: number
  aiKostenEuro: number
  aiCalls: number
  mailVolume: number
  matchesAantal: number
  begeleidingenAantal: number
}

function num(v: unknown): number {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

/**
 * Volledig gebruikersoverzicht met geaggregeerde kosten/activiteit.
 * Gebruikt enkele gegroepeerde queries i.p.v. N+1 per gebruiker.
 */
export async function getGebruikersOverzicht(): Promise<GebruikerRij[]> {
  const [
    alleUsers,
    dossiersPerOrganisatie,
    aiPerUser,
    aiPerOrganisatie,
    mailPerUser,
    matchesPerUser,
    begeleidingenPerOrganisatie,
  ] = await Promise.all([
    db
      .select({
        id: users.id,
        naam: users.naam,
        email: users.email,
        rol: users.rol,
        stad: users.stad,
        organisatieId: users.organisatieId,
        aangemeldOp: users.aangemeldOp,
      })
      .from(users)
      .orderBy(desc(users.aangemeldOp)),
    db
      .select({ organisatieId: dossiers.organisatieId, aantal: count() })
      .from(dossiers)
      .groupBy(dossiers.organisatieId),
    db
      .select({ userId: aiGebruik.userId, kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .groupBy(aiGebruik.userId),
    db
      .select({ organisatieId: aiGebruik.organisatieId, kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .groupBy(aiGebruik.organisatieId),
    db
      .select({ userId: mailLog.userId, aantal: count() })
      .from(mailLog)
      .groupBy(mailLog.userId),
    db
      .select({ userId: matches.userId, aantal: count() })
      .from(matches)
      .groupBy(matches.userId),
    db
      .select({ organisatieId: begeleidingen.organisatieId, aantal: count() })
      .from(begeleidingen)
      .groupBy(begeleidingen.organisatieId),
  ])

  const dossiersMap = new Map(dossiersPerOrganisatie.map((r) => [r.organisatieId, num(r.aantal)]))
  const aiUserMap = new Map(aiPerUser.map((r) => [r.userId, { kosten: num(r.kosten), calls: num(r.calls) }]))
  const aiOrganisatieMap = new Map(aiPerOrganisatie.map((r) => [r.organisatieId, { kosten: num(r.kosten), calls: num(r.calls) }]))
  const mailMap = new Map(mailPerUser.map((r) => [r.userId, num(r.aantal)]))
  const matchMap = new Map(matchesPerUser.map((r) => [r.userId, num(r.aantal)]))
  const begeleidingenMap = new Map(begeleidingenPerOrganisatie.map((r) => [r.organisatieId, num(r.aantal)]))

  return alleUsers.map((u) => {
    const aiUser = aiUserMap.get(u.id) ?? { kosten: 0, calls: 0 }
    const aiOrganisatie = u.organisatieId ? aiOrganisatieMap.get(u.organisatieId) ?? { kosten: 0, calls: 0 } : { kosten: 0, calls: 0 }
    return {
      ...u,
      aantalDossiers: u.organisatieId ? dossiersMap.get(u.organisatieId) ?? 0 : 0,
      aiKostenEuro: aiUser.kosten + aiOrganisatie.kosten,
      aiCalls: aiUser.calls + aiOrganisatie.calls,
      mailVolume: mailMap.get(u.id) ?? 0,
      matchesAantal: matchMap.get(u.id) ?? 0,
      begeleidingenAantal: u.organisatieId ? begeleidingenMap.get(u.organisatieId) ?? 0 : 0,
    }
  })
}

// ─── Detail per gebruiker ─────────────────────────────────────────────────────

export interface GebruikerDetail {
  user: { id: number; naam: string; email: string; rol: string; stad: string | null; organisatieId: string | null; aangemeldOp: Date }
  aiPerActie: { actie: string; kosten: number; calls: number }[]
  aiKostenTotaal: number
  recenteMails: { onderwerp: string; status: string; naar: string; verzondenOp: Date }[]
  matchesAantal: number
  begeleidingenAantal: number
  aantalDossiers: number
}

export async function getGebruikerDetail(userId: number): Promise<GebruikerDetail | null> {
  const [user] = await db
    .select({
      id: users.id,
      naam: users.naam,
      email: users.email,
      rol: users.rol,
      stad: users.stad,
      organisatieId: users.organisatieId,
      aangemeldOp: users.aangemeldOp,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  const organisatieId = user.organisatieId
  const [aiPerActie, recenteMails, [matchCount], [begeleidingenCount], [dossierCount]] = await Promise.all([
    db
      .select({ actie: aiGebruik.actie, kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .where(
        organisatieId
          ? sql`(${aiGebruik.userId} = ${userId} OR ${aiGebruik.organisatieId} = ${organisatieId})`
          : eq(aiGebruik.userId, userId)
      )
      .groupBy(aiGebruik.actie)
      .orderBy(desc(sql`sum(${aiGebruik.kostenEuro})`)),
    db
      .select({ onderwerp: mailLog.onderwerp, status: mailLog.status, naar: mailLog.naar, verzondenOp: mailLog.verzondenOp })
      .from(mailLog)
      .where(sql`${mailLog.userId} = ${userId} OR ${mailLog.naar} = ${user.email}`)
      .orderBy(desc(mailLog.verzondenOp))
      .limit(10),
    db.select({ aantal: count() }).from(matches).where(eq(matches.userId, userId)),
    organisatieId
      ? db.select({ aantal: count() }).from(begeleidingen).where(eq(begeleidingen.organisatieId, organisatieId))
      : Promise.resolve([{ aantal: 0 }]),
    organisatieId
      ? db.select({ aantal: count() }).from(dossiers).where(eq(dossiers.organisatieId, organisatieId))
      : Promise.resolve([{ aantal: 0 }]),
  ])

  const aiActies = aiPerActie.map((r) => ({ actie: r.actie, kosten: num(r.kosten), calls: num(r.calls) }))

  return {
    user,
    aiPerActie: aiActies,
    aiKostenTotaal: aiActies.reduce((s, m) => s + m.kosten, 0),
    recenteMails,
    matchesAantal: num(matchCount?.aantal),
    begeleidingenAantal: num(begeleidingenCount?.aantal),
    aantalDossiers: num(dossierCount?.aantal),
  }
}

// ─── Management KPI's ─────────────────────────────────────────────────────────

export interface ManagementKpis {
  nieuweGebruikers: number
  nieuweMatches: number
  nieuweBegeleidingen: number
  verzondenMails: number
  aiKostenEuro: number
  aiCalls: number
  aiPerActie: { actie: string; kosten: number; calls: number }[]
}

/**
 * Geaggregeerde platformcijfers sinds een bepaald moment (voor dashboard + digests).
 */
export async function getManagementKpis(sinds: Date, tot?: Date): Promise<ManagementKpis> {
  // Bouw een periodefilter dat optioneel begrensd is met een einddatum
  const inPeriode = (kolom: AnyPgColumn): SQL =>
    tot ? (and(gte(kolom, sinds), lt(kolom, tot)) as SQL) : gte(kolom, sinds)

  const [
    [nieuweGebruikers],
    [nieuweMatches],
    [nieuweBegeleidingen],
    [verzondenMails],
    [aiTotaal],
    aiPerActie,
  ] = await Promise.all([
    db.select({ aantal: count() }).from(users).where(inPeriode(users.aangemeldOp)),
    db.select({ aantal: count() }).from(matches).where(inPeriode(matches.berekendOp)),
    db.select({ aantal: count() }).from(begeleidingen).where(inPeriode(begeleidingen.createdAt)),
    db
      .select({ aantal: count() })
      .from(mailLog)
      .where(and(inPeriode(mailLog.verzondenOp), eq(mailLog.status, 'verzonden'))),
    db
      .select({ kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .where(inPeriode(aiGebruik.aangemaaktOp)),
    db
      .select({ actie: aiGebruik.actie, kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .where(inPeriode(aiGebruik.aangemaaktOp))
      .groupBy(aiGebruik.actie)
      .orderBy(desc(sql`sum(${aiGebruik.kostenEuro})`)),
  ])

  return {
    nieuweGebruikers: num(nieuweGebruikers?.aantal),
    nieuweMatches: num(nieuweMatches?.aantal),
    nieuweBegeleidingen: num(nieuweBegeleidingen?.aantal),
    verzondenMails: num(verzondenMails?.aantal),
    aiKostenEuro: num(aiTotaal?.kosten),
    aiCalls: num(aiTotaal?.calls),
    aiPerActie: aiPerActie.map((r) => ({ actie: r.actie, kosten: num(r.kosten), calls: num(r.calls) })),
  }
}

// ─── AI-verbruik per organisatie (dashboard-widget) ────────────────────────────

const INBEGREPEN_BUDGET_EURO = 35

export interface OrganisatieAiVerbruik {
  kostenEuro: number
  calls: number
  budgetEuro: number
  percentage: number
}

/** AI-kosten van de lopende kalendermaand voor één organisatie, afgezet tegen het inbegrepen budget. */
export async function getOrganisatieAiVerbruikDezeMaand(organisatieId: string): Promise<OrganisatieAiVerbruik> {
  const nu = new Date()
  const beginMaand = new Date(nu.getFullYear(), nu.getMonth(), 1)

  const [rij] = await db
    .select({ kosten: sum(aiGebruik.kostenEuro), calls: count() })
    .from(aiGebruik)
    .where(and(eq(aiGebruik.organisatieId, organisatieId), gte(aiGebruik.aangemaaktOp, beginMaand)))

  const kostenEuro = num(rij?.kosten)
  return {
    kostenEuro,
    calls: num(rij?.calls),
    budgetEuro: INBEGREPEN_BUDGET_EURO,
    percentage: Math.min(100, Math.round((kostenEuro / INBEGREPEN_BUDGET_EURO) * 100)),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function euro(bedrag: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(bedrag)
}
