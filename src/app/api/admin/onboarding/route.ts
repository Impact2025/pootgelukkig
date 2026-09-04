import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { organisaties, onboardingBerichten, aiRollenConfig } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { z } from 'zod'
import {
  voerOnboardingBeurtUit,
  consolideerProfiel,
  alsAiRolIds,
  type OnboardingProfielSnapshot,
  type OnboardingHistorieItem,
} from '@/lib/ai/onboarding'
import { checkRateLimit } from '@/lib/rate-limit'
import { stuurOnboardingWelkom } from '@/lib/email'

export const dynamic = 'force-dynamic'

async function haalOrganisatie(organisatieId: string) {
  const [org] = await db.select().from(organisaties).where(eq(organisaties.id, organisatieId)).limit(1)
  return org
}

function naarSnapshot(org: NonNullable<Awaited<ReturnType<typeof haalOrganisatie>>>): OnboardingProfielSnapshot {
  return {
    naam: org.naam,
    rechtsvorm: org.rechtsvorm,
    werkveldCategorieen: org.werkveldCategorieen ?? [],
    gemeenten: org.gemeenten ?? [],
    teamgrootte: org.teamgrootte,
    vrijwilligersAantal: org.vrijwilligersAantal,
    grootsteKnelpunt: org.grootsteKnelpunt,
    toneOfVoice: org.toneOfVoice,
  }
}

// GET — huidige stand van het onboarding-gesprek (voor hervatten na herlaad/sessiewissel).
// Genereert de openingsgroet als het gesprek nog nooit begonnen is.
export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'asiel') {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) {
    return NextResponse.json({ fout: 'Geen organisatie gekoppeld aan dit account' }, { status: 400 })
  }

  const org = await haalOrganisatie(organisatieId)
  if (!org) return NextResponse.json({ fout: 'Organisatie niet gevonden' }, { status: 404 })

  let berichten = await db
    .select({ id: onboardingBerichten.id, afzender: onboardingBerichten.afzender, inhoud: onboardingBerichten.inhoud, createdAt: onboardingBerichten.createdAt })
    .from(onboardingBerichten)
    .where(eq(onboardingBerichten.organisatieId, organisatieId))
    .orderBy(asc(onboardingBerichten.createdAt))

  // Eerste keer openen: laat Noor het gesprek starten en bewaar dat meteen.
  if (berichten.length === 0 && org.onboardingStatus !== 'afgerond' && org.onboardingStatus !== 'overgeslagen') {
    try {
      const resultaat = await voerOnboardingBeurtUit({
        organisatieId,
        profiel: naarSnapshot(org),
        historie: [],
      })
      const [opgeslagen] = await db
        .insert(onboardingBerichten)
        .values({ organisatieId, afzender: 'assistent', inhoud: resultaat.bericht })
        .returning({ id: onboardingBerichten.id, afzender: onboardingBerichten.afzender, inhoud: onboardingBerichten.inhoud, createdAt: onboardingBerichten.createdAt })
      if (org.onboardingStatus === 'niet_gestart') {
        await db.update(organisaties).set({ onboardingStatus: 'bezig', updatedAt: new Date() }).where(eq(organisaties.id, organisatieId))
      }
      berichten = [opgeslagen]
    } catch (err) {
      // Openingsgroet mislukt (bv. AI tijdelijk onbereikbaar) — geen bericht opslaan.
      // Geen dataverlies: er was nog niets. Frontend herkent "geen berichten" en toont
      // een "opnieuw proberen"-state i.p.v. een stil lege chat.
      console.error('[onboarding] openingsgroet mislukt', err)
    }
  }

  return NextResponse.json({
    organisatieNaam: org.naam,
    onboardingStatus: org.onboardingStatus,
    profiel: naarSnapshot(org),
    berichten,
  })
}

const postSchema = z.union([
  z.object({ bericht: z.string().min(1).max(4000) }),
  z.object({ actie: z.literal('overslaan') }),
])

