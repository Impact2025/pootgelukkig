'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/Toaster'

interface Props {
  dierId: number
  isGefavoriet: boolean
}

export default function FavorietKnop({ dierId, isGefavoriet: initieel }: Props) {
  const [gefavoriet, setGefavoriet] = useState(initieel)
  const [laden, setLaden] = useState(false)
  const [popping, setPopping] = useState(false)
  const { toast } = useToast()

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (laden) return
    setLaden(true)
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
        toast(nieuw ? 'Opgeslagen in favorieten' : 'Verwijderd uit favorieten', nieuw ? 'success' : 'info')
      } else {
        setGefavoriet(!nieuw)
        toast('Probeer opnieuw', 'error')
      }
    } catch {
      setGefavoriet(!nieuw)
      toast('Probeer opnieuw', 'error')
    } finally {
      setLaden(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={laden}
      className="absolute top-4 right-4 z-10 size-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-opacity"
      aria-label={gefavoriet ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
    >
      <span
        className={`material-symbols-outlined text-xl transition-colors ${
          gefavoriet ? 'text-red-400' : 'text-white/70'
        } ${popping ? 'animate-heart-pop' : ''}`}
        style={gefavoriet ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        favorite
      </span>
    </button>
  )
}
