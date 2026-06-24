import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section, Eyebrow } from '@/components/marketing/ui'
import {
  CATEGORIEEN,
  categorieBySlug,
  artikelenVoorCategorie,
  DOELGROEP_LABELS,
} from '@/lib/kennisbank/content'

export function generateStaticParams() {
  return CATEGORIEEN.map((c) => ({ categorie: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>
}): Promise<Metadata> {
  const { categorie } = await params
  const cat = categorieBySlug(categorie)
  if (!cat) return { title: 'Kennisbank — PootGelukkig' }
  return {
    title: `${cat.naam} — Kennisbank — PootGelukkig`,
    description: cat.beschrijving,
    alternates: { canonical: `/kennisbank/${cat.slug}` },
    openGraph: {
      title: `${cat.naam} — Kennisbank`,
      description: cat.beschrijving,
      url: `/kennisbank/${cat.slug}`,
      type: 'website',
    },
  }
}

export default async function KennisCategoriePage({
  params,
}: {
  params: Promise<{ categorie: string }>
}) {
  const { categorie } = await params
  const cat = categorieBySlug(categorie)
  if (!cat) notFound()

  const artikelen = artikelenVoorCategorie(cat.slug)

  return (
    <Section>
      <nav aria-label="Kruimelpad" className="text-sm font-semibold text-[#33335c]/45">
        <Link href="/kennisbank" className="hover:text-[#33335c]">Kennisbank</Link>
        <span className="px-2">/</span>
        <span className="text-[#33335c]/70">{cat.naam}</span>
      </nav>

      <div className="mt-5 max-w-2xl">
        <Eyebrow>{DOELGROEP_LABELS[cat.doelgroep]}</Eyebrow>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
          {cat.naam}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">{cat.beschrijving}</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {artikelen.map((a) => (
          <Link
            key={a.slug}
            href={`/kennisbank/${cat.slug}/${a.slug}`}
            className="group flex flex-col rounded-3xl border border-[#33335c]/8 bg-white p-7 shadow-[0_1px_3px_rgba(51,51,92,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(51,51,92,0.08)]"
          >
            <h2 className="text-lg font-bold leading-tight text-[#33335c]">{a.titel}</h2>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#33335c]/60">{a.samenvatting}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#ee5b2b]">
              Lees verder
              <span className="material-symbols-outlined text-[1.1rem]">arrow_forward</span>
            </span>
          </Link>
        ))}
      </div>
    </Section>
  )
}