// POST — één beurt: gebruikersbericht wordt EERST opgeslagen (voor de AI-call), zodat een
// mislukte AI-aanroep nooit het bericht van de gebruiker kost. Profielvelden die het model
// teruggeeft worden meteen naar organisaties geschreven, niet pas bij afronding.
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'asiel') {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) {
    return NextResponse.json({ fout: 'Geen organisatie gekoppeld aan dit account' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }

  // Elke beurt kost een AI-call — begrens per organisatie zodat niemand (per ongeluk of
  // moedwillig) het AI-werktegoed kan opjagen door het gesprek te spammen.
  if ('bericht' in parsed.data) {
    const rateLimit = checkRateLimit(`onboarding:${organisatieId}`, 30, 10 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { fout: `Even rustig aan — probeer het over ${rateLimit.retryAfterSec} seconden opnieuw.` },
        { status: 429 }
      )
    }
  }

  if ('actie' in parsed.data) {
    await db
      .update(organisaties)
      .set({ onboardingStatus: 'overgeslagen', updatedAt: new Date() })
      .where(eq(organisaties.id, organisatieId))
    return NextResponse.json({ onboardingStatus: 'overgeslagen' })
  }

  const org = await haalOrganisatie(organisatieId)
  if (!org) return NextResponse.json({ fout: 'Organisatie niet gevonden' }, { status: 404 })

  // Historie ophalen VOORDAT het nieuwe bericht erbij komt (die geven we apart mee).
  const eerdereBerichten = await db
    .select({ afzender: onboardingBerichten.afzender, inhoud: onboardingBerichten.inhoud })
    .from(onboardingBerichten)
    .where(eq(onboardingBerichten.organisatieId, organisatieId))
    .orderBy(asc(onboardingBerichten.createdAt))
  const historie: OnboardingHistorieItem[] = eerdereBerichten

  // Meteen opslaan — vóór de AI-call, zodat dit bericht sowieso bewaard blijft.
  await db.insert(onboardingBerichten).values({ organisatieId, afzender: 'gebruiker', inhoud: parsed.data.bericht })

  let resultaat
  try {
    resultaat = await voerOnboardingBeurtUit({
      organisatieId,
      profiel: naarSnapshot(org),
      historie,
      nieuwBericht: parsed.data.bericht,
    })
  } catch (err) {
    console.error('[onboarding] beurt mislukt', err)
    return NextResponse.json(
      { fout: 'Noor kon niet reageren — je bericht is bewaard, probeer het zo nog eens.' },
      { status: 502 }
    )
  }

  // Profielupdates direct wegschrijven — alleen de velden die deze beurt zijn meegekomen.
  const update: Record<string, unknown> = { updatedAt: new Date() }
  const p = resultaat.profiel
  if (p.rechtsvorm !== undefined) update.rechtsvorm = p.rechtsvorm
  if (p.werkveldCategorieen !== undefined) update.werkveldCategorieen = p.werkveldCategorieen
  if (p.gemeenten !== undefined) update.gemeenten = p.gemeenten
  if (p.teamgrootte !== undefined) update.teamgrootte = p.teamgrootte
  if (p.vrijwilligersAantal !== undefined) update.vrijwilligersAantal = p.vrijwilligersAantal
  if (p.grootsteKnelpunt !== undefined) update.grootsteKnelpunt = p.grootsteKnelpunt
  if (p.toneOfVoice !== undefined) update.toneOfVoice = p.toneOfVoice

  if (resultaat.afgerond) {
    update.onboardingStatus = 'afgerond'
    update.onboardingAfgerondOp = new Date()
  } else if (org.onboardingStatus === 'niet_gestart') {
    update.onboardingStatus = 'bezig'
  }

  await db.update(organisaties).set(update).where(eq(organisaties.id, organisatieId))
  await db.insert(onboardingBerichten).values({ organisatieId, afzender: 'assistent', inhoud: resultaat.bericht })

  // Consolidatiepas bij afronding: het model mist per beurt weleens een genoemd feit (bv. een
  // teamgrootte die terzijde werd genoemd). Nu het transcript compleet is, nog één keer het
  // hele gesprek herlezen en alleen de velden aanvullen die nog leeg staan — nooit al
  // opgeslagen antwoorden overschrijven met een gok.
  if (resultaat.afgerond) {
    try {
      const naOrgUpdate = await haalOrganisatie(organisatieId)
      if (naOrgUpdate) {
        const volledigeHistorie: OnboardingHistorieItem[] = [
          ...historie,
          { afzender: 'gebruiker', inhoud: parsed.data.bericht },
          { afzender: 'assistent', inhoud: resultaat.bericht },
        ]
        const consolidatie = await consolideerProfiel({
          organisatieId,
          historie: volledigeHistorie,
          huidigProfiel: naarSnapshot(naOrgUpdate),
        })
        const aanvulling: Record<string, unknown> = {}
        if (!naOrgUpdate.rechtsvorm && consolidatie.rechtsvorm !== undefined) aanvulling.rechtsvorm = consolidatie.rechtsvorm
        if (!naOrgUpdate.werkveldCategorieen?.length && consolidatie.werkveldCategorieen !== undefined) aanvulling.werkveldCategorieen = consolidatie.werkveldCategorieen
        if (!naOrgUpdate.gemeenten?.length && consolidatie.gemeenten !== undefined) aanvulling.gemeenten = consolidatie.gemeenten
        if (naOrgUpdate.teamgrootte == null && consolidatie.teamgrootte !== undefined) aanvulling.teamgrootte = consolidatie.teamgrootte
        if (naOrgUpdate.vrijwilligersAantal == null && consolidatie.vrijwilligersAantal !== undefined) aanvulling.vrijwilligersAantal = consolidatie.vrijwilligersAantal
        if (!naOrgUpdate.grootsteKnelpunt && consolidatie.grootsteKnelpunt !== undefined) aanvulling.grootsteKnelpunt = consolidatie.grootsteKnelpunt
        if (!naOrgUpdate.toneOfVoice && consolidatie.toneOfVoice !== undefined) aanvulling.toneOfVoice = consolidatie.toneOfVoice
        if (Object.keys(aanvulling).length > 0) {
          await db.update(organisaties).set(aanvulling).where(eq(organisaties.id, organisatieId))
        }
      }
    } catch (err) {
      console.error('[onboarding] consolidatiepas mislukt (niet blokkerend)', err)
    }
  }

  // Pas ná expliciete bevestiging (afgerond=true) activeren we de aanbevolen AI-collega's —
  // zelfde regel als overal elders: niets wordt stilzwijgend aangezet zonder akkoord.
  if (resultaat.afgerond && resultaat.aanbevolenRollen.length > 0) {
    const geactiveerdeRolIds = alsAiRolIds(resultaat.aanbevolenRollen)
    for (const rol of geactiveerdeRolIds) {
      await db
        .insert(aiRollenConfig)
        .values({ organisatieId, rol, actief: true })
        .onConflictDoUpdate({ target: [aiRollenConfig.organisatieId, aiRollenConfig.rol], set: { actief: true } })
    }

    // Welkomstmail — niet-blokkerend: een mislukte verzending mag de onboarding-respons nooit ophouden.
    if (session.user.email) {
      void stuurOnboardingWelkom({
        email: session.user.email,
        organisatieNaam: org.naam,
        contactNaam: session.user.name ?? org.naam,
        geactiveerdeRolIds,
        organisatieId,
      }).catch((err) => console.error('[onboarding] welkomstmail mislukt (niet blokkerend)', err))
    }
  }

  const bijgewerkteOrg = await haalOrganisatie(organisatieId)

  return NextResponse.json({
    bericht: resultaat.bericht,
    klaarVoorBevestiging: resultaat.klaarVoorBevestiging,
    afgerond: resultaat.afgerond,
    aanbevolenRollen: resultaat.aanbevolenRollen,
    onboardingStatus: bijgewerkteOrg?.onboardingStatus ?? org.onboardingStatus,
    profiel: bijgewerkteOrg ? naarSnapshot(bijgewerkteOrg) : naarSnapshot(org),
  })
}
