import { NextRequest, NextResponse } from 'next/server'
import { and, desc, eq, gt } from 'drizzle-orm'
import { auth } from '@/auth'
import { verwerkIntakeAntwoorden } from '@/lib/ai/intake'
import { berekenFallbackScore, genereerMatchAnalyse, hashProfiel, type AdopterProfiel, type DierProfiel } from '@/lib/ai/matching'
import { db } from '@/lib/db'
import { adopterProfielen, dieren, matches } from '@/lib/db/schema'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'

type WoningType = 'appartement' | 'huis_zonder_tuin' | 'huis_met_tuin' | 'boerderij'
type ActiviteitNiveau = 'laag' | 'normaal' | 'hoog' | 'zeer_hoog'

const WONING_TYPEN: WoningType[] = ['appartement', 'huis_zonder_tuin', 'huis_met_tuin', 'boerderij']
const ACTIVITEIT_NIVEAUS: ActiviteitNiveau[] = ['laag', 'normaal', 'hoog', 'zeer_hoog']

function mapProfielNaarDb(profiel: AdopterProfiel, hash: string) {
  const rawWoning = String(profiel.woningType ?? '')
  const rawActiviteit = String(profiel.activiteitNiveau ?? '')

  return {
    woningType: (WONING_TYPEN.includes(rawWoning as WoningType)
      ? rawWoning
      : null) as WoningType | null,
    heeftTuin: Boolean(profiel.heeftTuin),
    tuinOppervlakte: profiel.tuinOppervlakte ?? null,
    activiteitNiveau: (ACTIVITEIT_NIVEAUS.includes(rawActiviteit as ActiviteitNiveau)
      ? rawActiviteit
      : 'normaal') as ActiviteitNiveau,
    aantalVolwassenen: Number(profiel.aantalVolwassenen ?? 1),
    aantalKinderen: Number(profiel.aantalKinderen ?? 0),
    jongsteKindLeeftijd: profiel.jongsteKindLeeftijd ?? null,
    andereDieren: profiel.andereDieren ?? [],
    werkUrenPerDag: Number(profiel.werkUrenPerDag ?? 8),
    ervaringNiveau: String(profiel.ervaringNiveau ?? 'geen'),
    budgetDierenarts: String(profiel.budgetDierenarts ?? 'normaal'),
    allergieën: profiel.allergieën ?? [],
    diersoortVoorkeur: profiel.diersoortVoorkeur ?? [],
    leeftijdVoorkeur: String(profiel.leeftijdVoorkeur ?? 'maakt_niet_uit'),
    profielHash: hash,
  }
}

/**
 * Controleer of de gecachede matches nog geldig zijn:
 * - profiel niet veranderd (via hash)
 * - geen nieuwe beschikbare dieren toegevoegd
 */
async function isMatchCacheGeldig(userId: number, nieuweHash: string): Promise<boolean> {
  // Haal meest recente match-berekening op
  const [latestMatch] = await db
    .select({ berekendOp: matches.berekendOp })
    .from(matches)
    .where(eq(matches.userId, userId))
    .orderBy(desc(matches.berekendOp))
    .limit(1)

  if (!latestMatch) return false

  // Controleer of profiel veranderd is via hash
  const [opgeslagenProfiel] = await db
    .select({ profielHash: adopterProfielen.profielHash })
    .from(adopterProfielen)
    .where(eq(adopterProfielen.userId, userId))
    .limit(1)

  if (!opgeslagenProfiel?.profielHash || opgeslagenProfiel.profielHash !== nieuweHash) {
    return false
  }

  // Controleer of er nieuwe dieren zijn bijgekomen
  const [nieuwDier] = await db
    .select({ id: dieren.id })
    .from(dieren)
    .where(
      and(
        eq(dieren.status, 'beschikbaar'),
        gt(dieren.aangemaaktOp, latestMatch.berekendOp)
      )
    )
    .limit(1)

  return !nieuwDier
}

/**
 * Haal historische successtatistieken op voor de feedback loop.
 * Geeft per diersoort een contextzin terug als er genoeg data is (min. 5 uitkomsten).
 */
