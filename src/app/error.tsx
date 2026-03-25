'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mobile-container bg-bg-dark flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-red-400 text-4xl">error_outline</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white">Oeps, er ging iets mis</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw of ga terug naar het dashboard.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="w-full bg-primary text-bg-dark font-bold py-3.5 rounded-2xl"
        >
          Probeer opnieuw
        </button>
        <Link href="/dashboard">
          <button className="w-full bg-white/5 border border-white/10 text-white font-medium py-3.5 rounded-2xl">
            Terug naar dashboard
          </button>
        </Link>
      </div>
    </div>
  )
}
