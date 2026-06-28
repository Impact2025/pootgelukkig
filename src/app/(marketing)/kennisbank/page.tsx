import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, Eyebrow } from '@/components/marketing/ui'
import {
  categorieenPerDoelgroep,
  artikelenVoorCategorie,
  DOELGROEP_LABELS,
} from '@/lib/kennisbank/content'
import KennisbankSearch from '@/components/kennisbank/KennisbankSearch'

export const metadata: Metadata = {
  title: 'Kennisbank — PootGelukkig',
  description:
    'Gidsen en uitleg over het adopteren van asieldieren, het asiel-dashboard en hoe PootGelukkig werkt. Praktische naslag voor adoptanten en asiels met 18 artikelen in 8 categorieën.',
  alternates: { canonical: '/kennisbank' },
  openGraph: {
    title: 'Kennisbank — PootGelukkig',
    description: 'Praktische gidsen voor adoptanten en asiels: van intake tot nazorg en matching.',
    url: '/kennisbank',
    type: 'website',
    images: [{ url: '/images/og-default-kennisbank.jpg', width: 1200, height: 675 }],
  },
}

export default function KennisbankPage() {
  const groepen = categorieenPerDoelgroep()

  return (
    <>
      <Section className="!pb-10">
        <div className="max-w-2xl">
          <Eyebrow>Kennisbank</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Alles om met een gerust hart te adopteren
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
            Praktische gidsen voor adoptanten en asiels. Op zoek naar verhalen en nieuws? Bekijk de{' '}
            <Link href="/blog" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">blog</Link>.
          </p>
        </div>
      </Section>

      {/* Zoekbalk */}
      <Section className="!pt-0 !pb-4">
        <KennisbankSearch />
      </Section>

      <Section className="!pt-0">
        <div className="space-y-16">
          {groepen.map((groep) => (
            <div key={groep.doelgroep}>
              <h2 className="text-xl font-extrabold text-[#33335c]">{DOELGROEP_LABELS[groep.doelgroep]}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {groep.categorieen.map((cat) => {
                  const aantal = artikelenVoorCategorie(cat.slug).length
                  return (
                    <Link
                      key={cat.slug}
                      href={`/kennisbank/${cat.slug}`}
                      className="group flex flex-col rounded-3xl border border-[#33335c]/8 bg-white p-6 shadow-[0_1px_3px_rgba(51,51,92,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(51,51,92,0.08)]"
                    >
                      <span className="flex size-10 items-center justify-center rounded-xl bg-[#f8aa25]/12 text-[#e39207]">
                        <span className="material-symbols-outlined text-[1.25rem]">{cat.icon}</span>
                      </span>
                      <h3 className="mt-4 text-base font-bold text-[#33335c] group-hover:text-[#33335c]">
                        {cat.naam}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#33335c]/60">{cat.beschrijving}</p>
                      <span className="mt-4 text-xs font-bold uppercase tracking-wide text-[#33335c]/35">
                        {aantal} {aantal === 1 ? 'artikel' : 'artikelen'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
