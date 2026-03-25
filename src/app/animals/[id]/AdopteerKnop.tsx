'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toaster'

interface Props {
  dierId: number
  dierNaam: string
  bestaandeStatus?: string
}

export default function AdopteerKnop({ dierId, dierNaam, bestaandeStatus }: Props) {
  const [status, setStatus] = useState(bestaandeStatus ?? null)
  const [laden, setLaden] = useState(false)
  const [bevestigen, setBevestigen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  if (status === 'aangevraagd') {
    return (
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 text-white/60">
        <span className="material-symbols-outlined text-primary">hourglass_top</span>
        <span className="font-semibold text-sm">Aangevraagd — asiel neemt contact op</span>
      </div>
    )
  }

  if (status === 'goedgekeurd' || status === 'afgerond') {
    return (
      <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 text-primary">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <span className="font-bold text-sm">
          {status === 'afgerond' ? `${dierNaam} is van jou! 🎉` : 'Adoptie goedgekeurd'}
        </span>
      </div>
    )
  }

  async function adopteer() {
    setLaden(true)
    setBevestigen(false)
    try {
      const res = await fetch('/api/adopties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dierId }),
      })
      const json = await res.json()
      if (res.ok) {
        setStatus(json.data.status)
        toast(`Adoptieaanvraag voor ${dierNaam} verstuurd!`, 'success')
        router.refresh()
      } else {
        toast('Er ging iets mis. Probeer opnieuw.', 'error')
      }
    } catch {
      toast('Geen verbinding. Probeer opnieuw.', 'error')
    } finally {
      setLaden(false)
    }
  }

  if (bevestigen) {
    return (
      <div className="space-y-2">
        <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl py-4 px-5 text-center">
          <p className="text-white font-bold text-sm mb-0.5">Weet je het zeker?</p>
          <p className="text-white/50 text-xs">
            Het asiel neemt zo snel mogelijk contact op.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setBevestigen(false)}
            className="py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/8 transition-colors"
          >
            Annuleer
          </button>
          <button
            onClick={adopteer}
            disabled={laden}
            className="py-3.5 rounded-2xl bg-primary text-bg-dark font-extrabold text-sm shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {laden ? (
              <span className="size-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
            ) : (
              'Ja, aanvragen'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setBevestigen(true)}
      className="w-full bg-primary text-bg-dark font-extrabold py-4 rounded-2xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 text-base"
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
        favorite
      </span>
      Adopteer {dierNaam}
    </button>
  )
}
