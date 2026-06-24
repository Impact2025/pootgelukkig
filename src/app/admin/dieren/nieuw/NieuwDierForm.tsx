'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useToast } from '@/components/admin/Toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type Soort = 'hond' | 'kat' | 'vogel' | 'konijn' | 'cavia' | 'hamster' | 'overig'
type Energie = 'laag' | 'normaal' | 'hoog' | 'zeer_hoog'
type AlleenThuis = 'slecht' | 'matig' | 'goed'
type Trainbaarheid = 'laag' | 'normaal' | 'hoog'

interface FormData {
  naam: string
  soort: Soort
  ras: string
  leeftijdJaren: string
  geslacht: string
  hoofdFotoUrl: string
  energieNiveau: Energie
  alleenThuis: AlleenThuis
  trainbaarheid: Trainbaarheid
  kindvriendelijk: boolean
  katVriendelijk: boolean
  hondenVriendelijk: boolean
  tags: string[]
  verhaal: string
  gevaccineerd: boolean
  gecastreerd: boolean
  gechippt: boolean
  chipNummer: string
}

// ─── Configuratie ─────────────────────────────────────────────────────────────

const SOORTEN: { value: Soort; emoji: string; label: string }[] = [
  { value: 'hond', emoji: '🐕', label: 'Hond' },
  { value: 'kat', emoji: '🐈', label: 'Kat' },
  { value: 'konijn', emoji: '🐇', label: 'Konijn' },
  { value: 'vogel', emoji: '🦜', label: 'Vogel' },
  { value: 'cavia', emoji: '🐹', label: 'Cavia' },
  { value: 'overig', emoji: '🐾', label: 'Overig' },
]

const ENERGIE_OPTIES: { value: Energie; label: string; sub: string; kleur: string }[] = [
  { value: 'laag', label: 'Rustig', sub: 'Houdt van luierfan', kleur: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'normaal', label: 'Normaal', sub: 'Actief maar flexibel', kleur: 'bg-green-50 border-green-200 text-green-700' },
  { value: 'hoog', label: 'Actief', sub: 'Veel beweging nodig', kleur: 'bg-orange-50 border-orange-200 text-orange-700' },
  { value: 'zeer_hoog', label: 'Heel actief', sub: 'Sport-maatje gezocht', kleur: 'bg-red-50 border-red-200 text-red-700' },
]

const ALLEEN_THUIS_OPTIES: { value: AlleenThuis; label: string; sub: string }[] = [
  { value: 'slecht', label: 'Moeilijk', sub: 'Heeft gezelschap nodig' },
  { value: 'matig', label: 'Gaat wel', sub: 'Paar uur prima' },
  { value: 'goed', label: 'Zelfstandig', sub: 'Geen probleem' },
]

const TRAINBAAR_OPTIES: { value: Trainbaarheid; label: string }[] = [
  { value: 'laag', label: 'Eigenwijs' },
  { value: 'normaal', label: 'Normaal' },
  { value: 'hoog', label: 'Leergierig' },
]

const SUGGESTIE_TAGS = ['sociaal', 'speels', 'rustig', 'trouw', 'zelfstandig', 'knuffelig', 'leergierig', 'avontuurlijk']

// ─── Component ────────────────────────────────────────────────────────────────