async function haalSuccesContext(
  profiel: AdopterProfiel
): Promise<Record<string, string>> {
  // Minimale datavereiste: zelfde woningtype + activiteitsniveau
  const relevanteProfielenSubquery = db
    .select({ userId: adopterProfielen.userId })
    .from(adopterProfielen)
    .where(
      and(
        eq(adopterProfielen.woningType, (profiel.woningType ?? 'huis_zonder_tuin') as WoningType),
        eq(
          adopterProfielen.activiteitNiveau,
          (profiel.activiteitNiveau ?? 'normaal') as ActiviteitNiveau
        )
      )
    )

  const historischeMatches = await db
    .select({
      soort: dieren.soort,
      uitkomst: matches.uitkomst,
    })
    .from(matches)
    .innerJoin(dieren, eq(matches.dierId, dieren.id))
    .where(
      and(
        eq(matches.userId, relevanteProfielenSubquery as unknown as number),
        // Alleen matches met geregistreerde uitkomst
        gt(matches.uitkomstOp, new Date(0))
      )
    )

  // Groepeer per soort en bereken succesratio
  const stats: Record<string, { geadopteerd: number; totaal: number }> = {}
  for (const m of historischeMatches) {
    if (!m.soort) continue
    if (!stats[m.soort]) stats[m.soort] = { geadopteerd: 0, totaal: 0 }
    stats[m.soort].totaal++
    if (m.uitkomst === 'geadopteerd') stats[m.soort].geadopteerd++
  }

  const context: Record<string, string> = {}
  for (const [soort, { geadopteerd, totaal }] of Object.entries(stats)) {
    if (totaal < 5) continue // Niet genoeg data
    const pct = Math.round((geadopteerd / totaal) * 100)
    context[soort] =
      `Vergelijkbare adoptanten (zelfde woning + activiteitsniveau) adopteerden in ${pct}% van de gevallen succesvol een ${soort} (n=${totaal}).`
  }

  return context
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // ── Rate limiting ──────────────────────────────────────────────────────────
    const rateLimitKey = getRateLimitKey(request, session?.user?.id ?? undefined, 'intake')
    const rateLimit = checkRateLimit(rateLimitKey, 20, 60 * 60 * 1000) // 20x per uur

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Te veel verzoeken. Probeer het over ${rateLimit.retryAfterSec} seconden opnieuw.` },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSec) },
        }
      )
    }

    // ── Input validatie ────────────────────────────────────────────────────────
    const body = await request.json()
    const { antwoorden } = body

    if (!antwoorden || typeof antwoorden !== 'object') {
      return NextResponse.json({ error: 'Ongeldige antwoorden' }, { status: 400 })
    }

    // ── Intake verwerken (deterministisch + AI aanbeveling) ───────────────────
    const resultaat = await verwerkIntakeAntwoorden(antwoorden)
    const profiel = resultaat.profiel
    const nieuweHash = hashProfiel(profiel)

    // ── Matches berekenen (alleen als ingelogd) ────────────────────────────────
    if (session?.user?.id) {
      const userId = parseInt(session.user.id)

      // Cache check: sla N AI-calls over als niets veranderd is
      const cacheGeldig = await isMatchCacheGeldig(userId, nieuweHash)

      if (cacheGeldig) {
        // Profiel en dieren ongewijzigd — return direct zonder AI-calls
        return NextResponse.json({
          data: {
            profiel,
            aanbeveling: resultaat.aanbeveling,
            risicos: resultaat.risicos,
            crossSpeciesSuggestie: resultaat.crossSpeciesSuggestie,
            succes: true,
            vanCache: true,
          },
        })
      }

      // Cache miss: profiel opslaan en matches herberekenen
      const dbVelden = mapProfielNaarDb(profiel, nieuweHash)

      const [bestaand] = await db
        .select({ id: adopterProfielen.id })
        .from(adopterProfielen)
        .where(eq(adopterProfielen.userId, userId))
        .limit(1)

      if (bestaand) {
        await db
          .update(adopterProfielen)
          .set({ ...dbVelden, bijgewerktOp: new Date() })
          .where(eq(adopterProfielen.userId, userId))
      } else {
        await db.insert(adopterProfielen).values({ userId, ...dbVelden })
      }

      const beschikbareDieren = await db.select().from(dieren).where(eq(dieren.status, 'beschikbaar'))

      // Matches berekenen via snelle rule-based scoring (geen AI-calls)
      const matchResultaten = beschikbareDieren.map((dier) => {
        try {
          return berekenFallbackScore(profiel, {
            id: dier.id,
            naam: dier.naam,
            soort: dier.soort,
            ras: dier.ras ?? null,
            leeftijdJaren: dier.leeftijdJaren ?? null,
            gewichtKg: dier.gewichtKg ?? null,
            gedragsProfiel: dier.gedragsProfiel ?? null,
            medischPaspoort: dier.medischPaspoort ?? null,
          })
        } catch {
          return null
        }
      })

      // Opslaan: oude matches weg, nieuwe erin
      await db.delete(matches).where(eq(matches.userId, userId))

      const teOpslaan = matchResultaten
        .filter((m): m is NonNullable<typeof m> => m !== null && m.score > 0)
        .map((m) => ({
          userId,
          dierId: m.dierId,
          score: m.score,
          analyseTekst: m.analyseTekst,
          woningScore: m.woningScore,
          energieScore: m.energieScore,
          gezinScore: m.gezinScore,
          ervaringScore: m.ervaringScore,
          alleenThuisScore: m.alleenThuisScore,
          budgetScore: m.budgetScore,
          isAanbevolen: m.score >= 80,
        }))

      if (teOpslaan.length > 0) {
        await db.insert(matches).values(teOpslaan)
      }

      // Genereer rijke AI-motivatietekst voor de top 3 matches (parallel)
      const top3 = [...teOpslaan].sort((a, b) => b.score - a.score).slice(0, 3)

      await Promise.allSettled(
        top3.map(async (match) => {
          const dier = beschikbareDieren.find((d) => d.id === match.dierId)
          if (!dier) return

          const dierProfiel: DierProfiel = {
            id: dier.id,
            naam: dier.naam,
            soort: dier.soort,
            ras: dier.ras ?? null,
            leeftijdJaren: dier.leeftijdJaren ?? null,
            gewichtKg: dier.gewichtKg ?? null,
            gedragsProfiel: dier.gedragsProfiel ?? null,
            medischPaspoort: dier.medischPaspoort ?? null,
          }

          const rijkeTekst = await genereerMatchAnalyse(profiel, dierProfiel, match.score)

          await db
            .update(matches)
            .set({ analyseTekst: rijkeTekst })
            .where(and(eq(matches.userId, userId), eq(matches.dierId, match.dierId)))
        })
      )
    }

    return NextResponse.json({
      data: {
        profiel,
        aanbeveling: resultaat.aanbeveling,
        risicos: resultaat.risicos,
        crossSpeciesSuggestie: resultaat.crossSpeciesSuggestie,
        succes: true,
      },
    })
  } catch (error) {
    console.error('Intake API fout:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verwerken van de intake' },
      { status: 500 }
    )
  }
}
