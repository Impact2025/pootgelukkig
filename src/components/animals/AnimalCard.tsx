import Link from 'next/link'
import Image from 'next/image'
import FavorietKnop from './FavorietKnop'

interface AnimalCardProps {
  id: number
  naam: string
  soort: string
  ras: string | null
  leeftijdJaren: number | null
  hoofdFotoUrl: string | null
  score: number
  analyseTekst: string | null
  energieNiveau?: string
  gedragTags?: string[]
  isGefavoriet?: boolean
  afstandKm?: number | null
  asielStad?: string | null
}

const energieLabel: Record<string, string> = {
  laag: 'Rustig',
  normaal: 'Normaal',
  hoog: 'Actief',
  zeer_hoog: 'Heel actief',
}

const scoreKleur = (score: number) => {
  if (score >= 90) return 'bg-primary text-bg-dark'
  if (score >= 75) return 'bg-primary/80 text-bg-dark'
  return 'bg-white/20 text-white'
}

export default function AnimalCard({
  id,
  naam,
  soort,
  ras,
  leeftijdJaren,
  hoofdFotoUrl,
  score,
  analyseTekst,
  energieNiveau,
  gedragTags = [],
  isGefavoriet = false,
  afstandKm = null,
  asielStad = null,
}: AnimalCardProps) {
  return (
    <Link href={`/animals/${id}`}>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative hover:border-white/25 hover:shadow-xl hover:shadow-black/20 transition-all duration-200 group">
        {/* Match badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg backdrop-blur-sm ${scoreKleur(score)}`}>
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            {score}% Match
          </div>
        </div>

        {/* Favoriet knop */}
        <FavorietKnop dierId={id} isGefavoriet={isGefavoriet} />

        {/* Foto */}
        <div className="h-64 w-full bg-white/10 relative overflow-hidden">
          {hoofdFotoUrl ? (
            <Image
              src={hoofdFotoUrl}
              alt={`Foto van ${naam}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white/20 text-6xl">pets</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12122a]/80 via-transparent to-transparent" />
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-2xl font-extrabold text-white leading-none">{naam}</h4>
              <p className="text-white/50 text-sm mt-1.5 truncate">
                {ras || soort}
                {leeftijdJaren ? ` · ${leeftijdJaren} jaar` : ''}
              </p>
              {(afstandKm !== null || asielStad) && (
                <p className="text-white/30 text-xs mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">location_on</span>
                  {afstandKm !== null ? `~${afstandKm} km` : ''}{afstandKm !== null && asielStad ? ' · ' : ''}{asielStad ?? ''}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          {(energieNiveau || gedragTags.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {energieNiveau && (
                <span className="flex items-center gap-1 text-[10px] bg-primary/15 text-primary px-2.5 py-1 rounded-full font-bold">
                  <span className="material-symbols-outlined text-[10px]">bolt</span>
                  {energieLabel[energieNiveau] ?? energieNiveau}
                </span>
              )}
              {gedragTags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] bg-white/8 text-white/50 px-2.5 py-1 rounded-full">
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </span>
              ))}
            </div>
          )}

          {/* AI analyse */}
          {analyseTekst && (
            <div className="mt-4 flex gap-2">
              <span className="material-symbols-outlined text-primary/60 text-sm flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <p className="text-white/45 text-sm leading-relaxed line-clamp-2 italic">{analyseTekst}</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-primary/80 text-xs font-bold">
              <span className="material-symbols-outlined text-sm">visibility</span>
              Bekijk profiel
            </div>
            <span className="material-symbols-outlined text-white/20 text-sm">arrow_forward_ios</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
