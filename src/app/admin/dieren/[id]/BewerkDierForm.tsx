'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useToast } from '@/components/admin/Toast'

type Energie = 'laag' | 'normaal' | 'hoog' | 'zeer_hoog'
type AlleenThuis = 'slecht' | 'matig' | 'goed'

interface Dier {
  id: number
  naam: string
  soort: string
  ras: string | null
  leeftijdJaren: number | null
  geslacht: string | null
  verhaal: string | null
  hoofdFotoUrl: string | null
  status: string
  gedragsProfiel: {
    energieNiveau?: Energie
    kindvriendelijk?: boolean
    katVriendelijk?: boolean
    hondenVriendelijk?: boolean
    alleenThuis?: AlleenThuis
    trainbaarheid?: string
    speelsheid?: string
    blaffen?: string
    tags?: string[]
  } | null
  medischPaspoort: {
    gevaccineerd?: boolean
    gecastreerd?: boolean
    gechippt?: boolean
    chipNummer?: string | null
    allergieën?: string[]
  } | null
}

const SUGGESTIE_TAGS = ['sociaal', 'speels', 'rustig', 'trouw', 'zelfstandig', 'knuffelig', 'leergierig', 'avontuurlijk']

export default function BewerkDierForm({ dier }: { dier: Dier }) {
  const router = useRouter()
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [naam, setNaam] = useState(dier.naam)
  const [ras, setRas] = useState(dier.ras ?? '')
  const [leeftijdJaren, setLeeftijdJaren] = useState(String(dier.leeftijdJaren ?? ''))
  const [geslacht, setGeslacht] = useState(dier.geslacht ?? '')
  const [verhaal, setVerhaal] = useState(dier.verhaal ?? '')
  const [status, setStatus] = useState(dier.status)
  const [hoofdFotoUrl, setHoofdFotoUrl] = useState(dier.hoofdFotoUrl ?? '')
  const [fotoPreview, setFotoPreview] = useState<string | null>(dier.hoofdFotoUrl)
  const [tags, setTags] = useState<string[]>(dier.gedragsProfiel?.tags ?? [])
  const [energieNiveau, setEnergieNiveau] = useState<Energie>(dier.gedragsProfiel?.energieNiveau ?? 'normaal')
  const [kindvriendelijk, setKindvriendelijk] = useState(dier.gedragsProfiel?.kindvriendelijk ?? false)
  const [katVriendelijk, setKatVriendelijk] = useState(dier.gedragsProfiel?.katVriendelijk ?? false)
  const [hondenVriendelijk, setHondenVriendelijk] = useState(dier.gedragsProfiel?.hondenVriendelijk ?? false)
  const [gevaccineerd, setGevaccineerd] = useState(dier.medischPaspoort?.gevaccineerd ?? false)
  const [gecastreerd, setGecastreerd] = useState(dier.medischPaspoort?.gecastreerd ?? false)
  const [gechippt, setGechippt] = useState(dier.medischPaspoort?.gechippt ?? false)

  const [uploading, setUploading] = useState(false)
  const [laden, setLaden] = useState(false)

  async function verwerkFoto(bestand: File) {
    const reader = new FileReader()
    reader.onload = (e) => setFotoPreview(e.target?.result as string)
    reader.readAsDataURL(bestand)

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', bestand)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (res.ok && json.url) {
        setHoofdFotoUrl(json.url)
      } else {
        showToast(json.error ?? 'Foto upload mislukt', 'error')
      }
    } catch {
      showToast('Foto upload mislukt', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function opslaan() {
    setLaden(true)
    try {
      const res = await fetch(`/api/animals/${dier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam,
          ras: ras || null,
          leeftijdJaren: leeftijdJaren ? parseInt(leeftijdJaren) : null,
          geslacht: geslacht || null,
          verhaal: verhaal || null,
          hoofdFotoUrl: hoofdFotoUrl || null,
          status,
          gedragsProfiel: {
            ...(dier.gedragsProfiel ?? {}),
            energieNiveau,
            kindvriendelijk,
            katVriendelijk,
            hondenVriendelijk,
            tags,
          },
          medischPaspoort: {
            ...(dier.medischPaspoort ?? {}),
            gevaccineerd,
            gecastreerd,
            gechippt,
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error ?? 'Opslaan mislukt', 'error')
        return
      }

      showToast(`${naam} opgeslagen`, 'success')
      router.push('/admin/dieren')
      router.refresh()
    } finally {
      setLaden(false)
    }
  }

  const statusOpties = [
    { value: 'beschikbaar', label: 'Beschikbaar', kleur: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { value: 'in_behandeling', label: 'In behandeling', kleur: 'text-amber-700 bg-amber-50 border-amber-200' },
    { value: 'geadopteerd', label: 'Geadopteerd', kleur: 'text-blue-700 bg-blue-50 border-blue-200' },
    { value: 'niet_beschikbaar', label: 'Niet beschikbaar', kleur: 'text-gray-600 bg-gray-50 border-gray-200' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#33335c]/8 px-5 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="size-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-600 text-lg">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-[#33335c]">{dier.naam} bewerken</h1>
          <p className="text-xs text-gray-400">{dier.soort}{dier.ras ? ` · ${dier.ras}` : ''}</p>
        </div>
        <button
          onClick={opslaan}
          disabled={laden || uploading}
          className="flex items-center gap-2 bg-[#33335c] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#33335c]/90 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {laden ? (
            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-base">save</span>
          )}
          Opslaan
        </button>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-6 pb-24 space-y-6">

        {/* Foto */}
        <section className="bg-white rounded-2xl border border-[#33335c]/8 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Foto</p>
          <div
            onClick={() => fileRef.current?.click()}
            className={`relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-dashed transition-all ${
              fotoPreview ? 'border-transparent' : 'border-gray-200 bg-gray-50 hover:border-[#33335c]/30'
            }`}
          >
            {fotoPreview ? (
              <>
                <Image src={fotoPreview} alt={naam} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity bg-white/90 rounded-xl px-4 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    <span className="text-sm font-bold">Andere foto</span>
                  </div>
                </div>
                {uploading && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="size-3 border border-white/40 border-t-white rounded-full animate-spin" />
                    Uploaden...
                  </div>
                )}
                {!uploading && hoofdFotoUrl && (
                  <div className="absolute bottom-3 right-3 bg-[#33335c] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">check</span>
                    Geüpload
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-gray-300 text-4xl">add_a_photo</span>
                <p className="text-sm text-gray-400 font-medium">Klik om foto te uploaden</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) verwerkFoto(f) }}
            />
          </div>
        </section>

        {/* Basisinfo */}
        <section className="bg-white rounded-2xl border border-[#33335c]/8 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Basisinfo</p>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Naam</label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#33335c] font-bold text-lg focus:outline-none focus:border-[#33335c]/30 focus:ring-2 focus:ring-[#33335c]/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">Ras</label>
              <input
                type="text"
                value={ras}
                onChange={(e) => setRas(e.target.value)}
                placeholder="bijv. Labrador"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">Leeftijd</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={leeftijdJaren}
                  onChange={(e) => setLeeftijdJaren(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300">jaar</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOpties.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    status === s.value ? s.kleur : 'border-[#33335c]/8 bg-white text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Karakter */}
        <section className="bg-white rounded-2xl border border-[#33335c]/8 p-5 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Karakter</p>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Energieniveau</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['laag', 'normaal', 'hoog', 'zeer_hoog'] as Energie[]).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEnergieNiveau(e)}
                  className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    energieNiveau === e
                      ? 'border-[#33335c] bg-[#33335c] text-white'
                      : 'border-[#33335c]/8 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  {e === 'laag' ? 'Rustig' : e === 'normaal' ? 'Normaal' : e === 'hoog' ? 'Actief' : 'Heel actief'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Gaat goed samen met</label>
            <div className="flex gap-2">
              {[
                { state: kindvriendelijk, set: setKindvriendelijk, emoji: '👶', label: 'Kinderen' },
                { state: katVriendelijk, set: setKatVriendelijk, emoji: '🐈', label: 'Katten' },
                { state: hondenVriendelijk, set: setHondenVriendelijk, emoji: '🐕', label: 'Honden' },
              ].map(({ state, set, emoji, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => set(!state)}
                  className={`flex-1 py-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    state ? 'border-[#33335c] bg-[#33335c] text-white' : 'border-[#33335c]/8 bg-gray-50 text-gray-400'
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-[10px] font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Persoonlijkheid tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SUGGESTIE_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags([...tags, tag])}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-500 hover:border-[#33335c]/30 hover:text-[#33335c] transition-all"
                >
                  + {tag}
                </button>
              ))}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="px-3 py-1.5 bg-[#33335c] text-white rounded-full text-xs font-bold flex items-center gap-1.5"
                  >
                    {tag}
                    <span className="material-symbols-outlined text-[11px]">close</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">Verhaal</label>
            <textarea
              value={verhaal}
              onChange={(e) => setVerhaal(e.target.value)}
              placeholder={`Vertel iets over ${naam}…`}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]/30 resize-none"
            />
          </div>
        </section>

        {/* Gezondheid */}
        <section className="bg-white rounded-2xl border border-[#33335c]/8 p-5 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gezondheid</p>
          {[
            { state: gevaccineerd, set: setGevaccineerd, label: 'Gevaccineerd', icon: 'vaccines' },
            { state: gecastreerd, set: setGecastreerd, label: 'Gecastreerd / gesteriliseerd', icon: 'content_cut' },
            { state: gechippt, set: setGechippt, label: 'Gechippt', icon: 'qr_code_2' },
          ].map(({ state, set, label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => set(!state)}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all text-left ${
                state ? 'border-green-200 bg-green-50' : 'border-[#33335c]/8 bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 ${state ? 'bg-green-500' : 'bg-gray-200'}`}>
                <span className={`material-symbols-outlined text-sm ${state ? 'text-white' : 'text-gray-400'}`}>
                  {state ? 'check' : icon}
                </span>
              </div>
              <span className={`text-sm font-bold ${state ? 'text-green-700' : 'text-gray-500'}`}>{label}</span>
            </button>
          ))}
        </section>

        <button
          onClick={opslaan}
          disabled={laden || uploading}
          className="w-full bg-[#33335c] text-white font-extrabold py-4 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          {laden ? (
            <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
              Wijzigingen opslaan
            </>
          )}
        </button>
      </main>
    </div>
  )
}
