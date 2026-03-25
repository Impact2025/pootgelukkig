export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { dieren, medischeRecords } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import MedischToevoegenModal from './MedischToevoegenModal'

const MEDISCH_ICOON: Record<string, string> = {
  vaccinatie: 'vaccines',
  ontworming: 'medication',
  'check-up': 'stethoscope',
  operatie: 'medical_services',
  tandheelkunde: 'dentistry',
  noodgeval: 'emergency',
  chippen: 'qr_code_2',
  castratie: 'content_cut',
}

export default async function MedicalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dierId = parseInt(id)
  if (isNaN(dierId)) notFound()

  const [dier] = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      soort: dieren.soort,
      ras: dieren.ras,
      leeftijdJaren: dieren.leeftijdJaren,
      hoofdFotoUrl: dieren.hoofdFotoUrl,
      medischPaspoort: dieren.medischPaspoort,
    })
    .from(dieren)
    .where(eq(dieren.id, dierId))
    .limit(1)

  if (!dier) notFound()

  const records = await db
    .select()
    .from(medischeRecords)
    .where(eq(medischeRecords.dierId, dierId))
    .orderBy(asc(medischeRecords.datum))

  const aankomend = records.filter((r) => r.status === 'aankomend')
  const voltooid = records.filter((r) => r.status === 'voltooid')

  const eerstVolgend = aankomend[0]
  const dagenTot = eerstVolgend
    ? Math.ceil(
        (new Date(eerstVolgend.datum).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null

  return (
    <div className="min-h-screen bg-[#E9EDC9] pb-32 max-w-[430px] mx-auto">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 ios-blur border-b border-black/5 px-4 py-4 flex items-center justify-between">
        <Link href="/dossier">
          <button className="size-10 flex items-center justify-start">
            <span className="material-symbols-outlined text-slate-700">arrow_back_ios</span>
          </button>
        </Link>
        <h1 className="text-lg font-bold text-slate-800">Medische Tijdlijn</h1>
        <div className="size-10" />
      </nav>

      <main className="px-4 pt-6">
        {/* Dier header */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-8 border border-black/5">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-xl overflow-hidden relative shadow-md bg-slate-100">
              {dier.hoofdFotoUrl ? (
                <Image
                  src={dier.hoofdFotoUrl}
                  alt={dier.naam}
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
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-900">{dier.naam}</h2>
                <span className="bg-terracotta/10 text-terracotta-dark text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  {dier.soort}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                {[dier.ras, dier.leeftijdJaren ? `${dier.leeftijdJaren} jaar` : null]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
              {dagenTot !== null && (
                <div className="mt-2 flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-terracotta-dark text-sm">
                    event
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Volgende:{' '}
                    <span className="text-terracotta-dark">
                      {dagenTot === 0
                        ? 'Vandaag'
                        : dagenTot < 0
                          ? `${Math.abs(dagenTot)} dagen geleden`
                          : `over ${dagenTot} dagen`}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-slate-300 text-5xl">
              medical_services
            </span>
            <p className="text-slate-500 mt-3 text-sm">Nog geen medische records</p>
          </div>
        ) : (
          <div className="relative space-y-6 pb-8">
            {/* Verticale lijn */}
            <div
              className="absolute left-5 top-0 bottom-0 w-0.5"
              style={{ background: '#ccd5ae' }}
            />

            {/* Aankomende items */}
            {aankomend.map((record) => (
              <div key={record.id} className="relative pl-12">
                <div className="absolute left-0 top-1 size-10 rounded-full bg-terracotta-dark flex items-center justify-center ring-4 ring-[#E9EDC9] z-10">
                  <span className="material-symbols-outlined text-white text-xl">
                    {MEDISCH_ICOON[record.type] ?? 'medical_services'}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-black/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold text-terracotta-dark uppercase tracking-wider">
                        Aankomend •{' '}
                        {new Date(record.datum).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{record.titel}</h3>
                    </div>
                  </div>
                  {record.beschrijving && (
                    <p className="text-sm text-slate-500 mt-1 italic">{record.beschrijving}</p>
                  )}
                  {record.uitvoerder && (
                    <p className="text-xs text-slate-400 mt-2">{record.uitvoerder}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Voltooide items */}
            {voltooid.map((record) => (
              <div key={record.id} className="relative pl-12">
                <div className="absolute left-0 top-1 size-10 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-[#E9EDC9] z-10">
                  <span className="material-symbols-outlined text-white text-xl">check</span>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-black/5 opacity-90">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                        Voltooid •{' '}
                        {new Date(record.datum).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{record.titel}</h3>
                    </div>
                    <span className="material-symbols-outlined text-emerald-500">verified</span>
                  </div>
                  {record.beschrijving && (
                    <p className="text-sm text-slate-500 mt-1">{record.beschrijving}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    {record.notities && (
                      <span className="text-xs text-slate-400 font-mono">{record.notities}</span>
                    )}
                    {record.uitvoerder && !record.notities && (
                      <span className="text-xs text-slate-400">{record.uitvoerder}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 ios-blur border-t border-black/5 px-6 py-4 max-w-[430px] mx-auto">
        <div className="flex justify-between items-center">
          {[
            { icon: 'grid_view', label: 'Home', href: '/dashboard' },
            { icon: 'health_metrics', label: 'Gezondheid', href: `/medical/${dierId}`, actief: true },
            { isPrimary: true },
            { icon: 'chat_bubble', label: 'Berichten', href: '/dashboard' },
            { icon: 'person', label: 'Profiel', href: '/profiel' },
          ].map((item, i) => {
            if ('isPrimary' in item) {
              return <MedischToevoegenModal key={i} dierId={dierId} />
            }
            return (
              <Link key={item.href} href={item.href!}>
                <button
                  className={`flex flex-col items-center gap-1 ${
                    item.actief ? 'text-[#2D6A4F]' : 'text-slate-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-bold uppercase">{item.label}</span>
                </button>
              </Link>
            )
          })}
        </div>
        <div className="w-32 h-1 bg-black/10 rounded-full mx-auto mt-4" />
      </div>
    </div>
  )
}
