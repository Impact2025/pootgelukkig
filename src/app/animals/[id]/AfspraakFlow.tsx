'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toaster'

type AfspraakType = 'kennismaking' | 'thuischeck'
type Tijdslot = 'ochtend' | 'middag' | 'avond'

interface AfspraakData {
  id: number
  status: string
  type: string
  voorkeurDatum: string
  voorkeurTijdslot: string
  bevestigdeDatum: string | null
  bevestigdTijdstip: string | null
  notitieAsiel: string | null
}

interface Props {
  dierId: number
  dierNaam: string
  asielId: number
  afspraak: AfspraakData | null
  adoptieStatus?: string
}

const TIJDSLOTEN: { waarde: Tijdslot; label: string; tijd: string; emoji: string }[] = [
  { waarde: 'ochtend', label: 'Ochtend', tijd: '9:00 – 12:00', emoji: '🌅' },
  { waarde: 'middag', label: 'Middag', tijd: '12:00 – 17:00', emoji: '☀️' },
  { waarde: 'avond', label: 'Avond', tijd: '17:00 – 20:00', emoji: '🌆' },
]

const TYPE_LABELS: Record<string, string> = {
  kennismaking: 'Kennismakingsbezoek',
  thuischeck: 'Thuischeck',
}

const TIJDSLOT_LABELS: Record<string, string> = {
  ochtend: 'Ochtend (9:00 – 12:00)',
  middag: 'Middag (12:00 – 17:00)',
  avond: 'Avond (17:00 – 20:00)',
}

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default function AfspraakFlow({ dierId, dierNaam, asielId, afspraak, adoptieStatus }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [stap, setStap] = useState<1 | 2 | 3>(1)
  const [type, setType] = useState<AfspraakType>('kennismaking')
  const [datum, setDatum] = useState('')
  const [tijdslot, setTijdslot] = useState<Tijdslot | null>(null)
  const [notitie, setNotitie] = useState('')
  const [laden, setLaden] = useState(false)
  const [localAfspraak, setLocalAfspraak] = useState<AfspraakData | null>(afspraak)
  const [localAdoptieStatus, setLocalAdoptieStatus] = useState(adoptieStatus ?? null)
  const [bevestigenAdoptie, setBevestigenAdoptie] = useState(false)
  const [adoptieAanvraagLaden, setAdoptieAanvraagLaden] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  const morgen = new Date()
  morgen.setDate(morgen.getDate() + 1)
  const minDatum = morgen.toISOString().split('T')[0]

  function openModal() {
    setStap(1)
    setType('kennismaking')
    setDatum('')
    setTijdslot(null)
    setNotitie('')
    setModalOpen(true)
  }

  async function verstuurAfspraak() {
    if (!datum || !tijdslot) return
    setLaden(true)
    try {
      const res = await fetch('/api/afspraken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dierId, asielId, type, voorkeurDatum: datum, voorkeurTijdslot: tijdslot, notitie: notitie || undefined }),
      })
      const json = await res.json()
      if (res.ok) {
        setLocalAfspraak(json.data)
        setModalOpen(false)
        toast(`Afspraakverzoek voor ${dierNaam} verstuurd!`, 'success')
        router.refresh()
      } else {
        toast(json.error ?? 'Er ging iets mis', 'error')
      }
    } catch {
      toast('Geen verbinding. Probeer opnieuw.', 'error')
    } finally {
      setLaden(false)
    }
  }

  async function annuleerAfspraak() {
    if (!localAfspraak) return
    setLaden(true)
    try {
      const res = await fetch(`/api/afspraken/${localAfspraak.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'geannuleerd' }),
      })
      if (res.ok) {
        setLocalAfspraak({ ...localAfspraak, status: 'geannuleerd' })
        toast('Afspraak geannuleerd', 'success')
        router.refresh()
      } else {
        toast('Kon afspraak niet annuleren', 'error')
      }
    } finally {
      setLaden(false)
    }
  }

  async function vraagAdoptie() {
    setAdoptieAanvraagLaden(true)
    setBevestigenAdoptie(false)
    try {
      const res = await fetch('/api/adopties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dierId }),
      })
      const json = await res.json()
      if (res.ok) {
        setLocalAdoptieStatus(json.data.status)
        toast(`Adoptieaanvraag voor ${dierNaam} verstuurd!`, 'success')
        router.refresh()
      } else {
        toast(json.error ?? 'Er ging iets mis', 'error')
      }
    } finally {
      setAdoptieAanvraagLaden(false)
    }
  }

  const kanAdopteren =
    localAfspraak &&
    (localAfspraak.status === 'bevestigd' || localAfspraak.status === 'afgerond') &&
    !['aangevraagd', 'goedgekeurd', 'afgerond'].includes(localAdoptieStatus ?? '')

  // ── Adoptie-status weergave ──────────────────────────────────────────────────
  if (localAdoptieStatus === 'aangevraagd') {
    return (
      <div className="space-y-3">
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">hourglass_top</span>
          <span className="font-semibold text-sm text-white/70">Adoptieaanvraag verstuurd — asiel neemt contact op</span>
        </div>
        <Link href={`/chat/dier/${dierId}`}>
          <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-primary text-base">chat</span>
            Stel een vraag aan het asiel
          </button>
        </Link>
      </div>
    )
  }

  if (['goedgekeurd', 'afgerond'].includes(localAdoptieStatus ?? '')) {
    return (
      <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 text-primary">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <span className="font-bold text-sm">
          {localAdoptieStatus === 'afgerond' ? `${dierNaam} is van jou! 🎉` : 'Adoptie goedgekeurd'}
        </span>
      </div>
    )
  }

  return (
    <>
      {/* ── Sticky CTA op basis van afspraakstatus ─────────────────────────── */}
      <div className="space-y-3">

        {/* Geen afspraak → Plan een afspraak */}
        {(!localAfspraak || localAfspraak.status === 'geannuleerd') && (
          <>
            <button
              onClick={openModal}
              className="w-full bg-primary text-bg-dark font-extrabold py-4 rounded-2xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 text-base"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_add_on</span>
              Plan een afspraak
            </button>
            {localAfspraak?.status === 'geannuleerd' && (
              <p className="text-center text-white/30 text-xs">Vorige afspraak geannuleerd</p>
            )}
          </>
        )}

        {/* Aangevraagd → status card */}
        {localAfspraak?.status === 'aangevraagd' && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 text-xl mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                pending
              </span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Afspraak aangevraagd</p>
                <p className="text-white/50 text-xs mt-0.5">
                  {TYPE_LABELS[localAfspraak.type]} · {TIJDSLOT_LABELS[localAfspraak.voorkeurTijdslot]}
                </p>
                <p className="text-amber-400 text-xs font-semibold mt-1">
                  Gewenste datum: {formatDatum(localAfspraak.voorkeurDatum)}
                </p>
                <p className="text-white/35 text-xs mt-1.5">Het asiel bevestigt zo snel mogelijk een datum.</p>
              </div>
            </div>
            <button
              onClick={annuleerAfspraak}
              disabled={laden}
              className="mt-3 text-white/30 text-xs font-semibold hover:text-white/60 transition-colors disabled:opacity-40"
            >
              Afspraak annuleren
            </button>
          </div>
        )}

        {/* Bevestigd → groene kaart + Adopteer knop */}
        {localAfspraak?.status === 'bevestigd' && (
          <div className="bg-primary/10 border border-primary/25 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                event_available
              </span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">Afspraak bevestigd!</p>
                <p className="text-primary font-bold text-sm mt-0.5">
                  {localAfspraak.bevestigdeDatum
                    ? formatDatum(localAfspraak.bevestigdeDatum)
                    : formatDatum(localAfspraak.voorkeurDatum)}{' '}
                  {localAfspraak.bevestigdTijdstip ? `om ${localAfspraak.bevestigdTijdstip}` : ''}
                </p>
                <p className="text-white/50 text-xs mt-0.5">{TYPE_LABELS[localAfspraak.type]}</p>
                {localAfspraak.notitieAsiel && (
                  <p className="text-white/50 text-xs mt-1.5 italic">&ldquo;{localAfspraak.notitieAsiel}&rdquo;</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Afgerond → klaar voor adoptie */}
        {localAfspraak?.status === 'afgerond' && (
          <div className="bg-primary/8 border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <div>
              <p className="text-white font-bold text-sm">Bezoek afgerond</p>
              <p className="text-white/50 text-xs">Klaar om officieel te adopteren?</p>
            </div>
          </div>
        )}

        {/* Adopteer knop (alleen na bevestigd/afgerond) */}
        {kanAdopteren && !bevestigenAdoptie && (
          <button
            onClick={() => setBevestigenAdoptie(true)}
            className="w-full bg-primary text-bg-dark font-extrabold py-4 rounded-2xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 text-base"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            Adopteer {dierNaam}
          </button>
        )}

        {kanAdopteren && bevestigenAdoptie && (
          <div className="space-y-2">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl py-3 px-5 text-center">
              <p className="text-white font-bold text-sm mb-0.5">Adoptieaanvraag versturen?</p>
              <p className="text-white/50 text-xs">Het asiel rondt het adoptieproces formeel af.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBevestigenAdoptie(false)}
                className="py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm"
              >
                Annuleer
              </button>
              <button
                onClick={vraagAdoptie}
                disabled={adoptieAanvraagLaden}
                className="py-3.5 rounded-2xl bg-primary text-bg-dark font-extrabold text-sm shadow-lg shadow-primary/30 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {adoptieAanvraagLaden ? (
                  <span className="size-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                ) : 'Ja, aanvragen'}
              </button>
            </div>
          </div>
        )}

        {/* Chat — altijd beschikbaar */}
        <Link href={`/chat/dier/${dierId}`}>
          <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-primary text-base">chat</span>
            Stel een vraag aan het asiel
          </button>
        </Link>
      </div>

      {/* ── Afspraak Modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="w-full max-w-[430px] bg-[#0e1e0e] border border-white/10 rounded-t-3xl overflow-hidden animate-slide-up">
            {/* Modal header */}
            <div className="px-6 pt-5 pb-4 border-b border-white/8">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => stap > 1 ? setStap((s) => (s - 1) as 1 | 2 | 3) : setModalOpen(false)}
                  className="size-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors"
                >
                  <span className="material-symbols-outlined text-white/60 text-lg">
                    {stap === 1 ? 'close' : 'arrow_back'}
                  </span>
                </button>
                <div>
                  <p className="text-white font-bold text-base text-center">Plan een afspraak</p>
                  <p className="text-white/40 text-xs text-center mt-0.5">{dierNaam}</p>
                </div>
                {/* Stap indicator */}
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: stap === s ? '18px' : '6px',
                        background: stap >= s ? '#13ec13' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stap 1 — Type kiezen */}
            {stap === 1 && (
              <div className="px-6 py-6 space-y-4">
                <div>
                  <h3 className="text-white font-extrabold text-xl mb-1">Wat voor afspraak?</h3>
                  <p className="text-white/40 text-sm">Kies hoe je {dierNaam} wilt leren kennen</p>
                </div>
                <div className="space-y-3 pt-1">
                  {[
                    {
                      waarde: 'kennismaking' as AfspraakType,
                      icon: 'home_work',
                      titel: 'Kennismakingsbezoek',
                      beschrijving: 'Ik bezoek het dier bij het asiel. De meest gangbare eerste stap.',
                      aanbevolen: true,
                    },
                    {
                      waarde: 'thuischeck' as AfspraakType,
                      icon: 'house',
                      titel: 'Thuischeck',
                      beschrijving: 'Het asiel bezoekt mijn woning. Handig om te zien of de omgeving past.',
                      aanbevolen: false,
                    },
                  ].map((optie) => (
                    <button
                      key={optie.waarde}
                      onClick={() => { setType(optie.waarde); setStap(2) }}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                        type === optie.waarde
                          ? 'border-primary bg-primary/10'
                          : 'border-white/8 bg-white/4 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {optie.icon}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-bold text-sm">{optie.titel}</p>
                            {optie.aanbevolen && (
                              <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                                Aanbevolen
                              </span>
                            )}
                          </div>
                          <p className="text-white/50 text-xs mt-1 leading-relaxed">{optie.beschrijving}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stap 2 — Datum & Tijdstip */}
            {stap === 2 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <h3 className="text-white font-extrabold text-xl mb-1">Wanneer komt het uit?</h3>
                  <p className="text-white/40 text-sm">Het asiel stemt de exacte tijd met je af</p>
                </div>

                <div>
                  <label className="block text-white/40 text-[11px] font-bold uppercase tracking-widest mb-2">
                    Voorkeursdatum
                  </label>
                  <input
                    type="date"
                    value={datum}
                    min={minDatum}
                    onChange={(e) => setDatum(e.target.value)}
                    className="w-full bg-white/6 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-[11px] font-bold uppercase tracking-widest mb-2">
                    Voorkeurstijdstip
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIJDSLOTEN.map((slot) => (
                      <button
                        key={slot.waarde}
                        onClick={() => setTijdslot(slot.waarde)}
                        className={`py-3.5 px-2 rounded-2xl border-2 transition-all text-center ${
                          tijdslot === slot.waarde
                            ? 'border-primary bg-primary/10'
                            : 'border-white/8 bg-white/4 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xl mb-1">{slot.emoji}</div>
                        <p className="text-white font-bold text-xs">{slot.label}</p>
                        <p className="text-white/40 text-[10px] mt-0.5">{slot.tijd}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => { if (datum && tijdslot) setStap(3) }}
                  disabled={!datum || !tijdslot}
                  className="w-full bg-primary text-bg-dark font-extrabold py-4 rounded-2xl disabled:opacity-40 transition-all active:scale-[0.98]"
                >
                  Volgende stap →
                </button>
              </div>
            )}

            {/* Stap 3 — Bevestiging + optioneel bericht */}
            {stap === 3 && (
              <div className="px-6 py-6 space-y-5">
                <div>
                  <h3 className="text-white font-extrabold text-xl mb-1">Controleer je afspraak</h3>
                  <p className="text-white/40 text-sm">Voeg eventueel een bericht toe voor het asiel</p>
                </div>

                {/* Samenvatting */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
                  <SamenvattingRij icon="pets" label="Dier" waarde={dierNaam} />
                  <SamenvattingRij
                    icon={type === 'kennismaking' ? 'home_work' : 'house'}
                    label="Type"
                    waarde={TYPE_LABELS[type]}
                  />
                  <SamenvattingRij
                    icon="calendar_today"
                    label="Datum"
                    waarde={formatDatum(datum)}
                  />
                  <SamenvattingRij
                    icon="schedule"
                    label="Tijdstip"
                    waarde={TIJDSLOT_LABELS[tijdslot ?? 'ochtend']}
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-[11px] font-bold uppercase tracking-widest mb-2">
                    Bericht aan het asiel <span className="text-white/25 normal-case">(optioneel)</span>
                  </label>
                  <textarea
                    value={notitie}
                    onChange={(e) => setNotitie(e.target.value)}
                    placeholder={`Bijv. "Ik heb ook een kat thuis" of specifieke vragen over ${dierNaam}…`}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-white/6 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={verstuurAfspraak}
                  disabled={laden}
                  className="w-full bg-primary text-bg-dark font-extrabold py-4 rounded-2xl shadow-2xl shadow-primary/30 disabled:opacity-60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {laden ? (
                    <span className="size-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      Afspraak aanvragen
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="h-6" />
          </div>
        </div>
      )}
    </>
  )
}

function SamenvattingRij({ icon, label, waarde }: { icon: string; label: string; waarde: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-primary text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <span className="text-white/40 text-sm w-16 flex-shrink-0">{label}</span>
      <span className="text-white text-sm font-semibold">{waarde}</span>
    </div>
  )
}
