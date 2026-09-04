import type { Metadata } from 'next'
import { Section, Eyebrow, SectionHeading } from '@/components/marketing/ui'
import { ContactForm } from '@/components/marketing/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — ImpactOS',
  description:
    'Neem contact op met ImpactOS voor een demo, een Doorbraak Sprint of een vraag over je organisatie-account. We reageren doorgaans binnen één werkdag.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — ImpactOS',
    description: 'Plan een gratis demo, een Doorbraak Sprint, of stel je vraag over ImpactOS voor jouw organisatie.',
    url: '/contact',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

const DOORBRAAK_SPRINT_ONDERDELEN = [
  '1 dagdeel, op locatie bij jouw organisatie',
  'Volledige ImpactOS-setup: CRM, dossiers, AI-collega\'s',
  'Team traint meteen mee in het platform',
  'Gemiddeld 5-10 uur per week structurele tijdwinst terug',
]

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ onderwerp?: string }>
}) {
  const { onderwerp } = await searchParams
  const standaardOnderwerp = onderwerp === 'doorbraak-sprint' || onderwerp === 'demo' ? onderwerp : 'algemeen'
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'info@weareimpact.nl',
    url: 'https://www.impactos.nl/contact',
    availableLanguage: 'Dutch',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1E293B] sm:text-5xl">
              Laten we kennismaken
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#1E293B]/65">
              Wil je een demo, een Doorbraak Sprint plannen, of heb je een vraag over je account? We
              reageren doorgaans binnen één werkdag.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#3B82F6]/12 text-[#2563EB]">
                  <span className="material-symbols-outlined">mail</span>
                </span>
                <a
                  href="mailto:info@weareimpact.nl"
                  className="text-base font-semibold text-[#1E293B] hover:text-[#2563EB]"
                >
                  info@weareimpact.nl
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#3B82F6]/12 text-[#2563EB]">
                  <span className="material-symbols-outlined">apartment</span>
                </span>
                <span className="text-base font-semibold text-[#1E293B]">
                  Een initiatief van WeAreImpact
                </span>
              </div>
            </div>
          </div>

          <ContactForm standaardOnderwerp={standaardOnderwerp} />
        </div>
      </Section>

      {/* Doorbraak Sprint intakeblok */}
      <div className="bg-white">
        <Section>
          <div className="grid items-center gap-10 rounded-[2rem] border border-[#2563EB]/15 bg-[#2563EB]/5 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <Eyebrow>Doorbraak Sprint</Eyebrow>
              <SectionHeading
                title="In één dagdeel je administratie op orde"
                intro="De Doorbraak Sprint is onze snelste route naar een werkend platform: wij komen op locatie, richten ImpactOS samen met je team in, en jullie vertrekken diezelfde dag met een compleet werkend systeem."
              />
              <div className="mt-6 flex items-end gap-2">
                <span className="text-3xl font-extrabold text-[#1E293B]">€ 1.750</span>
                <span className="mb-1 text-sm font-medium text-[#1E293B]/50">eenmalig, 1 dagdeel op locatie</span>
              </div>
            </div>
            <ul className="space-y-3">
              {DOORBRAAK_SPRINT_ONDERDELEN.map((item) => (
                <li key={item} className="flex items-center gap-3 rounded-2xl border border-[#1E293B]/8 bg-white px-4 py-3">
                  <span className="material-symbols-outlined text-[#2563EB]">check_circle</span>
                  <span className="text-sm font-semibold text-[#1E293B]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-sm text-[#1E293B]/45">
            Kies bij het contactformulier hierboven &ldquo;Doorbraak Sprint plannen&rdquo; als onderwerp
            en we nemen binnen één werkdag contact op om een datum te plannen.
          </p>
        </Section>
      </div>
    </>
  )
}