export default function NieuwDierForm({ asielId }: { asielId: number }) {
  const router = useRouter()
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  const [stap, setStap] = useState(1)
  const [laden, setLaden] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [verhaalLaden, setVerhaalLaden] = useState(false)
  const [aiSuggestie, setAiSuggestie] = useState<null | { ras?: string; geschatteLeeftijd?: number; geslacht?: string; energieNiveau?: string; tags?: string[]; verhaal?: string }>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  const [form, setForm] = useState<FormData>({
    naam: '',
    soort: 'hond',
    ras: '',
    leeftijdJaren: '',
    geslacht: '',
    hoofdFotoUrl: '',
    energieNiveau: 'normaal',
    alleenThuis: 'matig',
    trainbaarheid: 'normaal',
    kindvriendelijk: false,
    katVriendelijk: false,
    hondenVriendelijk: false,
    tags: [],
    verhaal: '',
    gevaccineerd: false,
    gecastreerd: false,
    gechippt: false,
    chipNummer: '',
  })

  function set<K extends keyof FormData>(veld: K, waarde: FormData[K]) {
    setForm((prev) => ({ ...prev, [veld]: waarde }))
  }

  // ─── Foto upload ─────────────────────────────────────────────────────────

  async function verwerkFoto(bestand: File) {
    // Lokale preview
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
        set('hoofdFotoUrl', json.url)
      } else {
        showToast(json.error ?? 'Foto upload mislukt', 'error')
      }
    } catch {
      showToast('Foto upload mislukt — controleer je verbinding', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function scanMetAI() {
    if (!form.hoofdFotoUrl) return
    setScanning(true)
    setAiSuggestie(null)
    try {
      const res = await fetch('/api/ai/dier-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoUrl: form.hoofdFotoUrl }),
      })
      if (!res.ok) return
      const json = await res.json()
      const s = json.data
      setAiSuggestie(s)
      // Auto-pas toe
      if (s.soort) set('soort', s.soort)
      if (s.ras) set('ras', s.ras)
      if (s.geschatteLeeftijd) set('leeftijdJaren', String(s.geschatteLeeftijd))
      if (s.geslacht) set('geslacht', s.geslacht)
      if (s.energieNiveau) set('energieNiveau', s.energieNiveau as Energie)
      if (s.tags?.length) set('tags', s.tags)
      if (s.verhaal) set('verhaal', s.verhaal)
    } finally {
      setScanning(false)
    }
  }

  async function genereerVerhaal() {
    setVerhaalLaden(true)
    try {
      const res = await fetch('/api/ai/verhaal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: form.naam,
          soort: form.soort,
          ras: form.ras,
          energieNiveau: form.energieNiveau,
          alleenThuis: form.alleenThuis,
          kindvriendelijk: form.kindvriendelijk,
          katVriendelijk: form.katVriendelijk,
          hondenVriendelijk: form.hondenVriendelijk,
          tags: form.tags,
          leeftijdJaren: form.leeftijdJaren,
        }),
      })
      if (!res.ok) return
      const json = await res.json()
      if (json.data?.verhaal) set('verhaal', json.data.verhaal)
    } finally {
      setVerhaalLaden(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const bestand = e.dataTransfer.files[0]
    if (bestand?.type.startsWith('image/')) verwerkFoto(bestand)
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────

  function voegTagToe(tag: string) {
    const schoon = tag.trim().toLowerCase()
    if (schoon && !form.tags.includes(schoon)) {
      set('tags', [...form.tags, schoon])
    }
  }

  function verwijderTag(tag: string) {
    set('tags', form.tags.filter((t) => t !== tag))
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function opslaan() {
    setLaden(true)
    try {
      const res = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asielId,
          naam: form.naam,
          soort: form.soort,
          ras: form.ras || null,
          leeftijdJaren: form.leeftijdJaren ? parseInt(form.leeftijdJaren) : null,
          geslacht: form.geslacht || null,
          verhaal: form.verhaal || null,
          hoofdFotoUrl: form.hoofdFotoUrl || null,
          gedragsProfiel: {
            energieNiveau: form.energieNiveau,
            alleenThuis: form.alleenThuis,
            trainbaarheid: form.trainbaarheid,
            kindvriendelijk: form.kindvriendelijk,
            katVriendelijk: form.katVriendelijk,
            hondenVriendelijk: form.hondenVriendelijk,
            speelsheid: 'normaal',
            blaffen: 'normaal',
            tags: form.tags,
          },
          medischPaspoort: {
            gevaccineerd: form.gevaccineerd,
            gecastreerd: form.gecastreerd,
            gechippt: form.gechippt,
            chipNummer: form.chipNummer || null,
            allergieën: [],
          },
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error ?? 'Er is iets misgegaan', 'error')
        return
      }

      showToast(`${form.naam} toegevoegd`, 'success')
      router.push('/admin/dieren')
      router.refresh()
    } finally {
      setLaden(false)
    }
  }

  // ─── UI helpers ───────────────────────────────────────────────────────────

  const geslachtOpties =
    form.soort === 'hond'
      ? [{ value: 'reu', label: 'Reu' }, { value: 'teef', label: 'Teef' }]
      : form.soort === 'kat'
        ? [{ value: 'man', label: 'Man' }, { value: 'vrouw', label: 'Vrouw' }]
        : [{ value: 'man', label: 'Man' }, { value: 'vrouw', label: 'Vrouw' }]

  const kanNaarStap2 = form.naam.trim().length > 0
  const kanNaarStap3 = true

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#33335c]/8 px-5 py-4 flex items-center gap-4">
        <button
          onClick={() => stap > 1 ? setStap(stap - 1) : router.back()}
          className="size-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-600 text-lg">arrow_back</span>
        </button>

        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {stap === 1 ? 'Basisinfo' : stap === 2 ? 'Karakter' : 'Gezondheid'}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s < stap ? 'w-6 bg-[#33335c]' : s === stap ? 'w-10 bg-[#33335c]' : 'w-6 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <span className="text-xs font-bold text-gray-300">{stap}/3</span>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-6 pb-32">

        {/* ── STAP 1: BASIS ─────────────────────────────────────────────── */}
        {stap === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#33335c]">Wie is dit dier?</h1>
              <p className="text-gray-400 text-sm mt-1">Begin met een foto — dat trekt adoptanten aan</p>
            </div>

            {/* Foto upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed transition-all ${
                fotoPreview ? 'border-transparent' : 'border-gray-200 bg-white hover:border-[#33335c]/30 hover:bg-gray-50'
              }`}
            >
              {fotoPreview ? (
                <>
                  <Image src={fotoPreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
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
                  {!uploading && form.hoofdFotoUrl && (
                    <div className="absolute bottom-3 right-3 bg-[#33335c] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">check</span>
                      Geüpload
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="size-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-400 text-3xl">add_a_photo</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-500">Tik of sleep een foto</p>
                    <p className="text-xs text-gray-300 mt-0.5">JPG, PNG of WebP · max 5 MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) verwerkFoto(f)
                }}
              />
            </div>

            {/* AI scan knop */}
            {form.hoofdFotoUrl && !uploading && (
              <button
                type="button"
                onClick={scanMetAI}
                disabled={scanning}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 border-dashed border-[#33335c]/20 bg-[#33335c]/5 hover:bg-[#33335c]/10 text-[#33335c] font-bold text-sm transition-all disabled:opacity-60"
              >
                {scanning ? (
                  <>
                    <span className="size-4 border-2 border-[#33335c]/30 border-t-[#33335c] rounded-full animate-spin" />
                    AI analyseert de foto...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    Analyseer met AI — vult alles in
                  </>
                )}
              </button>
            )}

            {/* AI suggestie banner */}
            {aiSuggestie && (
              <div className="bg-[#33335c]/5 border border-[#33335c]/15 rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#33335c] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <div>
                  <p className="text-xs font-bold text-[#33335c]">AI heeft alles ingevuld</p>
                  <p className="text-xs text-[#33335c]/60 mt-0.5">Controleer en pas aan waar nodig</p>
                </div>
              </div>
            )}

            {/* Naam */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Naam *
              </label>
              <input
                type="text"
                value={form.naam}
                onChange={(e) => set('naam', e.target.value)}
                placeholder="Bijv. Max of Luna"
                autoFocus
                className="w-full text-2xl font-bold text-[#33335c] bg-white border border-gray-200 rounded-2xl px-5 py-4 placeholder:text-gray-200 focus:outline-none focus:border-[#33335c]/30 focus:ring-2 focus:ring-[#33335c]/10"
              />
            </div>

            {/* Soort */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Soort
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SOORTEN.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set('soort', s.value)}
                    className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 border-2 transition-all ${
                      form.soort === s.value
                        ? 'border-[#33335c] bg-[#33335c] text-white'
                        : 'border-[#33335c]/8 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-xs font-bold">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ras + leeftijd */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Ras
                </label>
                <input
                  type="text"
                  value={form.ras}
                  onChange={(e) => set('ras', e.target.value)}
                  placeholder="bijv. Labrador"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#33335c] placeholder:text-gray-300 focus:outline-none focus:border-[#33335c]/30 focus:ring-2 focus:ring-[#33335c]/10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Leeftijd
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={form.leeftijdJaren}
                    onChange={(e) => set('leeftijdJaren', e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#33335c] placeholder:text-gray-300 focus:outline-none focus:border-[#33335c]/30 focus:ring-2 focus:ring-[#33335c]/10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-300 font-medium">
                    jaar
                  </span>
                </div>
              </div>
            </div>

            {/* Geslacht */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Geslacht
              </label>
              <div className="flex gap-2">
                {geslachtOpties.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => set('geslacht', form.geslacht === g.value ? '' : g.value)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      form.geslacht === g.value
                        ? 'border-[#33335c] bg-[#33335c] text-white'
                        : 'border-[#33335c]/8 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => set('geslacht', '')}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    form.geslacht === ''
                      ? 'border-gray-300 bg-gray-100 text-gray-600'
                      : 'border-[#33335c]/8 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  ?
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STAP 2: KARAKTER ──────────────────────────────────────────── */}
        {stap === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#33335c]">
                Wat voor karakter heeft {form.naam}?
              </h1>
              <p className="text-gray-400 text-sm mt-1">Dit helpt de AI het juiste gezin te vinden</p>
            </div>

            {/* Energieniveau */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Energieniveau
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ENERGIE_OPTIES.map((e) => (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => set('energieNiveau', e.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.energieNiveau === e.value
                        ? e.kleur + ' border-opacity-100'
                        : 'border-[#33335c]/8 bg-white hover:border-gray-200'
                    }`}
                  >
                    <p className={`text-sm font-bold ${form.energieNiveau === e.value ? '' : 'text-[#33335c]'}`}>
                      {e.label}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${form.energieNiveau === e.value ? 'opacity-70' : 'text-gray-400'}`}>
                      {e.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Alleen thuis */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Alleen thuis
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ALLEEN_THUIS_OPTIES.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => set('alleenThuis', a.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.alleenThuis === a.value
                        ? 'border-[#33335c] bg-[#33335c] text-white'
                        : 'border-[#33335c]/8 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <p className="text-xs font-bold">{a.label}</p>
                    <p className={`text-[10px] mt-0.5 ${form.alleenThuis === a.value ? 'opacity-60' : 'text-gray-400'}`}>
                      {a.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Trainbaarheid */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Trainbaarheid
              </label>
              <div className="flex gap-2">
                {TRAINBAAR_OPTIES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('trainbaarheid', t.value)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      form.trainbaarheid === t.value
                        ? 'border-[#33335c] bg-[#33335c] text-white'
                        : 'border-[#33335c]/8 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compatibiliteit */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Gaat goed samen met
              </label>
              <div className="flex gap-2">
                {[
                  { veld: 'kindvriendelijk' as const, emoji: '👶', label: 'Kinderen' },
                  { veld: 'katVriendelijk' as const, emoji: '🐈', label: 'Katten' },
                  { veld: 'hondenVriendelijk' as const, emoji: '🐕', label: 'Honden' },
                ].map(({ veld, emoji, label }) => (
                  <button
                    key={veld}
                    type="button"
                    onClick={() => set(veld, !form[veld])}
                    className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                      form[veld]
                        ? 'border-[#33335c] bg-[#33335c] text-white'
                        : 'border-[#33335c]/8 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Persoonlijkheid
              </label>
              {/* Suggesties */}
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTIE_TAGS.filter((t) => !form.tags.includes(t)).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => voegTagToe(tag)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500 hover:border-[#33335c]/30 hover:text-[#33335c] transition-all"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              {/* Geselecteerde tags */}
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => verwijderTag(tag)}
                      className="px-3 py-1.5 bg-[#33335c] text-white rounded-full text-xs font-bold flex items-center gap-1.5"
                    >
                      {tag}
                      <span className="material-symbols-outlined text-[11px]">close</span>
                    </button>
                  ))}
                </div>
              )}
              {/* Eigen tag */}
              <div className="flex gap-2">
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="Eigen tag toevoegen..."
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#33335c] placeholder:text-gray-300 focus:outline-none focus:border-[#33335c]/30"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      voegTagToe((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = ''
                    }
                  }}
                />
              </div>
            </div>

            {/* Verhaal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Verhaal <span className="normal-case font-normal text-gray-300">(optioneel)</span>
                </label>
                <button
                  type="button"
                  onClick={genereerVerhaal}
                  disabled={verhaalLaden || !form.naam}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#33335c] bg-[#33335c]/8 hover:bg-[#33335c]/15 px-3 py-1.5 rounded-full transition-all disabled:opacity-40"
                >
                  {verhaalLaden ? (
                    <span className="size-3 border border-[#33335c]/30 border-t-[#33335c] rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  )}
                  {verhaalLaden ? 'Schrijft...' : 'Genereer'}
                </button>
              </div>
              <textarea
                value={form.verhaal}
                onChange={(e) => set('verhaal', e.target.value)}
                placeholder={`Vertel iets over ${form.naam}…`}
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#33335c] placeholder:text-gray-300 focus:outline-none focus:border-[#33335c]/30 resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STAP 3: GEZONDHEID ────────────────────────────────────────── */}
        {stap === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#33335c]">
                Gezondheid van {form.naam}
              </h1>
              <p className="text-gray-400 text-sm mt-1">Snel aanvinken — wordt zichtbaar in het paspoort</p>
            </div>

            {/* Medische toggles */}
            <div className="space-y-3">
              {[
                { veld: 'gevaccineerd' as const, icon: 'vaccines', label: 'Gevaccineerd', sub: 'Inentingen zijn bijgewerkt' },
                { veld: 'gecastreerd' as const, icon: 'content_cut', label: 'Gecastreerd / gesteriliseerd', sub: 'Reproductie niet meer mogelijk' },
                { veld: 'gechippt' as const, icon: 'qr_code_2', label: 'Gechippt', sub: 'Microchip aanwezig' },
              ].map(({ veld, icon, label, sub }) => (
                <button
                  key={veld}
                  type="button"
                  onClick={() => set(veld, !form[veld])}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                    form[veld]
                      ? 'border-green-200 bg-green-50'
                      : 'border-[#33335c]/8 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`size-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    form[veld] ? 'bg-green-500' : 'bg-gray-100'
                  }`}>
                    <span className={`material-symbols-outlined ${form[veld] ? 'text-white' : 'text-gray-400'}`}>
                      {form[veld] ? 'check' : icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${form[veld] ? 'text-green-700' : 'text-[#33335c]'}`}>
                      {label}
                    </p>
                    <p className={`text-xs mt-0.5 ${form[veld] ? 'text-green-600/70' : 'text-gray-400'}`}>
                      {sub}
                    </p>
                  </div>
                  <div className={`size-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    form[veld] ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {form[veld] && (
                      <span className="material-symbols-outlined text-white text-sm">check</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Chip nummer */}
            {form.gechippt && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Chipnummer
                </label>
                <input
                  type="text"
                  value={form.chipNummer}
                  onChange={(e) => set('chipNummer', e.target.value)}
                  placeholder="528210006321456"
                  className="w-full font-mono bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#33335c] placeholder:text-gray-300 focus:outline-none focus:border-[#33335c]/30"
                />
              </div>
            )}

            {/* Samenvatting */}
            <div className="bg-white rounded-2xl border border-[#33335c]/8 p-5 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Samenvatting</p>
              <div className="flex items-center gap-3">
                {fotoPreview ? (
                  <div className="size-14 rounded-xl overflow-hidden relative flex-shrink-0">
                    <Image src={fotoPreview} alt={form.naam} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="size-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">
                      {SOORTEN.find((s) => s.value === form.soort)?.emoji}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#33335c] text-lg leading-tight">{form.naam}</p>
                  <p className="text-gray-400 text-sm">
                    {[form.ras || form.soort, form.leeftijdJaren ? `${form.leeftijdJaren} jaar` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {form.tags.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{form.tags.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* ── Sticky bottom CTA ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-white/90 backdrop-blur-sm border-t border-[#33335c]/8 max-w-lg mx-auto">
        {stap < 3 ? (
          <button
            onClick={() => setStap(stap + 1)}
            disabled={stap === 1 && !kanNaarStap2}
            className="w-full bg-[#33335c] text-white font-extrabold py-4 rounded-2xl disabled:opacity-30 flex items-center justify-center gap-2 text-base active:scale-[0.98] transition-all"
          >
            Volgende
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={opslaan}
            disabled={laden}
            className="w-full bg-[#33335c] text-white font-extrabold py-4 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 text-base active:scale-[0.98] transition-all"
          >
            {laden ? (
              <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pets
                </span>
                {form.naam} toevoegen
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
