'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPES = [
  { value: 'check-up', label: 'Check-up', icon: 'stethoscope' },
  { value: 'vaccinatie', label: 'Vaccinatie', icon: 'vaccines' },
  { value: 'ontworming', label: 'Ontworming', icon: 'medication' },
  { value: 'tandheelkunde', label: 'Tandheelkunde', icon: 'dentistry' },
  { value: 'operatie', label: 'Operatie', icon: 'medical_services' },
  { value: 'overig', label: 'Overig', icon: 'more_horiz' },
]

export default function MedischToevoegenModal({ dierId }: { dierId: number }) {
  const [open, setOpen] = useState(false)
  const [laden, setLaden] = useState(false)
  const [form, setForm] = useState({
    type: 'check-up',
    titel: '',
    datum: '',
    beschrijving: '',
    uitvoerder: '',
  })
  const router = useRouter()

  async function opslaan(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titel || !form.datum) return
    setLaden(true)
    try {
      const res = await fetch(`/api/medical/${dierId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setOpen(false)
        setForm({ type: 'check-up', titel: '', datum: '', beschrijving: '', uitvoerder: '' })
        router.refresh()
      }
    } finally {
      setLaden(false)
    }
  }

  return (
    <>
      {/* FAB knop */}
      <button
        onClick={() => setOpen(true)}
        className="relative -top-8 size-14 rounded-full bg-[#E2725B] flex items-center justify-center text-white shadow-2xl shadow-[#E2725B]/40 border-4 border-[#E9EDC9] active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl font-bold">add</span>
      </button>

      {/* Modal backdrop */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full max-w-[430px] bg-[#E9EDC9] rounded-t-3xl p-6 pb-10 shadow-2xl">
            {/* Handle */}
            <div className="w-10 h-1 bg-black/10 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">Afspraak toevoegen</h2>
              <button
                onClick={() => setOpen(false)}
                className="size-8 rounded-full bg-black/5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-slate-600 text-lg">close</span>
              </button>
            </div>

            <form onSubmit={opslaan} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                        form.type === t.value
                          ? 'border-[#E2725B] bg-[#E2725B]/10 text-[#E2725B]'
                          : 'border-transparent bg-white text-slate-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{t.icon}</span>
                      <span className="text-[10px] font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Titel */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Omschrijving
                </label>
                <input
                  type="text"
                  value={form.titel}
                  onChange={(e) => setForm((f) => ({ ...f, titel: e.target.value }))}
                  placeholder="bijv. Jaarlijkse check-up"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E2725B]/30"
                />
              </div>

              {/* Datum */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Datum
                </label>
                <input
                  type="date"
                  value={form.datum}
                  onChange={(e) => setForm((f) => ({ ...f, datum: e.target.value }))}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E2725B]/30"
                />
              </div>

              {/* Dierenarts */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Dierenarts (optioneel)
                </label>
                <input
                  type="text"
                  value={form.uitvoerder}
                  onChange={(e) => setForm((f) => ({ ...f, uitvoerder: e.target.value }))}
                  placeholder="bijv. Dierenarts de Vries"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E2725B]/30"
                />
              </div>

              {/* Notitie */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Notitie (optioneel)
                </label>
                <textarea
                  value={form.beschrijving}
                  onChange={(e) => setForm((f) => ({ ...f, beschrijving: e.target.value }))}
                  placeholder="Extra informatie..."
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E2725B]/30 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={laden || !form.titel || !form.datum}
                className="w-full bg-[#E2725B] text-white font-extrabold py-4 rounded-2xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {laden ? (
                  <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined">add_circle</span>
                    Afspraak opslaan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
