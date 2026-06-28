import type { Metadata } from 'next'
import Image from 'next/image'
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

  const artikelenCount = artikelenVoorCategorie(cat.slug).length
  const metaDescMap: Record<string, string> = {
    voorbereiding: `Alles wat je moet weten voordat je een dier uit het asiel adopteert. Ontdek waar je op moet letten, welke voorbereidingen je thuis moet treffen, welke kosten erbij komen kijken en welk dier het beste bij jouw leefstijl past. ${artikelenCount} praktische artikelen met tips voor een zorgeloze adoptie.`,
    intake: `Hoe werkt de intake bij PootGelukkig? Lees wat er met je gegevens gebeurt, hoelang het adoptieproces duurt en welke stappen je doorloopt van aanmelding tot match. Complete uitleg voor een vlekkeloze start.`,
    thuiskomst: `Je nieuwe asieldier komt thuis — spannend! Lees hoe je de eerste dagen (3-3-3 regel) soepel laat verlopen, andere huisdieren introduceert en een dagritme opbouwt. Praktische begeleiding voor een warm welkom.`,
    nazorg: `Gezondheid en welzijn van je adoptiedier. Wanneer naar de dierenarts, welke gedragsveranderingen normaal zijn in de eerste maand en hoe je je dier de beste nazorg geeft na adoptie. Advies van experts.`,
    dashboard: `Zelf aan de slag met het PootGelukkig asiel-dashboard. Leer hoe je dieren bulksgewijs importeert, statistieken bijhoudt en je adoptieproces digitaal inricht. Stap-voor-stap handleiding voor asielmedewerkers.`,
    matching: `Hoe werkt de AI-matchscore van PootGelukkig? Leer hoe je aanvragen filtert, de matchkans van asieldieren verbetert en sneller de juiste adoptant vindt. Praktische gids voor asiels.`,
    'privacy-avg': `Privacy en AVG voor asiels die gebruikmaken van PootGelukkig. Ontdek wat je rechten en plichten zijn, hoe lang gegevens bewaard mogen worden en welke rechten adoptanten hebben volgens de privacywetgeving.`,
    'hoe-het-werkt': `Alles over hoe PootGelukkig werkt. Voor wie is het platform bedoeld, hoe meld je een asiel aan, hoe werkt de AI-matching en wat kost het. Complete uitleg voor asiels en adoptanten.`,
  }

  return {
    title: `${cat.naam} — Kennisbank — PootGelukkig`,
    description: metaDescMap[cat.slug] || cat.beschrijving,
    alternates: { canonical: `/kennisbank/${cat.slug}` },
    openGraph: {
      title: `${cat.naam} — Kennisbank`,
      description: metaDescMap[cat.slug] || cat.beschrijving,
      url: `/kennisbank/${cat.slug}`,
      type: 'website',
      images: [{ url: '/images/og-default-kennisbank.jpg', width: 1200, height: 675 }],
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
            className="group flex flex-col rounded-3xl border border-[#33335c]/8 bg-white shadow-[0_1px_3px_rgba(51,51,92,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(51,51,92,0.08)] overflow-hidden"
          >
            {a.coverUrl && (
              <div className="relative aspect-[16/9] overflow-hidden bg-[#f1f1f5]">
                <Image src={a.coverUrl} alt={a.titel} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-7 pt-5">
              <h2 className="text-lg font-bold leading-tight text-[#33335c]">{a.titel}</h2>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#33335c]/60">{a.samenvatting}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#ee5b2b]">
                Lees verder
                <span className="material-symbols-outlined text-[1.1rem]">arrow_forward</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}
