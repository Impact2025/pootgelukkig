'use client'

import Link from 'next/link'

export default function AnimalError() {
  return (
    <div className="mobile-container bg-bg-dark flex flex-col items-center justify-center px-6 text-center gap-5">
      <span className="material-symbols-outlined text-white/20 text-6xl">pets</span>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white">Dier niet gevonden</h1>
        <p className="text-white/40 text-sm">Dit dier bestaat niet meer of is verwijderd.</p>
      </div>
      <Link href="/dashboard">
        <button className="btn-primary">Terug naar dashboard</button>
      </Link>
    </div>
  )
}
