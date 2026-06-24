import { db } from '@/lib/db'
import { users, dieren, aiGebruik, mailLog, matches, adopties } from '@/lib/db/schema'
import { and, eq, gte, lt, count, sum, desc, sql, type SQL } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

// ─── Gebruikersoverzicht ──────────────────────────────────────────────────────

export interface GebruikerRij {
  id: number
  naam: string
  email: string
  rol: string
  stad: string | null
  asielId: number | null
  aangemeldOp: Date
  aantalDieren: number
  aiKostenEuro: number
  aiCalls: number
  mailVolume: number
  matchesAantal: number
  adoptiesAantal: number
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
    dierenPerAsiel,
    aiPerUser,
    aiPerAsiel,
    mailPerUser,
    matchesPerUser,
    adoptiesPerUser,
  ] = await Promise.all([
    db
      .select({
        id: users.id,
        naam: users.naam,
        email: users.email,
        rol: users.rol,
        stad: users.stad,
        asielId: users.asielId,
        aangemeldOp: users.aangemeldOp,
      })
      .from(users)
      .orderBy(desc(users.aangemeldOp)),
    db
      .select({ asielId: dieren.asielId, aantal: count() })
      .from(dieren)
      .groupBy(dieren.asielId),
    db
      .select({ userId: aiGebruik.userId, kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .groupBy(aiGebruik.userId),
    db
      .select({ asielId: aiGebruik.asielId, kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .groupBy(aiGebruik.asielId),
    db
      .select({ userId: mailLog.userId, aantal: count() })
      .from(mailLog)
      .groupBy(mailLog.userId),
    db
      .select({ userId: matches.userId, aantal: count() })
      .from(matches)
      .groupBy(matches.userId),
    db
      .select({ userId: adopties.userId, aantal: count() })
      .from(adopties)
      .groupBy(adopties.userId),
  ])

  const dierenMap = new Map(dierenPerAsiel.map((r) => [r.asielId, num(r.aantal)]))
  const aiUserMap = new Map(aiPerUser.map((r) => [r.userId, { kosten: num(r.kosten), calls: num(r.calls) }]))
  const aiAsielMap = new Map(aiPerAsiel.map((r) => [r.asielId, { kosten: num(r.kosten), calls: num(r.calls) }]))
  const mailMap = new Map(mailPerUser.map((r) => [r.userId, num(r.aantal)]))
  const matchMap = new Map(matchesPerUser.map((r) => [r.userId, num(r.aantal)]))
  const adoptieMap = new Map(adoptiesPerUser.map((r) => [r.userId, num(r.aantal)]))

  return alleUsers.map((u) => {
    const aiUser = aiUserMap.get(u.id) ?? { kosten: 0, calls: 0 }
    const aiAsiel = u.asielId ? aiAsielMap.get(u.asielId) ?? { kosten: 0, calls: 0 } : { kosten: 0, calls: 0 }
    return {
      ...u,
      aantalDieren: u.asielId ? dierenMap.get(u.asielId) ?? 0 : 0,
      aiKostenEuro: aiUser.kosten + aiAsiel.kosten,
      aiCalls: aiUser.calls + aiAsiel.calls,
      mailVolume: mailMap.get(u.id) ?? 0,
      matchesAantal: matchMap.get(u.id) ?? 0,
      adoptiesAantal: adoptieMap.get(u.id) ?? 0,
    }
  })
}

// ─── Detail per gebruiker ─────────────────────────────────────────────────────

export interface GebruikerDetail {
  user: { id: number; naam: string; email: string; rol: string; stad: string | null; asielId: number | null; aangemeldOp: Date }
  aiPerModule: { module: string; kosten: number; calls: number }[]
  aiKostenTotaal: number
  recenteMails: { onderwerp: string; status: string; naar: string; verzondenOp: Date }[]
  matchesAantal: number
  adoptiesAantal: number
  aantalDieren: number
}

export async function getGebruikerDetail(userId: number): Promise<GebruikerDetail | null> {
  const [user] = await db
    .select({
      id: users.id,
      naam: users.naam,
      email: users.email,
      rol: users.rol,
      stad: users.stad,
      asielId: users.asielId,
      aangemeldOp: users.aangemeldOp,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  const asielId = user.asielId
  const [aiPerModule, recenteMails, [matchCount], [adoptieCount], [dierCount]] = await Promise.all([
    db
      .select({ module: aiGebruik.module, kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .where(
        asielId
          ? sql`(${aiGebruik.userId} = ${userId} OR ${aiGebruik.asielId} = ${asielId})`
          : eq(aiGebruik.userId, userId)
      )
      .groupBy(aiGebruik.module)
      .orderBy(desc(sql`sum(${aiGebruik.kostenEuro})`)),
    db
      .select({ onderwerp: mailLog.onderwerp, status: mailLog.status, naar: mailLog.naar, verzondenOp: mailLog.verzondenOp })
      .from(mailLog)
      .where(sql`${mailLog.userId} = ${userId} OR ${mailLog.naar} = ${user.email}`)
      .orderBy(desc(mailLog.verzondenOp))
      .limit(10),
    db.select({ aantal: count() }).from(matches).where(eq(matches.userId, userId)),
    db.select({ aantal: count() }).from(adopties).where(eq(adopties.userId, userId)),
    asielId
      ? db.select({ aantal: count() }).from(dieren).where(eq(dieren.asielId, asielId))
      : Promise.resolve([{ aantal: 0 }]),
  ])

  const aiModules = aiPerModule.map((r) => ({ module: r.module, kosten: num(r.kosten), calls: num(r.calls) }))

  return {
    user,
    aiPerModule: aiModules,
    aiKostenTotaal: aiModules.reduce((s, m) => s + m.kosten, 0),
    recenteMails,
    matchesAantal: num(matchCount?.aantal),
    adoptiesAantal: num(adoptieCount?.aantal),
    aantalDieren: num(dierCount?.aantal),
  }
}

// ─── Management KPI's ─────────────────────────────────────────────────────────

export interface ManagementKpis {
  nieuweGebruikers: number
  nieuweMatches: number
  nieuweAdopties: number
  verzondenMails: number
  aiKostenEuro: number
  aiCalls: number
  aiPerModule: { module: string; kosten: number; calls: number }[]
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
    [nieuweAdopties],
    [verzondenMails],
    [aiTotaal],
    aiPerModule,
  ] = await Promise.all([
    db.select({ aantal: count() }).from(users).where(inPeriode(users.aangemeldOp)),
    db.select({ aantal: count() }).from(matches).where(inPeriode(matches.berekendOp)),
    db.select({ aantal: count() }).from(adopties).where(inPeriode(adopties.aangevraagdOp)),
    db
      .select({ aantal: count() })
      .from(mailLog)
      .where(and(inPeriode(mailLog.verzondenOp), eq(mailLog.status, 'verzonden'))),
    db
      .select({ kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .where(inPeriode(aiGebruik.aangemaaktOp)),
    db
      .select({ module: aiGebruik.module, kosten: sum(aiGebruik.kostenEuro), calls: count() })
      .from(aiGebruik)
      .where(inPeriode(aiGebruik.aangemaaktOp))
      .groupBy(aiGebruik.module)
      .orderBy(desc(sql`sum(${aiGebruik.kostenEuro})`)),
  ])

  return {
    nieuweGebruikers: num(nieuweGebruikers?.aantal),
    nieuweMatches: num(nieuweMatches?.aantal),
    nieuweAdopties: num(nieuweAdopties?.aantal),
    verzondenMails: num(verzondenMails?.aantal),
    aiKostenEuro: num(aiTotaal?.kosten),
    aiCalls: num(aiTotaal?.calls),
    aiPerModule: aiPerModule.map((r) => ({ module: r.module, kosten: num(r.kosten), calls: num(r.calls) })),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function euro(bedrag: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(bedrag)
}
