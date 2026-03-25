'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  naam: string
  hoofdFotoUrl: string | null
  fotoUrls: string[]
}

export default function FotoCarousel({ naam, hoofdFotoUrl, fotoUrls }: Props) {
  const alle = [hoofdFotoUrl, ...fotoUrls.filter((u) => u && u !== hoofdFotoUrl)].filter(
    Boolean
  ) as string[]

  const [index, setIndex] = useState(0)

  if (alle.length === 0) {
    return (
      <div className="w-full h-[460px] bg-white/10 rounded-b-3xl flex items-center justify-center">
        <span className="material-symbols-outlined text-white/20 text-8xl">pets</span>
      </div>
    )
  }

  function vorige(e: React.MouseEvent) {
    e.preventDefault()
    setIndex((i) => (i - 1 + alle.length) % alle.length)
  }

  function volgende(e: React.MouseEvent) {
    e.preventDefault()
    setIndex((i) => (i + 1) % alle.length)
  }

  return (
    <div className="relative w-full h-[460px] overflow-hidden rounded-b-3xl group">
      {/* Foto */}
      <Image
        src={alle[index]}
        alt={`Foto ${index + 1} van ${naam}`}
        fill
        className="object-cover transition-opacity duration-300"
        priority={index === 0}
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-transparent to-transparent" />

      {/* Navigatie zones (alleen als meerdere foto's) */}
      {alle.length > 1 && (
        <>
          <button
            onClick={vorige}
            className="absolute left-0 top-0 h-full w-1/3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-start pl-4"
            aria-label="Vorige foto"
          >
            <div className="size-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">chevron_left</span>
            </div>
          </button>
          <button
            onClick={volgende}
            className="absolute right-0 top-0 h-full w-1/3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-4"
            aria-label="Volgende foto"
          >
            <div className="size-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">chevron_right</span>
            </div>
          </button>

          {/* Dots */}
          <div className="absolute bottom-[100px] left-0 right-0 flex justify-center gap-1.5 z-10">
            {alle.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setIndex(i) }}
                className={`rounded-full transition-all ${
                  i === index ? 'w-5 h-1.5 bg-white' : 'size-1.5 bg-white/40'
                }`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
