'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ChecklistItem {
  item: string
  voltooid: boolean
}

interface NazorgDag {
  id: number
  dagNummer: number
  focusOnderwerp: string | null
  beschrijving: string | null
  tips: string[]
  checklist: ChecklistItem[]
}

interface MedischItem {
  id: number
  titel: string
  type: string
  datum: Date
  uitvoerder: string | null
}

interface Props {
  adoptionId: number
  dierNaam: string
  huidigeDag: number
  totaalDagen: number
  dagData: NazorgDag | null
  komendeMedisch: MedischItem[]
}

const MEDISCH_ICOON: Record<string, string> = {
  vaccinatie: 'vaccines',
  ontworming: 'medication',
  'check-up': 'stethoscope',
  operatie: 'medical_services',
  tandheelkunde: 'dentistry',
  chippen: 'qr_code_2',
  overig: 'more_horiz',
}

export default function NazorgClient({
  adoptionId,
  dierNaam,
  huidigeDag,
  totaalDagen,
  dagData,
  komendeMedisch,
}: Props) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(dagData?.checklist ?? [])
  const [opslaan, setOpslaan] = useState(false)
  const [weergegeven, setWeergegeven] = useState(huidigeDag)

  const dagNummers = Array.from({ length: Math.min(totaalDagen, 14) }, (_, i) => i + 1)

  async function toggleChecklist(index: number) {
    const nieuw = checklist.map((item, i) =>
      i === index ? { ...item, voltooid: !item.voltooid } : item
    )
    setChecklist(nieuw)

    setOpslaan(true)
    try {
      await fetch(`/api/nazorg/${adoptionId}/dag/${dagData?.dagNummer ?? huidigeDag}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: nieuw,
          checklistVoltooid: nieuw.every((i) => i.voltooid),
        }),
      })
    } finally {
      setOpslaan(false)
    }
  }

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
            <h1 className="text-lg font-bold text-slate-900">Nazorg & Tips</h1>
          </div>
          {opslaan && (
            <span className="text-[11px] text-slate-400 font-medium">Opslaan...</span>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 pb-28">
        {/* Titel */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {dierNaam}&apos;s eerste {Math.min(totaalDagen, 14)} dagen bij jou
          </h2>
          <p className="text-slate-500 text-sm">
            We begeleiden je stap voor stap bij de eerste momenten samen.
          </p>
        </div>

        {/* Dag cirkel timeline */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar py-2 -mx-4 px-4">
          {dagNummers.map((dag) => (
            <div key={dag} className="flex-shrink-0 flex flex-col items-center gap-1">
              {dag < weergegeven ? (
                <>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-sm">
                    <span className="material-symbols-outlined text-xl">check</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dag {dag}</span>
                </>
              ) : dag === weergegeven ? (
                <>
                  <div className="w-14 h-14 -mt-1 rounded-full flex items-center justify-center bg-white border-2 border-terracotta-dark text-terracotta-dark shadow-md">
                    <span className="text-lg font-bold">{dag}</span>
                  </div>
                  <span className="text-[10px] font-bold text-terracotta-dark uppercase">
                    {dag === huidigeDag ? 'Vandaag' : `Dag ${dag}`}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 opacity-50">
                    <span className="text-sm font-bold">{dag}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase opacity-50">
                    Dag {dag}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Dag kaart */}
        {dagData && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="bg-terracotta/10 text-terracotta-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Focus van vandaag
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {dagData.focusOnderwerp ?? 'Vandaag'}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-terracotta-dark">
                <span className="material-symbols-outlined text-3xl">lightbulb</span>
              </div>
            </div>

            {/* Beschrijving */}
            {dagData.beschrijving && (
              <section className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800">Wat te verwachten vandaag</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{dagData.beschrijving}</p>
              </section>
            )}

            {/* Tips */}
            {dagData.tips && dagData.tips.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Tips voor vandaag</h4>
                {dagData.tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="material-symbols-outlined text-terracotta-dark shrink-0 text-lg">
                      info
                    </span>
                    <p className="text-sm text-slate-600 italic">&ldquo;{tip}&rdquo;</p>
                  </div>
                ))}
              </section>
            )}

            {/* Checklist */}
            {checklist.length > 0 && (
              <section className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Dagelijkse Checklist
                </h4>
                <div className="space-y-2">
                  {checklist.map((item, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        item.voltooid ? 'bg-slate-50' : 'bg-white border border-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.voltooid}
                        onChange={() => toggleChecklist(index)}
                        className="w-5 h-5 rounded border-slate-300 text-terracotta-dark focus:ring-terracotta/20 accent-terracotta-dark"
                      />
                      <span
                        className={`text-sm font-medium ${
                          item.voltooid ? 'text-slate-400 line-through' : 'text-slate-800'
                        }`}
                      >
                        {item.item}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Voortgang */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-700">Voortgang</span>
            <span className="text-sm font-bold text-terracotta-dark">
              Dag {huidigeDag} van {totaalDagen}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta-dark rounded-full transition-all"
              style={{ width: `${Math.min((huidigeDag / totaalDagen) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Aankomende medische afspraken */}
        {komendeMedisch.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E2725B] text-lg">event_upcoming</span>
                Aankomende check-ups
              </h3>
              <Link href={`/medical/${adoptionId}`} className="text-[10px] font-bold text-terracotta-dark uppercase tracking-wider">
                Bekijk alles
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {komendeMedisch.map((item) => {
                const dagen = Math.ceil(
                  (new Date(item.datum).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="size-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#E2725B] text-sm">
                        {MEDISCH_ICOON[item.type] ?? 'medical_services'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.titel}</p>
                      {item.uitvoerder && (
                        <p className="text-[11px] text-slate-400 truncate">{item.uitvoerder}</p>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      dagen <= 7
                        ? 'bg-red-50 text-red-600'
                        : dagen <= 30
                          ? 'bg-orange-50 text-[#E2725B]'
                          : 'bg-slate-50 text-slate-500'
                    }`}>
                      {dagen === 0 ? 'Vandaag' : dagen < 0 ? 'Verlopen' : `${dagen}d`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3-3-3 regel */}
        <div className="p-4 bg-white/50 border border-slate-200 rounded-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-400">shield</span>
          <p className="text-xs text-slate-500 leading-relaxed">
            De <strong>3-3-3 regel</strong>: 3 dagen om te ontstressen, 3 weken om te wennen,
            3 maanden om je echt thuis te voelen.
          </p>
        </div>
      </main>

      {/* Footer nav */}
      <footer className="bg-white/80 ios-blur border-t border-slate-200 pb-8 pt-2 fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto">
        <div className="flex justify-around items-center">
          {[
            { href: '/dashboard', icon: 'pets', label: 'Mijn Match' },
            { href: '/nazorg', icon: 'volunteer_activism', label: 'Nazorg', actief: true },
            { href: '/dossier', icon: 'folder', label: 'Dossier' },
            { href: '/profiel', icon: 'person', label: 'Profiel' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={`flex flex-col items-center gap-1 ${
                  item.actief ? 'text-terracotta-dark' : 'text-slate-400'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={item.actief ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className={`text-[10px] ${item.actief ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
