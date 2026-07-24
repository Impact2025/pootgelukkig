export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dieren, asielen, matches, adopties, favorieten, afspraken } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BottomNav from '@/components/layout/BottomNav'
import AfspraakFlow from './AfspraakFlow'
import FotoCarousel from './FotoCarousel'
import MatchBreakdown from './MatchBreakdown'
import TopActies from './TopActies'
import AIAssistentInline from './AIAssistentInline'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const [dier] = await db
    .select({ naam: dieren.naam, soort: dieren.soort, ras: dieren.ras, leeftijdJaren: dieren.leeftijdJaren, hoofdFotoUrl: dieren.hoofdFotoUrl })
    .from(dieren)
    .where(eq(dieren.id, parseInt(id)))
    .limit(1)

  if (!dier) return { title: 'Dier niet gevonden — PootGelukkig' }

  const omschrijving = [dier.ras ?? dier.soort, dier.leeftijdJaren ? `${dier.leeftijdJaren} jaar` : null]
    .filter(Boolean).join(', ')

  return {
    title: `${dier.naam} — ${omschrijving} | PootGelukkig`,
    description: `Ontmoet ${dier.naam}, een ${omschrijving} die een thuis zoekt. Adopteer via PootGelukkig.`,
    alternates: { canonical: `/animals/${id}` },
    openGraph: {
      title: `${dier.naam} zoekt een thuis`,
      description: `${dier.naam} is een ${omschrijving} in het asiel. Bekijk het profiel en start een match.`,
      images: dier.hoofdFotoUrl ? [{ url: dier.hoofdFotoUrl }] : [],
    },
  }
}

