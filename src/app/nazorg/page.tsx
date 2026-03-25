export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { adopties, dieren, nazorgDagen, medischeRecords } from '@/lib/db/schema'
import { and, desc, eq, gt } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NazorgClient from './NazorgClient'
import NazorgGenereerKnop from './NazorgGenereerKnop'

export default async function NazorgPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = parseInt(session.user.id)

  // Meest recente goedgekeurde/afgeronde adoptie ophalen
  const [adoptie] = await db
    .select({
      id: adopties.id,
      adoptieDatum: adopties.adoptieDatum,
      dierNaam: dieren.naam,
    })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .where(
      and(
        eq(adopties.userId, userId),
        eq(adopties.status, 'afgerond')
      )
    )
    .orderBy(desc(adopties.adoptieDatum))
    .limit(1)

  // Geen adoptie gevonden
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
            <h1 className="text-lg font-bold text-slate-900">Nazorg & Tips</h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
          <span className="material-symbols-outlined text-slate-300 text-6xl">volunteer_activism</span>
          <h2 className="text-xl font-bold text-slate-700">Nog geen adoptie</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            De nazorg module is beschikbaar nadat je een dier hebt geadopteerd.
          </p>
          <Link href="/dashboard">
            <button className="bg-terracotta-dark text-white font-bold py-3 px-6 rounded-xl">
              Bekijk matches
            </button>
          </Link>
        </main>
      </div>
    )
  }

  // Huidige dag berekenen
  const adoptieDatum = adoptie.adoptieDatum ?? new Date()
  const msDiff = Date.now() - adoptieDatum.getTime()
  const huidigeDag = Math.max(1, Math.min(100, Math.floor(msDiff / (1000 * 60 * 60 * 24)) + 1))

  // Nazorg dagen ophalen (check of gegenereerd)
  const dagen = await db
    .select({ id: nazorgDagen.id })
    .from(nazorgDagen)
    .where(eq(nazorgDagen.adoptieId, adoptie.id))
    .limit(1)

  const gegenereerd = dagen.length > 0

  // Als niet gegenereerd: toon generate knop
  if (!gegenereerd) {
    return (
      <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-[#f0f4f0]">
        <header className="sticky top-0 z-50 bg-white/80 ios-blur border-b border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/dashboard">
              <button className="text-slate-600">
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Nazorg & Tips</h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-5">
          <div className="w-20 h-20 rounded-full bg-terracotta/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-terracotta-dark text-4xl">auto_awesome</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">
              Start {adoptie.dierNaam}&apos;s reis
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Onze AI maakt een persoonlijk 100-daags begeleidingsplan voor jou en{' '}
              {adoptie.dierNaam}.
            </p>
          </div>
          <NazorgGenereerKnop adoptionId={adoptie.id} dierNaam={adoptie.dierNaam} />
        </main>
      </div>
    )
  }

  // Dag data ophalen
  const [dagData] = await db
    .select()
    .from(nazorgDagen)
    .where(
      and(eq(nazorgDagen.adoptieId, adoptie.id), eq(nazorgDagen.dagNummer, huidigeDag))
    )
    .limit(1)

  // Aankomende medische afspraken ophalen
  const komendeMedisch = await db
    .select({
      id: medischeRecords.id,
      titel: medischeRecords.titel,
      type: medischeRecords.type,
      datum: medischeRecords.datum,
      uitvoerder: medischeRecords.uitvoerder,
    })
    .from(medischeRecords)
    .innerJoin(adopties, eq(medischeRecords.dierId, adopties.dierId))
    .where(
      and(
        eq(adopties.id, adoptie.id),
        eq(medischeRecords.status, 'aankomend'),
        gt(medischeRecords.datum, new Date())
      )
    )
    .limit(3)

  return (
    <NazorgClient
      adoptionId={adoptie.id}
      dierNaam={adoptie.dierNaam}
      huidigeDag={huidigeDag}
      totaalDagen={100}
      komendeMedisch={komendeMedisch}
      dagData={
        dagData
          ? {
              id: dagData.id,
              dagNummer: dagData.dagNummer,
              focusOnderwerp: dagData.focusOnderwerp,
              beschrijving: dagData.beschrijving,
              tips: (dagData.tips as string[]) ?? [],
              checklist:
                (dagData.checklist as { item: string; voltooid: boolean }[]) ?? [],
            }
          : null
      }
    />
  )
}
