'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toaster'

interface Props {
  huidigePostcode: string | null
  huidigeStad: string | null
}

export default function PostcodeForm({ huidigePostcode, huidigeStad }: Props) {
  const [postcode, setPostcode] = useState(huidigePostcode ?? '')
  const [stad, setStad] = useState(huidigeStad ?? '')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [zoekStatus, setZoekStatus] = useState<'idle' | 'laden' | 'gevonden' | 'fout'>('idle')
  const [opgeslagen, setOpgeslagen] = useState(false)
  const [opslaan, setOpslaan] = useState(false)
  const { toast } = useToast()

  const geformatteerd = postcode.replace(/\s/g, '').toUpperCase()
  const geldig = /^\d{4}[A-Z]{2}$/.test(geformatteerd)

  async function opzoeken() {
    if (!geldig) return
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

  async function bewaar() {
    if (!geldig || !stad) return
    setOpslaan(true)
    try {
      const res = await fetch('/api/gebruiker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode: geformatteerd, stad, lat, lng }),
      })
      if (res.ok) {
        setOpgeslagen(true)
        toast('Woonplaats opgeslagen', 'success')
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
    <section className="px-4 mb-6">
      <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-base">location_on</span>
        Jouw locatie
      </h2>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <p className="text-white/40 text-xs">
          Vul je postcode in zodat we asielen bij jou in de buurt kunnen tonen.
        </p>

        {/* Postcode input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value)
                setZoekStatus('idle')
                setOpgeslagen(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && opzoeken()}
              placeholder="1234 AB"
              maxLength={7}
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white text-sm font-mono uppercase tracking-widest placeholder:text-white/20 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-primary/50 transition-colors"
            />
            {zoekStatus === 'gevonden' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-base">
                check_circle
              </span>
            )}
          </div>
          <button
            onClick={opzoeken}
            disabled={!geldig || zoekStatus === 'laden'}
            className="px-4 py-3 bg-primary/20 border border-primary/30 text-primary rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-primary/30 transition-colors flex items-center gap-1.5"
          >
            {zoekStatus === 'laden' ? (
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">search</span>
            )}
            Zoek
          </button>
        </div>

        {/* Woonplaats resultaat */}
        {stad && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/15 rounded-xl">
            <span className="material-symbols-outlined text-primary text-sm">location_city</span>
            <span className="text-white text-sm font-semibold">{stad}</span>
            {zoekStatus === 'gevonden' && lat && (
              <span className="text-white/30 text-xs ml-auto">
                {lat.toFixed(4)}, {lng?.toFixed(4)}
              </span>
            )}
          </div>
        )}

        {/* Opslaan */}
        {stad && (zoekStatus === 'gevonden' || huidigeStad) && !opgeslagen && (
          <button
            onClick={bewaar}
            disabled={opslaan}
            className="w-full btn-primary py-3 text-sm"
          >
            {opslaan ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                Opslaan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">save</span>
                Locatie opslaan
              </>
            )}
          </button>
        )}

        {opgeslagen && (
          <div className="flex items-center gap-2 text-primary text-sm font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Opgeslagen — km-filter actief op het dashboard
          </div>
        )}
      </div>
    </section>
  )
}
