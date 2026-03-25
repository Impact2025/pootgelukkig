'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toaster'

interface AsielData {
  id: number
  naam: string
  stad: string
  regio: string
  adres: string | null
  postcode: string | null
  lat: number | null
  lng: number | null
  telefoon: string | null
  email: string | null
  website: string | null
  beschrijving: string | null
}

export default function AsielInstellingenForm({ asiel }: { asiel: AsielData }) {
  const [naam, setNaam] = useState(asiel.naam)
  const [regio, setRegio] = useState(asiel.regio)
  const [adres, setAdres] = useState(asiel.adres ?? '')
  const [telefoon, setTelefoon] = useState(asiel.telefoon ?? '')
  const [email, setEmail] = useState(asiel.email ?? '')
  const [website, setWebsite] = useState(asiel.website ?? '')
  const [beschrijving, setBeschrijving] = useState(asiel.beschrijving ?? '')

  // Locatie
  const [postcode, setPostcode] = useState(asiel.postcode ?? '')
  const [stad, setStad] = useState(asiel.stad)
  const [lat, setLat] = useState<number | null>(asiel.lat)
  const [lng, setLng] = useState<number | null>(asiel.lng)
  const [zoekStatus, setZoekStatus] = useState<'idle' | 'laden' | 'gevonden' | 'fout'>('idle')

  const [opslaan, setOpslaan] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(false)
  const { toast } = useToast()

  const geformatteerd = postcode.replace(/\s/g, '').toUpperCase()
  const postcodeGeldig = /^\d{4}[A-Z]{2}$/.test(geformatteerd)

  async function opzoeken() {
    if (!postcodeGeldig) return
    setZoekStatus('laden')
    setOpgeslagen(false)
    try {
      const res = await fetch(`/api/postcode?postcode=${geformatteerd}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setZoekStatus('fout')
        toast(data.error ?? 'Postcode niet gevonden', 'error')
        return
      }
      setStad(data.stad)
      setLat(data.lat)
      setLng(data.lng)
      setZoekStatus('gevonden')
    } catch {
      setZoekStatus('fout')
      toast('Postcode opzoeken mislukt', 'error')
    }
  }

  async function bewaar(e: React.FormEvent) {
    e.preventDefault()
    setOpslaan(true)
    setOpgeslagen(false)
    try {
      const res = await fetch(`/api/asielen/${asiel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam, stad, regio, adres: adres || null,
          postcode: geformatteerd || null,
          lat, lng,
          telefoon: telefoon || null,
          email: email || null,
          website: website || null,
          beschrijving: beschrijving || null,
        }),
      })
      if (res.ok) {
        setOpgeslagen(true)
        toast('Instellingen opgeslagen', 'success')
      } else {
        toast('Opslaan mislukt', 'error')
      }
    } catch {
      toast('Opslaan mislukt', 'error')
    } finally {
      setOpslaan(false)
    }
  }

  return (
    <form onSubmit={bewaar} className="space-y-8 max-w-2xl">
      {/* Basisinfo */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-[#33335c] text-base flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f8aa25] text-base">info</span>
          Asiel informatie
        </h2>

        <div>
          <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">Naam asiel</label>
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            required
            className="admin-input"
            placeholder="Dierenasiel Amsterdam"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">Regio</label>
          <input
            value={regio}
            onChange={(e) => setRegio(e.target.value)}
            className="admin-input"
            placeholder="Noord-Holland"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">Adres <span className="text-[#33335c]/40 font-normal">(straat + huisnummer)</span></label>
          <input
            value={adres}
            onChange={(e) => setAdres(e.target.value)}
            className="admin-input"
            placeholder="Polderweg 6"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">Beschrijving</label>
          <textarea
            value={beschrijving}
            onChange={(e) => setBeschrijving(e.target.value)}
            rows={3}
            className="admin-input resize-none"
            placeholder="Kort verhaal over jullie asiel..."
          />
        </div>
      </section>

      {/* Locatie */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-[#33335c] text-base flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f8aa25] text-base">location_on</span>
          Locatie
          {lat && lng && (
            <span className="ml-auto text-xs text-[#33335c]/40 font-normal flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px] text-[#f8aa25]">check_circle</span>
              Coördinaten bekend — afstandsfilter actief
            </span>
          )}
        </h2>

        <div>
          <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">Postcode</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={postcode}
                onChange={(e) => {
                  setPostcode(e.target.value)
                  setZoekStatus('idle')
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), opzoeken())}
                placeholder="1234 AB"
                maxLength={7}
                className="admin-input font-mono uppercase tracking-widest w-full"
              />
              {zoekStatus === 'gevonden' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#f8aa25] text-base">
                  check_circle
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={opzoeken}
              disabled={!postcodeGeldig || zoekStatus === 'laden'}
              className="px-4 py-2.5 bg-[#33335c] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#33335c]/80 transition-colors flex items-center gap-2"
            >
              {zoekStatus === 'laden' ? (
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-base">search</span>
              )}
              Zoek
            </button>
          </div>
        </div>

        {stad && (
          <div>
            <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">Woonplaats</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-[#33335c]/5 border border-[#33335c]/10 rounded-xl">
              <span className="material-symbols-outlined text-[#f8aa25] text-sm">location_city</span>
              <span className="text-[#33335c] font-semibold text-sm">{stad}</span>
              {lat && lng && (
                <span className="text-[#33335c]/30 text-xs ml-auto">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-[#33335c] text-base flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f8aa25] text-base">contact_phone</span>
          Contactgegevens
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">Telefoon</label>
            <input
              type="tel"
              value={telefoon}
              onChange={(e) => setTelefoon(e.target.value)}
              className="admin-input"
              placeholder="020-1234567"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="info@asiel.nl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#33335c]/70 mb-1.5">Website</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="admin-input"
            placeholder="https://www.asiel.nl"
          />
        </div>
      </section>

      {/* Opslaan */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={opslaan}
          className="flex items-center gap-2 px-6 py-3 bg-[#33335c] text-white rounded-xl font-bold text-sm hover:bg-[#33335c]/80 transition-colors disabled:opacity-50"
        >
          {opslaan ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Opslaan...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">save</span>
              Opslaan
            </>
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
