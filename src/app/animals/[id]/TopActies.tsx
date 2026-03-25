'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toaster'

interface Props {
  dierId: number
  dierNaam: string
  isGefavoriet: boolean
}

export default function TopActies({ dierId, dierNaam, isGefavoriet: initieel }: Props) {
  const [gefavoriet, setGefavoriet] = useState(initieel)
  const [favorietLaden, setFavorietLaden] = useState(false)
  const [popping, setPopping] = useState(false)
  const { toast } = useToast()

  async function toggleFavoriet(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (favorietLaden) return
    setFavorietLaden(true)
    const nieuw = !gefavoriet
    setGefavoriet(nieuw)
    if (nieuw) {
      setPopping(true)
      setTimeout(() => setPopping(false), 400)
    }
    try {
      const res = await fetch('/api/favorieten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dierId }),
      })
      if (res.ok) {
        toast(nieuw ? `${dierNaam} opgeslagen in favorieten` : 'Verwijderd uit favorieten', nieuw ? 'success' : 'info')
      } else {
        setGefavoriet(!nieuw)
        toast('Probeer opnieuw', 'error')
      }
    } catch {
      setGefavoriet(!nieuw)
      toast('Probeer opnieuw', 'error')
    } finally {
      setFavorietLaden(false)
    }
  }

  async function delen(e: React.MouseEvent) {
    e.preventDefault()
    const url = window.location.href
    const title = `Ontmoet ${dierNaam} op PootGelukkig`
    const text = `${dierNaam} zoekt een thuis — bekijk het profiel op PootGelukkig!`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // Gebruiker annuleerde — geen fout tonen
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast('Link gekopieerd naar klembord', 'success')
      } catch {
        toast('Kon link niet kopiëren', 'error')
      }
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={delen}
        className="flex items-center justify-center size-10 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition-colors"
        aria-label="Deel dit dier"
      >
        <span className="material-symbols-outlined">share</span>
      </button>
      <button
        onClick={toggleFavoriet}
        disabled={favorietLaden}
        className="flex items-center justify-center size-10 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
        aria-label={gefavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
      >
        <span
          className={`material-symbols-outlined transition-colors ${
            gefavoriet ? 'text-red-400' : 'text-white'
          } ${popping ? 'animate-heart-pop' : ''}`}
          style={gefavoriet ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          favorite
        </span>
      </button>
    </div>
  )
}
