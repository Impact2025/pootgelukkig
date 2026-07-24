export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { asielen, dieren } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BottomNav from '@/components/layout/BottomNav'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.pootgelukkig.nl'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const [asiel] = await db
    .select({ naam: asielen.naam, stad: asielen.stad, regio: asielen.regio, beschrijving: asielen.beschrijving, logoUrl: asielen.logoUrl })
    .from(asielen)
    .where(eq(asielen.id, parseInt(id)))
    .limit(1)

  if (!asiel) return { title: 'Asiel niet gevonden — PootGelukkig' }

  const beschrijving =
    asiel.beschrijving?.trim() ||
    `Bekijk de dieren die een thuis zoeken bij ${asiel.naam} in ${asiel.stad}, ${asiel.regio}. Adopteer een asieldier via PootGelukkig.`

  return {
    title: `${asiel.naam} — Asiel in ${asiel.stad} | PootGelukkig`,
    description: beschrijving.slice(0, 160),
    alternates: { canonical: `/asielen/${id}` },
    openGraph: {
      title: `${asiel.naam} in ${asiel.stad}`,
      description: `Ontdek de asieldieren van ${asiel.naam} die een nieuw thuis zoeken.`,
      images: asiel.logoUrl ? [{ url: asiel.logoUrl }] : [],
    },
  }
}

export default async function AsielPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const asielId = parseInt(id)
  if (isNaN(asielId)) notFound()

  const [asiel] = await db
    .select()
    .from(asielen)
    .where(eq(asielen.id, asielId))
    .limit(1)

  if (!asiel) notFound()

  const beschikbareDieren = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      soort: dieren.soort,
      ras: dieren.ras,
      leeftijdJaren: dieren.leeftijdJaren,
      geslacht: dieren.geslacht,
      hoofdFotoUrl: dieren.hoofdFotoUrl,
      gedragsProfiel: dieren.gedragsProfiel,
      status: dieren.status,
    })
    .from(dieren)
    .where(eq(dieren.asielId, asielId))

  const beschikbaar = beschikbareDieren.filter((d) => d.status === 'beschikbaar')
  const overig = beschikbareDieren.filter((d) => d.status !== 'beschikbaar')

  const energieLabel: Record<string, string> = {
    laag: 'Rustig',
    normaal: 'Normaal',
    hoog: 'Actief',
    zeer_hoog: 'Heel actief',
  }

  // schema.org AnimalShelter — sterke lokale-SEO-signalen ("asiel [stad]")
  const shelterSchema = {
    '@context': 'https://schema.org',
    '@type': 'AnimalShelter',
    name: asiel.naam,
    url: `${APP_URL}/asielen/${asiel.id}`,
    ...(asiel.beschrijving ? { description: asiel.beschrijving } : {}),
    ...(asiel.logoUrl ? { image: asiel.logoUrl, logo: asiel.logoUrl } : {}),
    ...(asiel.telefoon ? { telephone: asiel.telefoon } : {}),
    ...(asiel.email ? { email: asiel.email } : {}),
    ...(asiel.website ? { sameAs: [asiel.website] } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(asiel.adres ? { streetAddress: asiel.adres } : {}),
      addressLocality: asiel.stad,
      addressRegion: asiel.regio,
      ...(asiel.postcode ? { postalCode: asiel.postcode } : {}),
      addressCountry: 'NL',
    },
    ...(asiel.lat != null && asiel.lng != null
      ? { geo: { '@type': 'GeoCoordinates', latitude: asiel.lat, longitude: asiel.lng } }
      : {}),
  }

  return (
    <div className="mobile-container bg-bg-dark">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shelterSchema) }}
      />
      {/* Header */}
      <nav className="sticky top-0 z-50 ios-blur border-b border-white/10 px-4 py-3 flex items-center gap-3 bg-bg-dark/80">
        <Link href="/zoeken">
          <button className="text-white/60">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
        </Link>
        <span className="text-sm font-bold text-white">{asiel.naam}</span>
      </nav>

      <main className="pb-32">
        {/* Asiel hero */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent px-6 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="size-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
              {asiel.logoUrl ? (
                <Image src={asiel.logoUrl} alt={asiel.naam} width={64} height={64} className="rounded-2xl object-cover" />
              ) : (
                <span className="material-symbols-outlined text-white/40 text-3xl">home_work</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">{asiel.naam}</h1>
              <p className="text-white/50 text-sm flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {asiel.stad}, {asiel.regio}
              </p>
            </div>
          </div>

          {asiel.beschrijving && (
            <p className="text-white/60 text-sm leading-relaxed">{asiel.beschrijving}</p>
          )}

          {/* Contact info */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {asiel.telefoon && (
              <a href={`tel:${asiel.telefoon}`}>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">call</span>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold">Bellen</p>
                    <p className="text-xs text-white font-medium">{asiel.telefoon}</p>
                  </div>
                </div>
              </a>
            )}
            {asiel.email && (
              <a href={`mailto:${asiel.email}`}>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">mail</span>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold">Mailen</p>
                    <p className="text-xs text-white font-medium truncate">{asiel.email}</p>
                  </div>
                </div>
              </a>
            )}
            {asiel.website && (
              <a href={asiel.website} target="_blank" rel="noopener noreferrer" className="col-span-2">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-primary text-xl">language</span>
                  <p className="text-xs text-white font-medium">{asiel.website}</p>
                  <span className="material-symbols-outlined text-white/30 text-sm ml-auto">open_in_new</span>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Beschikbare dieren */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-extrabold text-lg">
              Beschikbaar ({beschikbaar.length})
            </h2>
          </div>

          {beschikbaar.length === 0 ? (
            <div className="text-center py-10 bg-white/3 rounded-2xl border border-white/8">
              <span className="material-symbols-outlined text-white/20 text-4xl block mb-2">pets</span>
              <p className="text-white/40 text-sm">Momenteel geen dieren beschikbaar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {beschikbaar.map((dier) => (
                <Link key={dier.id} href={`/animals/${dier.id}`}>
                  <div className="flex gap-3 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors p-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 relative">
                      {dier.hoofdFotoUrl ? (
                        <Image src={dier.hoofdFotoUrl} alt={dier.naam} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/20 text-2xl">pets</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="font-bold text-white">{dier.naam}</h3>
                      <p className="text-white/50 text-xs mt-0.5">
                        {[dier.ras ?? dier.soort, dier.leeftijdJaren ? `${dier.leeftijdJaren} jaar` : null]
                          .filter(Boolean).join(' • ')}
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {dier.gedragsProfiel?.energieNiveau && (
                          <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                            {energieLabel[dier.gedragsProfiel.energieNiveau]}
                          </span>
                        )}
                        {dier.gedragsProfiel?.kindvriendelijk && (
                          <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                            Kindvriendelijk
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-white/20 self-center flex-shrink-0">arrow_forward_ios</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Geadopteerde dieren (verleden) */}
          {overig.length > 0 && (
            <div className="mt-8">
              <h2 className="text-white/40 font-bold text-sm uppercase tracking-wider mb-3">
                Eerder geadopteerd
              </h2>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {overig.slice(0, 8).map((dier) => (
                  <div key={dier.id} className="flex-shrink-0 w-16 opacity-50">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 relative mb-1">
                      {dier.hoofdFotoUrl ? (
                        <Image src={dier.hoofdFotoUrl} alt={dier.naam} fill className="object-cover grayscale" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/20 text-xl">pets</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-white/40 text-center font-medium truncate">{dier.naam}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
