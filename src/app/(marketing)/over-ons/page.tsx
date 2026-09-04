import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Over ons — ImpactOS',
  description:
    'ImpactOS is een initiatief van WeAreImpact: technologie die bureaucratie halveert en menselijke aandacht terugbrengt in de zorg en het welzijnswerk.',
  alternates: { canonical: '/over-ons' },
  openGraph: {
    title: 'Over ons — ImpactOS',
    description: 'Het verhaal achter ImpactOS: gebouwd samen met organisaties in het sociaal domein.',
    url: '/over-ons',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

export default function OverOnsPage() {
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ImpactOS',
    alternateName: 'ImpactOS — Over ons',
    url: 'https://www.impactos.nl/over-ons',
    description: 'Het verhaal achter ImpactOS: technologie voor het sociaal domein, gebouwd door WeAreImpact.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />
      <Section className="!pb-10">
        <div className="max-w-2xl">
          <Eyebrow>Over ImpactOS</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1E293B] sm:text-5xl">
            Minder bureaucratie, meer maatschappelijke impact
          </h1>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-[#1E293B]/75">
          <p>
            ImpactOS is een initiatief van WeAreImpact, opgezet door Vincent van Munster: AI-strateeg
            en kwartiermaker in het sociaal domein. Vincent werkte jarenlang met welzijnsstichtingen,
            zorgkwartiermakers en gemeentelijke initiatieven en zag telkens hetzelfde patroon —
            gedreven professionals die het grootste deel van hun week kwijt zijn aan dubbele invoer,
            losse spreadsheets en rapportages die achteraf gereconstrueerd moeten worden.
          </p>
          <p>
            Zijn overtuiging: technologie moet bureaucratie halveren, niet de mens vervangen. AI kan
            het zware voorbereidende werk uit handen nemen — een concept-subsidieaanvraag, een
            Wmo-rapportage, een eerste antwoord aan een cliënt — zodat professionals hun tijd weer
            kunnen besteden aan waar het om gaat: menselijke aandacht in de zorg en het welzijnswerk.
          </p>
          <p>
            Daarom bouwden we ImpactOS. Een platform dat dossiers, cliënten en begeleidingen
            structureert, en waarin vijf AI-collega&apos;s concepten voorbereiden die een medewerker
            altijd zelf beoordeelt. De organisatie beslist, altijd — de AI bereidt alleen voor.
          </p>
          <p>
            ImpactOS is een initiatief van WeAreImpact. We bouwen het samen met organisaties in het
            sociaal domein, met één doel: minder bureaucratie, meer maatschappelijke impact.
          </p>
        </div>
      </Section>

      <div className="bg-white">
        <Section>
          <SectionHeading eyebrow="Waar we voor staan" title="Onze uitgangspunten" />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'De organisatie beslist',
                tekst:
                  'Onze AI-collega\'s bereiden concepten voor, maar jullie team houdt altijd de regie. Niets vertrekt zonder menselijke goedkeuring.',
              },
              {
                title: 'Samen met organisaties',
                tekst:
                  'We ontwikkelen elke functie in de praktijk, samen met de professionals die er dagelijks mee werken.',
              },
              {
                title: 'Tijd terug voor mensen',
                tekst:
                  'Minder tijd naar formulieren en dubbele invoer betekent meer tijd voor cliënten en vrijwilligers.',
              },
            ].map((v) => (
              <div key={v.title} className="rounded-3xl border border-[#1E293B]/8 bg-[#F8FAFC] p-7">
                <h3 className="text-lg font-bold text-[#1E293B]">{v.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#1E293B]/65">{v.tekst}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <CtaBlock
        title="Bouw met ons mee"
        intro="Ben je een organisatie die processen wil structureren en bureaucratie wil verminderen? We gaan graag met je in gesprek."
        primary={{ href: '/contact', label: 'Neem contact op' }}
        secondary={{ href: '/voor-organisaties', label: 'Voor organisaties' }}
      />
    </>
  )
}
