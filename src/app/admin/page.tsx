export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { organisaties, aiContentQueue } from '@/lib/db/schema'
import { and, eq, count, desc } from 'drizzle-orm'
import Link from 'next/link'
import { euro } from '@/lib/beheer/stats'
import { getOrganisatieAiVerbruikDezeMaand } from '@/lib/beheer/stats'
import { CalmCard, CalmIcon, CalmPill, CalmProgressBar } from '@/components/admin/calm'

function begroeting() {
  const uur = new Date().getHours()
  if (uur < 12) return 'Goedemorgen'
  if (uur < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

const ASSISTENTEN = [
  { rol: 'fundraising' as const, naam: 'Sam', titel: 'Fondsen & Subsidies' },
  { rol: 'rapportage' as const, naam: 'Mila', titel: 'Impact & Verantwoording' },
  { rol: 'social' as const, naam: 'Conny', titel: 'Communicatie & Storytelling' },
]

function tijdGeleden(datum: Date): string {
  const minuten = Math.round((Date.now() - datum.getTime()) / 60000)
  if (minuten < 1) return 'zojuist'
  if (minuten < 60) return `${minuten} min geleden`
  const uren = Math.round(minuten / 60)
  if (uren < 24) return `${uren} u geleden`
  const dagen = Math.round(uren / 24)
  return `${dagen} ${dagen === 1 ? 'dag' : 'dagen'} geleden`
}

export default async function AdminDashboardPage() {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId
  const voornaam = session?.user?.name?.split(' ')[0] ?? 'beheerder'

  let organisatieNaam = 'ImpactOS'
  let onboardingStatus: string | null = null
  if (organisatieId) {
    const [organisatie] = await db
      .select({ naam: organisaties.naam, onboardingStatus: organisaties.onboardingStatus })
      .from(organisaties)
      .where(eq(organisaties.id, organisatieId))
      .limit(1)
    if (organisatie) {
      organisatieNaam = organisatie.naam
      onboardingStatus = organisatie.onboardingStatus
    }
  }

  const [wachtrijResult] = await db
    .select({ aantal: count() })
    .from(aiContentQueue)
    .where(
      organisatieId
        ? and(eq(aiContentQueue.status, 'pending'), eq(aiContentQueue.organisatieId, organisatieId))
        : eq(aiContentQueue.status, 'pending')
    )
  const wachtrij = wachtrijResult?.aantal ?? 0

  const wachtrijItems = organisatieId
    ? await db
        .select({ id: aiContentQueue.id, titel: aiContentQueue.titel, type: aiContentQueue.type })
        .from(aiContentQueue)
        .where(and(eq(aiContentQueue.status, 'pending'), eq(aiContentQueue.organisatieId, organisatieId)))
        .orderBy(desc(aiContentQueue.aangemaaktOp))
        .limit(2)
    : []

  const assistenten = organisatieId
    ? await Promise.all(
        ASSISTENTEN.map(async (a) => {
          const [laatste] = await db
            .select({ titel: aiContentQueue.titel, type: aiContentQueue.type, aangemaaktOp: aiContentQueue.aangemaaktOp })
            .from(aiContentQueue)
            .where(and(eq(aiContentQueue.organisatieId, organisatieId), eq(aiContentQueue.rol, a.rol)))
            .orderBy(desc(aiContentQueue.aangemaaktOp))
            .limit(1)
          const [pendingRow] = await db
            .select({ aantal: count() })
            .from(aiContentQueue)
            .where(and(eq(aiContentQueue.organisatieId, organisatieId), eq(aiContentQueue.rol, a.rol), eq(aiContentQueue.status, 'pending')))
          return {
            ...a,
            laatsteActiviteit: laatste ? laatste.titel ?? laatste.type : null,
            tijdstip: laatste ? tijdGeleden(new Date(laatste.aangemaaktOp)) : null,
            inWachtrij: pendingRow?.aantal ?? 0,
          }
        })
      )
    : ASSISTENTEN.map((a) => ({ ...a, laatsteActiviteit: null, tijdstip: null, inWachtrij: 0 }))

  const verbruik = organisatieId ? await getOrganisatieAiVerbruikDezeMaand(organisatieId) : null

  return (
    <div className="min-h-screen bg-calm-surface font-inter">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-calm-outline-variant/40 bg-calm-surface/90 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-calm-primary-container text-calm-on-primary">
            <CalmIcon name="bolt" className="text-[1.15rem]" fill />
          </span>
          <div className="leading-tight">
            <p className="font-jakarta text-sm font-extrabold text-calm-on-surface">ImpactOS</p>
            <p className="font-inter text-[10px] font-bold uppercase tracking-widest text-calm-on-surface-variant/60">Cockpit</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Zoeken"
            className="flex size-9 items-center justify-center rounded-full text-calm-on-surface-variant transition-colors hover:bg-calm-surface-container"
          >
            <CalmIcon name="search" />
          </button>
          <span className="flex size-9 items-center justify-center rounded-full bg-calm-tertiary text-xs font-extrabold text-white">
            {(session?.user?.name?.trim().charAt(0) || '?').toUpperCase()}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-5 py-6 pb-28 sm:px-8">
        {/* Organisatie + begroeting */}
        <section>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <p className="font-inter text-xs font-bold uppercase tracking-wide text-calm-on-surface-variant">{organisatieNaam}</p>
          </div>
          <h1 className="mt-1 font-jakarta text-2xl font-extrabold leading-tight text-calm-on-surface">
            {begroeting()}, {voornaam}
          </h1>
          <p className="mt-1 font-inter text-sm text-calm-on-surface-variant">
            Rustig aan — hier staat alles wat vandaag jouw aandacht nodig heeft.
          </p>
        </section>

        {/* Onboarding niet afgerond — herinnering om het gesprek met Noor af te maken */}
        {(onboardingStatus === 'niet_gestart' || onboardingStatus === 'bezig' || onboardingStatus === 'overgeslagen') && (
          <Link href="/admin/onboarding" className="block">
            <CalmCard className="flex items-center gap-3 border-calm-primary-container/40 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-calm-tertiary text-sm font-extrabold text-white">N</span>
              <div className="min-w-0 flex-1">
                <p className="font-jakarta text-sm font-bold text-calm-on-surface">Maak je profiel af met Noor</p>
                <p className="truncate font-inter text-xs text-calm-on-surface-variant/70">
                  Een kort gesprek — daarna staan je AI-collega's op maat ingericht.
                </p>
              </div>
              <CalmIcon name="arrow_forward" className="shrink-0 text-calm-on-surface-variant" />
            </CalmCard>
          </Link>
        )}

        {/* Prioriteiten kaart (Focus Card) */}
        <CalmCard className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-calm-primary-container" />
          <div className="p-5 pl-6">
            <div className="flex items-center justify-between">
              <CalmPill tone={wachtrij > 0 ? 'primary' : 'success'} icon={wachtrij > 0 ? 'schedule' : 'check_circle'}>
                {wachtrij} openstaand
              </CalmPill>
            </div>
            <p className="mt-3 font-jakarta text-base font-bold text-calm-on-surface">
              {wachtrij === 0
                ? 'Niets wacht op jouw akkoord'
                : `${wachtrij} ${wachtrij === 1 ? 'besluit wacht' : 'besluiten wachten'} op jouw akkoord`}
            </p>
            {wachtrijItems.length > 0 && (
              <p className="mt-1.5 font-inter text-sm text-calm-on-surface-variant">
                {wachtrijItems.map((i) => i.titel ?? i.type).join(' · ')}
                {wachtrij > wachtrijItems.length ? ` en ${wachtrij - wachtrijItems.length} meer` : ''}
              </p>
            )}
            <Link
              href="/admin/content-queue"
              className="mt-4 inline-flex items-center gap-1.5 font-inter text-sm font-bold text-calm-primary-container hover:underline"
            >
              Bekijk Wachtrij
              <CalmIcon name="arrow_forward" className="text-[1.1rem]" />
            </Link>
          </div>
        </CalmCard>

        {/* Assistenten & voortgang */}
        <section>
          <h2 className="mb-3 font-jakarta text-sm font-extrabold text-calm-on-surface">Je assistenten</h2>
          <CalmCard className="divide-y divide-calm-outline-variant/30">
            {assistenten.map((a) => (
              <div key={a.rol} className="flex items-center gap-3 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-calm-surface-container font-jakarta text-sm font-extrabold text-calm-primary-container">
                  {a.naam.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-jakarta text-sm font-bold text-calm-on-surface">
                    {a.naam} <span className="font-inter font-normal text-calm-on-surface-variant/70">· {a.titel}</span>
                  </p>
                  <p className="truncate font-inter text-xs text-calm-on-surface-variant/70">
                    {a.laatsteActiviteit ? `${a.laatsteActiviteit} · ${a.tijdstip}` : 'Nog geen activiteit'}
                  </p>
                </div>
                <CalmPill tone={a.inWachtrij > 0 ? 'warning' : 'success'}>
                  {a.inWachtrij > 0 ? 'In wachtrij' : 'Gereed'}
                </CalmPill>
              </div>
            ))}
          </CalmCard>
        </section>

        {/* AI-werktegoed */}
        {verbruik && (
          <section id="ai-budget">
            <h2 className="mb-3 font-jakarta text-sm font-extrabold text-calm-on-surface">AI-werktegoed</h2>
            <CalmCard className="p-5">
              <div className="flex items-end justify-between">
                <p className="font-jakarta text-2xl font-extrabold tabular-nums text-calm-on-surface">
                  {euro(verbruik.kostenEuro)}
                  <span className="font-inter text-sm font-semibold text-calm-on-surface-variant/60"> / {euro(verbruik.budgetEuro)} benut</span>
                </p>
                <span className="font-inter text-sm font-bold text-calm-on-surface-variant">{verbruik.percentage}%</span>
              </div>
              <div className="mt-4">
                <CalmProgressBar percentage={verbruik.percentage} />
              </div>
              <p className="mt-3 font-inter text-xs font-semibold text-calm-secondary">
                {verbruik.percentage < 80 ? 'Ruim binnen budget' : verbruik.percentage < 100 ? 'Let op, budget bijna bereikt' : 'Budget overschreden'}
              </p>
            </CalmCard>
          </section>
        )}
      </main>
    </div>
  )
}