export default async function AnimalProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dierId = parseInt(id)

  if (isNaN(dierId)) notFound()

  const session = await auth()

  // Dier ophalen met asiel info
  const [dier] = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      soort: dieren.soort,
      ras: dieren.ras,
      leeftijdJaren: dieren.leeftijdJaren,
      geslacht: dieren.geslacht,
      gewichtKg: dieren.gewichtKg,
      verhaal: dieren.verhaal,
      status: dieren.status,
      hoofdFotoUrl: dieren.hoofdFotoUrl,
      fotoUrls: dieren.fotoUrls,
      gedragsProfiel: dieren.gedragsProfiel,
      medischPaspoort: dieren.medischPaspoort,
      asielId: dieren.asielId,
      asielNaam: asielen.naam,
      asielStad: asielen.stad,
    })
    .from(dieren)
    .leftJoin(asielen, eq(dieren.asielId, asielen.id))
    .where(eq(dieren.id, dierId))
    .limit(1)

  if (!dier) notFound()

  // Match ophalen als ingelogd
  let matchScore: number | null = null
  let matchAnalyse: string | null = null
  let woningScore: number | null = null
  let energieScore: number | null = null
  let gezinScore: number | null = null
  let ervaringScore: number | null = null
  let alleenThuisScore: number | null = null
  let budgetScore: number | null = null
  let adoptieStatus: string | undefined = undefined
  let isGefavoriet = false
  let afspraakData: {
    id: number; status: string; type: string
    voorkeurDatum: string; voorkeurTijdslot: string
    bevestigdeDatum: string | null; bevestigdTijdstip: string | null
    notitieAsiel: string | null
  } | null = null

  if (session?.user?.id) {
    const userId = parseInt(session.user.id)

    const [match] = await db
      .select({
        score: matches.score,
        analyseTekst: matches.analyseTekst,
        woningScore: matches.woningScore,
        energieScore: matches.energieScore,
        gezinScore: matches.gezinScore,
        ervaringScore: matches.ervaringScore,
        alleenThuisScore: matches.alleenThuisScore,
        budgetScore: matches.budgetScore,
      })
      .from(matches)
      .where(and(eq(matches.userId, userId), eq(matches.dierId, dierId)))
      .limit(1)

    if (match) {
      matchScore = match.score
      matchAnalyse = match.analyseTekst
      woningScore = match.woningScore
      energieScore = match.energieScore
      gezinScore = match.gezinScore
      ervaringScore = match.ervaringScore
      alleenThuisScore = match.alleenThuisScore
      budgetScore = match.budgetScore
    }

    const [adoptie] = await db
      .select({ status: adopties.status })
      .from(adopties)
      .where(and(eq(adopties.userId, userId), eq(adopties.dierId, dierId)))
      .limit(1)

    adoptieStatus = adoptie?.status ?? undefined

    const [afspraakRij] = await db
      .select({
        id: afspraken.id,
        status: afspraken.status,
        type: afspraken.type,
        voorkeurDatum: afspraken.voorkeurDatum,
        voorkeurTijdslot: afspraken.voorkeurTijdslot,
        bevestigdeDatum: afspraken.bevestigdeDatum,
        bevestigdTijdstip: afspraken.bevestigdTijdstip,
        notitieAsiel: afspraken.notitieAsiel,
      })
      .from(afspraken)
      .where(and(eq(afspraken.userId, userId), eq(afspraken.dierId, dierId)))
      .orderBy(afspraken.aangemaaktOp)
      .limit(1)

    afspraakData = afspraakRij
      ? {
          ...afspraakRij,
          voorkeurDatum: afspraakRij.voorkeurDatum.toISOString(),
          bevestigdeDatum: afspraakRij.bevestigdeDatum?.toISOString() ?? null,
        }
      : null

    const [favoriet] = await db
      .select({ id: favorieten.id })
      .from(favorieten)
      .where(and(eq(favorieten.userId, userId), eq(favorieten.dierId, dierId)))
      .limit(1)

    isGefavoriet = !!favoriet
  }

  const geslachtLabel =
    dier.geslacht === 'reu'
      ? 'Reu'
      : dier.geslacht === 'teef'
        ? 'Teef'
        : dier.geslacht === 'man'
          ? 'Man'
          : dier.geslacht === 'vrouw'
            ? 'Vrouw'
            : dier.geslacht ?? ''

  return (
    <div className="mobile-container bg-bg-dark">
      {/* Top overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent max-w-[430px] mx-auto">
        <Link href="/dashboard">
          <button className="flex items-center justify-center size-10 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition-colors">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
        </Link>
        <TopActies
          dierId={dier.id}
          dierNaam={dier.naam}
          isGefavoriet={isGefavoriet}
        />
      </div>

      {/* Hero foto carousel */}
      <div className="relative">
        <FotoCarousel
          naam={dier.naam}
          hoofdFotoUrl={dier.hoofdFotoUrl}
          fotoUrls={dier.fotoUrls ?? []}
        />
        {/* Naam overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          {matchScore !== null && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-bg-dark rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              {matchScore}% Match voor jou
            </div>
          )}
          <h1 className="text-white text-4xl font-extrabold leading-tight drop-shadow-lg">
            {dier.naam}
            {dier.leeftijdJaren ? `, ${dier.leeftijdJaren} jaar` : ''}
          </h1>
          <p className="text-white/80 text-sm font-medium mt-1 drop-shadow-md">
            {[dier.ras ?? dier.soort, geslachtLabel, dier.gewichtKg ? `${dier.gewichtKg} kg` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-8 pb-40">
        {/* Match Analyse */}
        {matchScore !== null && (
          <MatchBreakdown
            score={matchScore}
            analyse={matchAnalyse}
            diernaam={dier.naam}
            scores={{
              woning: woningScore,
              energie: energieScore,
              gezin: gezinScore,
              ervaring: ervaringScore,
              alleenThuis: alleenThuisScore,
              budget: budgetScore,
            }}
          />
        )}

        {/* Persoonlijkheid */}
        {dier.gedragsProfiel?.tags && dier.gedragsProfiel.tags.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Persoonlijkheid</h2>
            <div className="flex flex-wrap gap-2">
              {dier.gedragsProfiel.tags.map((tag) => (
                <div key={tag} className="personality-tag">
                  <span className="material-symbols-outlined text-sm text-primary">verified</span>
                  <span>{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                </div>
              ))}
              {dier.gedragsProfiel.kindvriendelijk && (
                <div className="personality-tag">
                  <span className="material-symbols-outlined text-sm text-primary">child_care</span>
                  <span>Kindvriendelijk</span>
                </div>
              )}
              {dier.gedragsProfiel.katVriendelijk && (
                <div className="personality-tag">
                  <span className="material-symbols-outlined text-sm text-primary">cruelty_free</span>
                  <span>Kat-vriendelijk</span>
                </div>
              )}
              {dier.gedragsProfiel.hondenVriendelijk && (
                <div className="personality-tag">
                  <span className="material-symbols-outlined text-sm text-primary">pets</span>
                  <span>Honden-vriendelijk</span>
                </div>
              )}
            </div>

            {/* Energie meter */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Energieniveau</span>
                <span className="text-white font-semibold text-sm capitalize">
                  {dier.gedragsProfiel.energieNiveau?.replace('_', ' ') ?? 'Onbekend'}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width:
                      dier.gedragsProfiel.energieNiveau === 'laag'
                        ? '25%'
                        : dier.gedragsProfiel.energieNiveau === 'normaal'
                          ? '50%'
                          : dier.gedragsProfiel.energieNiveau === 'hoog'
                            ? '75%'
                            : '100%',
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Medisch Paspoort */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Medisch Paspoort</h2>
          <div className="space-y-3">
            <MedischItem
              icon="vaccines"
              label="Vaccinaties"
              waarde={dier.medischPaspoort?.gevaccineerd ? 'Volledig bijgewerkt' : 'Niet bijgewerkt'}
              ok={dier.medischPaspoort?.gevaccineerd ?? false}
            />
            <MedischItem
              icon="content_cut"
              label="Gecastreerd"
              waarde={dier.medischPaspoort?.gecastreerd ? 'Ja' : 'Nee'}
              ok={dier.medischPaspoort?.gecastreerd ?? false}
            />
            <MedischItem
              icon="qr_code_2"
              label="Gechippt"
              waarde={
                dier.medischPaspoort?.gechippt
                  ? dier.medischPaspoort.chipNummer ?? 'Geregistreerd'
                  : 'Nee'
              }
              ok={dier.medischPaspoort?.gechippt ?? false}
            />
          </div>
        </section>

        {/* Verhaal */}
        {dier.verhaal && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold">Verhaal van {dier.naam}</h2>
            <p className="text-sm leading-relaxed text-white/60">{dier.verhaal}</p>
          </section>
        )}

        {/* AI Assistent */}
        {session?.user && (
          <AIAssistentInline dierId={dier.id} dierNaam={dier.naam} />
        )}

        {/* Asiel info */}
        {dier.asielNaam && (
          <section className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <Link href={`/asielen/${dier.asielId}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="size-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white/60">home_work</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{dier.asielNaam}</p>
                <p className="text-xs text-white/40">{dier.asielStad}</p>
              </div>
            </Link>
            <Link href={`/chat/dier/${dier.id}`} className="ml-auto flex-shrink-0">
              <button className="text-primary text-xs font-bold border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
                Bericht
              </button>
            </Link>
          </section>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-bg-dark via-bg-dark to-transparent z-30 max-w-[430px] mx-auto">
        {dier.asielId ? (
          <AfspraakFlow
            dierId={dier.id}
            dierNaam={dier.naam}
            asielId={dier.asielId}
            afspraak={afspraakData}
            adoptieStatus={adoptieStatus}
          />
        ) : (
          <Link href={`/chat/dier/${dier.id}`}>
            <button className="w-full bg-white/5 border border-white/15 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary">chat</span>
              Stel een vraag aan het asiel
            </button>
          </Link>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function MedischItem({
  icon,
  label,
  waarde,
  ok,
}: {
  icon: string
  label: string
  waarde: string
  ok: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/8 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-[11px] text-white/40 uppercase tracking-wide">{waarde}</p>
        </div>
      </div>
      <span
        className={`material-symbols-outlined ${ok ? 'text-primary' : 'text-white/20'}`}
        style={ok ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {ok ? 'check_circle' : 'cancel'}
      </span>
    </div>
  )
}
