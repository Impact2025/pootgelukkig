export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { adopties, dieren, asielen, medischeRecords } from '@/lib/db/schema'
import { and, desc, eq, or } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BottomNav from '@/components/layout/BottomNav'

export default async function DossierPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = parseInt(session.user.id)

  // Meest recente adoptie ophalen (afgerond of goedgekeurd)
  const [adoptie] = await db
    .select({
      id: adopties.id,
      status: adopties.status,
      adoptieDatum: adopties.adoptieDatum,
      overeenkomstUrl: adopties.overeenkomstUrl,
      irRegistratieUrl: adopties.irRegistratieUrl,
      verzekeringMaatschappij: adopties.verzekeringMaatschappij,
      verzekeringPolisnummer: adopties.verzekeringPolisnummer,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierRas: dieren.ras,
      dierLeeftijdJaren: dieren.leeftijdJaren,
      dierHoofdFotoUrl: dieren.hoofdFotoUrl,
      dierId: dieren.id,
      dierChipNummer: dieren.medischPaspoort,
      asielNaam: asielen.naam,
    })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .innerJoin(asielen, eq(adopties.asielId, asielen.id))
    .where(
      and(
        eq(adopties.userId, userId),
        or(eq(adopties.status, 'afgerond'), eq(adopties.status, 'goedgekeurd'))
      )
    )
    .orderBy(desc(adopties.adoptieDatum))
    .limit(1)

  // Geen adoptie
  if (!adoptie) {
    return (
      <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-[#f0f4f0]">
        <header className="sticky top-0 z-50 bg-white/80 ios-blur border-b border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/dashboard">
              <button className="text-slate-600">
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Mijn Dossier</h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
          <span className="material-symbols-outlined text-slate-300 text-6xl">folder_open</span>
          <h2 className="text-xl font-bold text-slate-700">Nog geen adoptie</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Je dossier wordt aangemaakt zodra je een adoptie hebt afgerond.
          </p>
          <Link href="/dashboard">
            <button className="bg-terracotta-dark text-white font-bold py-3 px-6 rounded-xl">
              Bekijk matches
            </button>
          </Link>
        </main>
        <BottomNav />
      </div>
    )
  }

  // Medische records ophalen (preview: laatste 2)
  const medisch = await db
    .select({
      id: medischeRecords.id,
      titel: medischeRecords.titel,
      datum: medischeRecords.datum,
      status: medischeRecords.status,
      volgendeDatum: medischeRecords.volgendeDatum,
    })
    .from(medischeRecords)
    .where(eq(medischeRecords.dierId, adoptie.dierId))
    .orderBy(desc(medischeRecords.datum))
    .limit(2)

  const chipNummer =
    (adoptie.dierChipNummer as { chipNummer?: string } | null)?.chipNummer ?? null

  const adoptieDatumLabel = adoptie.adoptieDatum
    ? new Date(adoptie.adoptieDatum).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Onbekend'

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-[#f0f4f0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 ios-blur border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="text-slate-600">
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Mijn Dossier</h1>
          </div>
          <button className="text-terracotta-dark">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 pb-24">
        {/* Dier header */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden relative bg-slate-100">
            {adoptie.dierHoofdFotoUrl ? (
              <Image
                src={adoptie.dierHoofdFotoUrl}
                alt={adoptie.dierNaam}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-300 text-3xl">pets</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{adoptie.dierNaam}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  adoptie.status === 'afgerond'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {adoptie.status === 'afgerond' ? 'Geadopteerd' : 'Goedgekeurd'}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {[adoptie.dierRas, adoptie.dierLeeftijdJaren ? `${adoptie.dierLeeftijdJaren} jaar` : null]
                .filter(Boolean)
                .join(' • ')}
            </p>
            {adoptie.adoptieDatum && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">calendar_month</span>
                Adoptie: {adoptieDatumLabel}
              </p>
            )}
          </div>
        </div>

        {/* Documenten */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            Documenten &amp; Registratie
          </h3>

          {/* I&R Document */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-terracotta-dark shrink-0">
                <span className="material-symbols-outlined">picture_as_pdf</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 truncate">
                  Identificatie &amp; Registratie (I&amp;R)
                </h4>
                {chipNummer ? (
                  <p className="text-xs text-slate-500">Chipnummer: {chipNummer}</p>
                ) : (
                  <p className="text-xs text-slate-400 italic">Chip niet geregistreerd</p>
                )}
              </div>
              {adoptie.irRegistratieUrl ? (
                <a href={adoptie.irRegistratieUrl} target="_blank" rel="noopener noreferrer">
                  <button className="bg-slate-50 p-2 rounded-lg text-terracotta-dark">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </a>
              ) : (
                <button className="bg-slate-50 p-2 rounded-lg text-slate-300" disabled>
                  <span className="material-symbols-outlined">download</span>
                </button>
              )}
            </div>
          </div>

          {/* Medisch Paspoort */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <div className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-terracotta-dark shrink-0">
                  <span className="material-symbols-outlined">medical_services</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900">Medisch Paspoort</h4>
                  <p className="text-xs text-slate-500">Vaccinatiegeschiedenis &amp; Checks</p>
                </div>
                <Link href={`/medical/${adoptie.dierId}`}>
                  <button className="text-terracotta-dark text-sm font-bold px-3 py-1 border border-terracotta/20 rounded-full hover:bg-terracotta/5 transition-colors">
                    Bekijk
                  </button>
                </Link>
              </div>
              {/* Tijdlijn preview */}
              {medisch.length > 0 ? (
                <div className="ml-14 border-l-2 border-slate-100 pl-4 space-y-3">
                  {medisch.map((record) => (
                    <div key={record.id} className="relative">
                      <div
                        className={`absolute -left-[21px] top-1 w-2 h-2 rounded-full ring-4 ring-white ${
                          record.status === 'voltooid' ? 'bg-emerald-500' : 'bg-orange-400'
                        }`}
                      />
                      <p className="text-xs font-semibold text-slate-800">{record.titel}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(record.datum).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {record.volgendeDatum &&
                          ` • Volgende: ${new Date(record.volgendeDatum).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ml-14 text-xs text-slate-400 italic">Geen records beschikbaar</p>
              )}
            </div>
          </div>

          {/* Adoptieovereenkomst */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-terracotta-dark shrink-0">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900">Adoptieovereenkomst</h4>
                <p className="text-xs text-slate-500">
                  {adoptie.adoptieDatum
                    ? `Ondertekend op ${new Date(adoptie.adoptieDatum).toLocaleDateString('nl-NL')}`
                    : 'In behandeling'}
                </p>
              </div>
              {adoptie.overeenkomstUrl ? (
                <a href={adoptie.overeenkomstUrl} target="_blank" rel="noopener noreferrer">
                  <button className="bg-slate-50 p-2 rounded-lg text-terracotta-dark">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </a>
              ) : (
                <button className="bg-slate-50 p-2 rounded-lg text-slate-300" disabled>
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Verzekering */}
        {adoptie.verzekeringMaatschappij && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Verzekering
            </h3>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-400 text-3xl">
                      verified_user
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {adoptie.verzekeringMaatschappij}
                    </h4>
                    {adoptie.verzekeringPolisnummer && (
                      <p className="text-xs text-slate-500 mb-2">
                        Polisnummer: {adoptie.verzekeringPolisnummer}
                      </p>
                    )}
                    <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      Actief
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IR melding */}
        <div className="p-4 bg-terracotta/5 border border-terracotta/10 rounded-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-terracotta-dark">info</span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vergeet niet je adreswijziging door te geven bij de I&amp;R registratie binnen 14 dagen
            na adoptie.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
