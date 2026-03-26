'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toaster'

// ─── Types ────────────────────────────────────────────────────────────────────

type DagRooster = { open: boolean; van: string; tot: string }
type Openingstijden = {
  ma: DagRooster; di: DagRooster; wo: DagRooster; do: DagRooster
  vr: DagRooster; za: DagRooster; zo: DagRooster; notitie?: string
}
type SocialMedia = { instagram?: string; facebook?: string; tiktok?: string; youtube?: string }
type AsielConfig = {
  spoedTelefoon?: string
  kvkNummer?: string
  anbiStatus?: boolean
  iban?: string
  maxCapaciteit?: number
  specialisaties?: string[]
  notificaties?: { emailBijAanvraag?: boolean; emailBijBericht?: boolean; dagelijkseDigest?: boolean }
  adoptieProcedure?: {
    minimumLeeftijdAdoptant?: number
    tuinVereist?: boolean
    huisbezoekVereist?: boolean
    wachttijdDagen?: number
    vereisten?: string
  }
}

interface AsielData {
  id: number
  naam: string; stad: string; regio: string
  adres: string | null; postcode: string | null
  lat: number | null; lng: number | null
  telefoon: string | null; email: string | null
  website: string | null; beschrijving: string | null
  logoUrl: string | null
  openingstijden: Openingstijden | null
  socialMedia: SocialMedia | null
  asielConfig: AsielConfig | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STANDAARD_TIJDEN: DagRooster = { open: false, van: '09:00', tot: '17:00' }
const STANDAARD_OT: Openingstijden = {
  ma: { open: true,  van: '09:00', tot: '17:00' },
  di: { open: true,  van: '09:00', tot: '17:00' },
  wo: { open: true,  van: '09:00', tot: '17:00' },
  do: { open: true,  van: '09:00', tot: '17:00' },
  vr: { open: true,  van: '09:00', tot: '17:00' },
  za: { open: true,  van: '10:00', tot: '15:00' },
  zo: { open: false, van: '10:00', tot: '14:00' },
}
const DAGNAMEN: { key: keyof Omit<Openingstijden, 'notitie'>; label: string }[] = [
  { key: 'ma', label: 'Maandag' },
  { key: 'di', label: 'Dinsdag' },
  { key: 'wo', label: 'Woensdag' },
  { key: 'do', label: 'Donderdag' },
  { key: 'vr', label: 'Vrijdag' },
  { key: 'za', label: 'Zaterdag' },
  { key: 'zo', label: 'Zondag' },
]
const ALLE_SPECIALISATIES = ['honden', 'katten', 'konijnen', 'vogels', 'reptielen', 'knaagdieren', 'paarden', 'boerderijdieren']
const SPEC_LABELS: Record<string, string> = {
  honden: '🐕 Honden', katten: '🐈 Katten', konijnen: '🐇 Konijnen',
  vogels: '🦜 Vogels', reptielen: '🦎 Reptielen', knaagdieren: '🐹 Knaagdieren',
  paarden: '🐴 Paarden', boerderijdieren: '🐄 Boerderijdieren',
}

function SectieKop({ icon, titel, sub }: { icon: string; titel: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
      <div className="size-9 rounded-xl bg-[#33335c]/[0.07] flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[#f8aa25] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <h2 className="font-bold text-[#33335c] text-sm">{titel}</h2>
        {sub && <p className="text-[#33335c]/45 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function Veld({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">
        {label}
        {hint && <span className="ml-1.5 text-[#33335c]/35 font-normal text-xs">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({ aan, onChange }: { aan: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!aan)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${aan ? 'bg-[#33335c]' : 'bg-gray-200'}`}
    >
      <span className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${aan ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AsielInstellingenForm({ asiel }: { asiel: AsielData }) {
  const { toast } = useToast()

  // Basisinfo
  const [naam, setNaam] = useState(asiel.naam)
  const [regio, setRegio] = useState(asiel.regio)
  const [adres, setAdres] = useState(asiel.adres ?? '')
  const [beschrijving, setBeschrijving] = useState(asiel.beschrijving ?? '')

  // Locatie
  const [postcode, setPostcode] = useState(asiel.postcode ?? '')
  const [stad, setStad] = useState(asiel.stad)
  const [lat, setLat] = useState<number | null>(asiel.lat)
  const [lng, setLng] = useState<number | null>(asiel.lng)
  const [zoekStatus, setZoekStatus] = useState<'idle' | 'laden' | 'gevonden' | 'fout'>('idle')

  // Contact
  const [telefoon, setTelefoon] = useState(asiel.telefoon ?? '')
  const [spoedTelefoon, setSpoedTelefoon] = useState(asiel.asielConfig?.spoedTelefoon ?? '')
  const [email, setEmail] = useState(asiel.email ?? '')
  const [website, setWebsite] = useState(asiel.website ?? '')

  // Social media
  const [instagram, setInstagram] = useState(asiel.socialMedia?.instagram ?? '')
  const [facebook, setFacebook] = useState(asiel.socialMedia?.facebook ?? '')
  const [tiktok, setTiktok] = useState(asiel.socialMedia?.tiktok ?? '')
  const [youtube, setYoutube] = useState(asiel.socialMedia?.youtube ?? '')

  // Openingstijden
  const [ot, setOt] = useState<Openingstijden>(asiel.openingstijden ?? STANDAARD_OT)
  const [otNotitie, setOtNotitie] = useState(asiel.openingstijden?.notitie ?? '')

  function setDag(dag: keyof Omit<Openingstijden, 'notitie'>, veld: keyof DagRooster, waarde: string | boolean) {
    setOt(prev => ({ ...prev, [dag]: { ...prev[dag], [veld]: waarde } }))
  }

  // Specialisaties
  const [specialisaties, setSpecialisaties] = useState<string[]>(asiel.asielConfig?.specialisaties ?? [])
  function toggleSpec(s: string) {
    setSpecialisaties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  // Capaciteit
  const [maxCapaciteit, setMaxCapaciteit] = useState<number | ''>(asiel.asielConfig?.maxCapaciteit ?? '')

  // Adoptieprocedure
  const ap = asiel.asielConfig?.adoptieProcedure
  const [minLeeftijd, setMinLeeftijd] = useState<number | ''>(ap?.minimumLeeftijdAdoptant ?? '')
  const [tuinVereist, setTuinVereist] = useState(ap?.tuinVereist ?? false)
  const [huisbezoekVereist, setHuisbezoekVereist] = useState(ap?.huisbezoekVereist ?? true)
  const [wachttijdDagen, setWachttijdDagen] = useState<number | ''>(ap?.wachttijdDagen ?? '')
  const [vereisten, setVereisten] = useState(ap?.vereisten ?? '')

  // Notificaties
  const notif = asiel.asielConfig?.notificaties
  const [emailBijAanvraag, setEmailBijAanvraag] = useState(notif?.emailBijAanvraag ?? true)
  const [emailBijBericht, setEmailBijBericht] = useState(notif?.emailBijBericht ?? true)
  const [dagelijkseDigest, setDagelijkseDigest] = useState(notif?.dagelijkseDigest ?? false)

  // Organisatie
  const [kvkNummer, setKvkNummer] = useState(asiel.asielConfig?.kvkNummer ?? '')
  const [anbiStatus, setAnbiStatus] = useState(asiel.asielConfig?.anbiStatus ?? false)
  const [iban, setIban] = useState(asiel.asielConfig?.iban ?? '')

  // Opslaan
  const [opslaan, setOpslaan] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(false)

  const geformatteerd = postcode.replace(/\s/g, '').toUpperCase()
  const postcodeGeldig = /^\d{4}[A-Z]{2}$/.test(geformatteerd)

  async function opzoeken() {
    if (!postcodeGeldig) return
    setZoekStatus('laden')
    setOpgeslagen(false)
    try {
      const res = await fetch(`/api/postcode?postcode=${geformatteerd}`)
      const data = await res.json()
      if (!res.ok || data.error) { setZoekStatus('fout'); toast(data.error ?? 'Niet gevonden', 'error'); return }
      setStad(data.stad); setLat(data.lat); setLng(data.lng); setZoekStatus('gevonden')
    } catch { setZoekStatus('fout'); toast('Opzoeken mislukt', 'error') }
  }

  async function bewaar(e: React.FormEvent) {
    e.preventDefault()
    setOpslaan(true); setOpgeslagen(false)
    try {
      const res = await fetch(`/api/asielen/${asiel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam, stad, regio, adres: adres || null,
          postcode: geformatteerd || null, lat, lng,
          telefoon: telefoon || null, email: email || null, website: website || null,
          beschrijving: beschrijving || null,
          openingstijden: { ...ot, notitie: otNotitie || undefined },
          socialMedia: {
            instagram: instagram || undefined, facebook: facebook || undefined,
            tiktok: tiktok || undefined, youtube: youtube || undefined,
          },
          asielConfig: {
            spoedTelefoon: spoedTelefoon || undefined,
            kvkNummer: kvkNummer || undefined,
            anbiStatus,
            iban: iban || undefined,
            maxCapaciteit: maxCapaciteit !== '' ? Number(maxCapaciteit) : undefined,
            specialisaties,
            notificaties: { emailBijAanvraag, emailBijBericht, dagelijkseDigest },
            adoptieProcedure: {
              minimumLeeftijdAdoptant: minLeeftijd !== '' ? Number(minLeeftijd) : undefined,
              tuinVereist, huisbezoekVereist,
              wachttijdDagen: wachttijdDagen !== '' ? Number(wachttijdDagen) : undefined,
              vereisten: vereisten || undefined,
            },
          },
        }),
      })
      if (res.ok) { setOpgeslagen(true); toast('Instellingen opgeslagen', 'success') }
      else toast('Opslaan mislukt', 'error')
    } catch { toast('Opslaan mislukt', 'error') }
    finally { setOpslaan(false) }
  }

  return (
    <form onSubmit={bewaar} className="space-y-6 max-w-2xl">

      {/* ── 1. Profiel ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <SectieKop icon="info" titel="Asiel profiel" sub="Basisinformatie die adoptanten te zien krijgen" />

        <Veld label="Naam asiel">
          <input value={naam} onChange={e => setNaam(e.target.value)} required className="admin-input" placeholder="Dierenasiel Amsterdam" />
        </Veld>

        <Veld label="Regio">
          <input value={regio} onChange={e => setRegio(e.target.value)} className="admin-input" placeholder="Noord-Holland" />
        </Veld>

        <Veld label="Adres" hint="straat + huisnummer">
          <input value={adres} onChange={e => setAdres(e.target.value)} className="admin-input" placeholder="Polderweg 6" />
        </Veld>

        <Veld label="Beschrijving" hint="verschijnt op jullie profielpagina">
          <textarea value={beschrijving} onChange={e => setBeschrijving(e.target.value)} rows={4} className="admin-input resize-none"
            placeholder="Vertel adoptanten wie jullie zijn, hoe lang jullie al bestaan en wat jullie aanpak is..." />
          <p className="text-xs text-[#33335c]/35 mt-1">{beschrijving.length} tekens · aanbevolen: 100–300</p>
        </Veld>
      </section>

      {/* ── 2. Locatie ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <SectieKop icon="location_on" titel="Locatie" sub="Postcode bepaalt de afstandsfilter voor adoptanten" />

        <Veld label="Postcode">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={postcode}
                onChange={e => { setPostcode(e.target.value); setZoekStatus('idle') }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), opzoeken())}
                placeholder="1234 AB" maxLength={7}
                className="admin-input font-mono uppercase tracking-widest w-full"
              />
              {zoekStatus === 'gevonden' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#f8aa25] text-base">check_circle</span>
              )}
            </div>
            <button type="button" onClick={opzoeken} disabled={!postcodeGeldig || zoekStatus === 'laden'}
              className="px-4 py-2.5 bg-[#33335c] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#33335c]/80 transition-colors flex items-center gap-2">
              {zoekStatus === 'laden'
                ? <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                : <span className="material-symbols-outlined text-base">search</span>}
              Zoek
            </button>
          </div>
        </Veld>

        {stad && (
          <div className="flex items-center gap-2 px-4 py-3 bg-[#33335c]/5 border border-[#33335c]/10 rounded-xl">
            <span className="material-symbols-outlined text-[#f8aa25] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
            <span className="text-[#33335c] font-semibold text-sm">{stad}</span>
            {lat && lng && <span className="text-[#33335c]/30 text-xs ml-auto">{lat.toFixed(4)}, {lng.toFixed(4)}</span>}
          </div>
        )}
      </section>

      {/* ── 3. Contact ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <SectieKop icon="contact_phone" titel="Contactgegevens" />

        <div className="grid grid-cols-2 gap-4">
          <Veld label="Telefoon">
            <input type="tel" value={telefoon} onChange={e => setTelefoon(e.target.value)} className="admin-input" placeholder="020-1234567" />
          </Veld>
          <Veld label="Spoedlijn" hint="optioneel">
            <input type="tel" value={spoedTelefoon} onChange={e => setSpoedTelefoon(e.target.value)} className="admin-input" placeholder="06-12345678" />
          </Veld>
        </div>

        <Veld label="E-mail">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="admin-input" placeholder="info@asiel.nl" />
        </Veld>

        <Veld label="Website">
          <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="admin-input" placeholder="https://www.asiel.nl" />
        </Veld>
      </section>

      {/* ── 4. Openingstijden ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <SectieKop icon="schedule" titel="Openingstijden" sub="Zichtbaar voor adoptanten op jullie profielpagina" />

        <div className="space-y-2">
          {DAGNAMEN.map(({ key, label }) => {
            const dag = ot[key]
            return (
              <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${dag.open ? 'border-[#33335c]/15 bg-[#33335c]/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className="w-24 flex-shrink-0">
                  <span className={`text-sm font-semibold ${dag.open ? 'text-[#33335c]' : 'text-[#33335c]/35'}`}>{label}</span>
                </div>
                <Toggle aan={dag.open} onChange={v => setDag(key, 'open', v)} />
                {dag.open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={dag.van} onChange={e => setDag(key, 'van', e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono text-[#33335c] focus:outline-none focus:border-[#33335c]/40 bg-white" />
                    <span className="text-[#33335c]/30 text-sm">–</span>
                    <input type="time" value={dag.tot} onChange={e => setDag(key, 'tot', e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono text-[#33335c] focus:outline-none focus:border-[#33335c]/40 bg-white" />
                  </div>
                ) : (
                  <span className="text-sm text-[#33335c]/25 italic">Gesloten</span>
                )}
              </div>
            )
          })}
        </div>

        <Veld label="Extra notitie" hint="bijv. 'Gesloten op feestdagen' of 'Op afspraak buiten openingstijden'">
          <input value={otNotitie} onChange={e => setOtNotitie(e.target.value)} className="admin-input"
            placeholder="Gesloten op nationale feestdagen" />
        </Veld>
      </section>

      {/* ── 5. Specialisaties & Capaciteit ─────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <SectieKop icon="pets" titel="Specialisaties & capaciteit" sub="Welke dieren vangen jullie op en hoeveel?" />

        <Veld label="Wij specialiseren in">
          <div className="flex flex-wrap gap-2 mt-1">
            {ALLE_SPECIALISATIES.map(s => (
              <button key={s} type="button" onClick={() => toggleSpec(s)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                  specialisaties.includes(s)
                    ? 'bg-[#33335c] text-white border-[#33335c]'
                    : 'bg-gray-50 text-[#33335c]/50 border-gray-200 hover:border-[#33335c]/30'
                }`}>
                {SPEC_LABELS[s]}
              </button>
            ))}
          </div>
        </Veld>

        <Veld label="Maximum capaciteit" hint="totaal aantal dieren dat jullie kunnen opvangen">
          <div className="flex items-center gap-3">
            <input type="number" min="1" max="999" value={maxCapaciteit}
              onChange={e => setMaxCapaciteit(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="admin-input w-32" placeholder="50" />
            <span className="text-sm text-[#33335c]/40">dieren</span>
          </div>
        </Veld>
      </section>

      {/* ── 6. Adoptieprocedure ────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <SectieKop icon="assignment" titel="Adoptieprocedure" sub="Vereisten en werkwijze bij adoptie" />

        <div className="grid grid-cols-2 gap-4">
          <Veld label="Minimum leeftijd adoptant" hint="jaar">
            <div className="flex items-center gap-2">
              <input type="number" min="18" max="99" value={minLeeftijd}
                onChange={e => setMinLeeftijd(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="admin-input w-24" placeholder="18" />
              <span className="text-sm text-[#33335c]/40">jaar</span>
            </div>
          </Veld>
          <Veld label="Wachttijd na aanvraag" hint="dagen">
            <div className="flex items-center gap-2">
              <input type="number" min="0" max="90" value={wachttijdDagen}
                onChange={e => setWachttijdDagen(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="admin-input w-24" placeholder="7" />
              <span className="text-sm text-[#33335c]/40">dagen</span>
            </div>
          </Veld>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-[#33335c]">Tuin vereist</p>
              <p className="text-xs text-[#33335c]/40">Adoptant moet een tuin hebben</p>
            </div>
            <Toggle aan={tuinVereist} onChange={setTuinVereist} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-[#33335c]">Huisbezoek vereist</p>
              <p className="text-xs text-[#33335c]/40">Wij doen altijd een thuischeck vóór adoptie</p>
            </div>
            <Toggle aan={huisbezoekVereist} onChange={setHuisbezoekVereist} />
          </div>
        </div>

        <Veld label="Aanvullende vereisten" hint="vrije tekst, zichtbaar voor adoptanten">
          <textarea value={vereisten} onChange={e => setVereisten(e.target.value)} rows={3}
            className="admin-input resize-none"
            placeholder="Bijv.: Adoptanten moeten minimaal 2 uur per dag thuis zijn voor honden. Bij gezinnen met kinderen jonger dan 6 jaar adviseren wij katten boven 2 jaar." />
        </Veld>
      </section>

      {/* ── 7. Social media ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <SectieKop icon="share" titel="Social media" sub="Links naar jullie sociale kanalen" />

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Instagram', icon: 'instagram', value: instagram, set: setInstagram, ph: 'instagram.com/jullieasiel' },
            { label: 'Facebook', icon: 'facebook', value: facebook, set: setFacebook, ph: 'facebook.com/jullieasiel' },
            { label: 'TikTok', icon: 'play_circle', value: tiktok, set: setTiktok, ph: 'tiktok.com/@jullieasiel' },
            { label: 'YouTube', icon: 'smart_display', value: youtube, set: setYoutube, ph: 'youtube.com/@jullieasiel' },
          ].map(({ label, icon, value, set, ph }) => (
            <Veld key={label} label={label}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#33335c]/30 text-sm">{icon}</span>
                <input value={value} onChange={e => set(e.target.value)} className="admin-input pl-9" placeholder={ph} />
              </div>
            </Veld>
          ))}
        </div>
      </section>

      {/* ── 8. Notificaties ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <SectieKop icon="notifications" titel="E-mail notificaties" sub="Wanneer wil je een e-mail ontvangen?" />

        {[
          { label: 'Nieuwe adoptieaanvraag', sub: 'Direct bij elke nieuwe aanvraag', aan: emailBijAanvraag, set: setEmailBijAanvraag },
          { label: 'Nieuw bericht van adoptant', sub: 'Direct bij elk nieuw chatbericht', aan: emailBijBericht, set: setEmailBijBericht },
          { label: 'Dagelijkse samenvatting', sub: 'Elke ochtend een overzicht van de dag ervoor', aan: dagelijkseDigest, set: setDagelijkseDigest },
        ].map(({ label, sub, aan, set }) => (
          <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-semibold text-[#33335c]">{label}</p>
              <p className="text-xs text-[#33335c]/40">{sub}</p>
            </div>
            <Toggle aan={aan} onChange={set} />
          </div>
        ))}
      </section>

      {/* ── 9. Organisatie ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <SectieKop icon="business" titel="Organisatiegegevens" sub="KvK, ANBI-status en bankgegevens voor donaties" />

        <div className="grid grid-cols-2 gap-4">
          <Veld label="KvK-nummer" hint="optioneel">
            <input value={kvkNummer} onChange={e => setKvkNummer(e.target.value)} className="admin-input font-mono" placeholder="12345678" maxLength={8} />
          </Veld>
          <Veld label="IBAN" hint="voor donaties">
            <input value={iban} onChange={e => setIban(e.target.value.toUpperCase())} className="admin-input font-mono" placeholder="NL00 BANK 0000 0000 00" />
          </Veld>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-amber-50 border border-amber-100 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-amber-800">ANBI-status</p>
            <p className="text-xs text-amber-600">Jullie zijn erkend als Algemeen Nut Beogende Instelling</p>
          </div>
          <Toggle aan={anbiStatus} onChange={setAnbiStatus} />
        </div>
      </section>

      {/* ── Opslaan ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-8">
        <button type="submit" disabled={opslaan}
          className="flex items-center gap-2 px-7 py-3 bg-[#33335c] text-white rounded-xl font-bold text-sm hover:bg-[#33335c]/80 transition-colors disabled:opacity-50 shadow-sm">
          {opslaan ? (
            <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Opslaan...</>
          ) : (
            <><span className="material-symbols-outlined text-base">save</span>Wijzigingen opslaan</>
          )}
        </button>
        {opgeslagen && (
          <span className="flex items-center gap-1.5 text-sm text-[#f8aa25] font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Opgeslagen
          </span>
        )}
      </div>
    </form>
  )
}
