'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NazorgGenereerKnop({
  adoptionId,
  dierNaam,
}: {
  adoptionId: number
  dierNaam: string
}) {
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const router = useRouter()

  async function genereer() {
    setLaden(true)
    setFout(null)
    try {
      const res = await fetch('/api/nazorg/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adoptionId }),
      })
      if (!res.ok) {
        const json = await res.json()
        setFout(json.error ?? 'Er is iets misgegaan')
        return
      }
      router.refresh()
    } catch {
      setFout('Kon plan niet genereren. Probeer opnieuw.')
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="w-full space-y-3">
      <button
        onClick={genereer}
        disabled={laden}
        className="w-full bg-terracotta-dark hover:bg-terracotta text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-60"
      >
        {laden ? (
          <>
            <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            AI genereert plan voor {dierNaam}...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">auto_awesome</span>
            Maak persoonlijk plan
          </>
        )}
      </button>
      {fout && <p className="text-red-500 text-sm text-center">{fout}</p>}
    </div>
  )
}
