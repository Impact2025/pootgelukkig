import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, ButtonLink, CtaBlock } from '@/components/marketing/ui'
import { FaqAccordion } from '@/components/marketing/FaqAccordion'

export const metadata: Metadata = {
  title: 'Prijzen — PootGelukkig voor asiels',
  description:
    'Voor adoptanten is PootGelukkig gratis. Asiels starten gratis en groeien door naar een abonnement met AI-matching en Copilot.',
  alternates: { canonical: '/prijzen' },
  openGraph: {
    title: 'Prijzen — PootGelukkig voor asiels',
    description: 'Gratis voor adoptanten. Heldere abonnementen voor asiels.',
    url: '/prijzen',
    type: 'website',
  },
}

const TIERS = [
  {
    naam: 'Start',
    prijs: 'Gratis',
    periode: '',
    voor: 'Klein asiel dat wil proberen',
    features: ['Tot 5 actieve dieren', '1 gebruiker', 'Basis aanvragenbeheer', 'Geen AI-matching'],
    cta: { href: '/auth/register', label: 'Gratis beginnen' },
    highlight: false,
  },
  {
    naam: 'Asiel',
    prijs: '€39',
    periode: '/maand',
    voor: 'Zelfstandig asiel',
    features: [
      'Onbeperkt dieren',
      'AI-matching dashboard',
      'Copilot voor briefings en dossiers',
      'Tot 5 gebruikers',
      'Statistieken',
    ],
    cta: { href: '/contact', label: 'Aan de slag' },
    highlight: true,
    note: 'of €390 per jaar',
  },
  {
    naam: 'Netwerk',
    prijs: 'Op aanvraag',
    periode: '',
    voor: 'Dierenlot-aangesloten asiels',
    features: [
      'Alle features van Asiel',
      'Centraal gefactureerd of gesubsidieerd',
      'Koepelrapportage',
      'Meerdere locaties',
      'Prioriteit-support',
    ],
    cta: { href: '/contact', label: 'Neem contact op' },
    highlight: false,
  },
]

const PRIJS_FAQ = [
  {
    vraag: 'Is PootGelukkig gratis voor adoptanten?',
    antwoord:
      'Ja. Adoptanten gebruiken de intake, matching en nazorg volledig gratis. De abonnementen op deze pagina gelden alleen voor asiels.',
  },
  {
    vraag: 'Kan ik eerst gratis proberen?',
    antwoord:
      'Ja. Met de gratis Start-tier beheer je tot vijf actieve dieren en de basis aanvragen, zonder kosten. Je stapt over zodra je meer nodig hebt.',
  },
  {
    vraag: 'Wat is de Netwerk-tier?',
    antwoord:
      'Voor asiels die zijn aangesloten bij Dierenlot. De facturatie loopt dan centraal of via subsidie, en je krijgt koepelrapportage over meerdere locaties.',
  },
  {
    vraag: 'Kan ik maandelijks opzeggen?',
    antwoord:
      'Het maandabonnement is maandelijks opzegbaar. Bij een jaarabonnement betaal je vooraf en krijg je twee maanden korting.',
  },
]

export default function PrijzenPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'PootGelukkig — Asiel abonnement',
    description: 'Dashboard voor asiels met AI-matching, Copilot, statistieken en nazorg.',
    offers: [
      { '@type': 'Offer', name: 'Start', price: '0', priceCurrency: 'EUR', description: 'Gratis, tot 5 actieve dieren' },
      { '@type': 'Offer', name: 'Asiel', price: '39', priceCurrency: 'EUR', description: 'Onbeperkt dieren, AI-matching, Copilot' },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Section className="!pb-10">
        <div className="max-w-2xl">
          <Eyebrow>Prijzen</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Gratis voor adoptanten. Eerlijk voor asiels.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
            Begin gratis en groei door zodra PootGelukkig je echt werk uit handen neemt. Geen
            verrassingen, geen verplichtingen vooraf.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.naam}
              className={`flex flex-col rounded-[2rem] border p-8 ${
                tier.highlight
                  ? 'border-[#33335c] bg-[#33335c] text-white shadow-[0_20px_60px_rgba(51,51,92,0.18)]'
                  : 'border-[#33335c]/10 bg-white'
              }`}
            >
              {tier.highlight && (
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[#f8aa25] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#33335c]">
                  Populair
                </span>
              )}
              <h2
                className={`text-sm font-bold uppercase tracking-wide ${
                  tier.highlight ? 'text-white/60' : 'text-[#33335c]/45'
                }`}
              >
                {tier.naam}
              </h2>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{tier.prijs}</span>
                {tier.periode && (
                  <span className={tier.highlight ? 'mb-1 text-white/55' : 'mb-1 text-[#33335c]/45'}>
                    {tier.periode}
                  </span>
                )}
              </div>
              {tier.note && (
                <p className={`mt-1 text-sm ${tier.highlight ? 'text-white/55' : 'text-[#33335c]/45'}`}>
                  {tier.note}
                </p>
              )}
              <p className={`mt-2 text-sm font-medium ${tier.highlight ? 'text-white/70' : 'text-[#33335c]/60'}`}>
                {tier.voor}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={`material-symbols-outlined mt-0.5 text-[1.1rem] ${
                        tier.highlight ? 'text-[#f8aa25]' : 'text-[#e39207]'
                      }`}
                    >
                      check
                    </span>
                    <span className={`text-[15px] ${tier.highlight ? 'text-white/85' : 'text-[#33335c]/75'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <ButtonLink
                  href={tier.cta.href}
                  variant={tier.highlight ? 'primary' : 'ghost'}
                  className="w-full"
                >
                  {tier.cta.label}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[#33335c]/45">
          Genoemde bedragen zijn exclusief btw. De Netwerk-tier wordt afgestemd op de afspraken met
          Dierenlot.
        </p>
      </Section>

      <div className="bg-white">
        <Section>
          <SectionHeading center title="Vragen over prijzen" />
          <div className="mx-auto mt-10 max-w-3xl">
            <FaqAccordion items={PRIJS_FAQ} />
          </div>
        </Section>
      </div>

      <CtaBlock
        title="Benieuwd wat PootGelukkig voor jouw asiel doet?"
        intro="Plan een korte demo en we laten zien hoe het in jouw werkdag past."
        primary={{ href: '/contact', label: 'Plan een demo' }}
        secondary={{ href: '/voor-asielen', label: 'Voor asiels' }}
      />

      {/* Blog links */}
      <Section className="!pt-12 !pb-16">
        <SectionHeading
          eyebrow="Verder lezen"
          title="Lees meer over digitalisering in asiels"
        />
        <ul className="mt-6 space-y-3 text-[15px]">
          <li>→ <Link href="/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Administratieve lasten 30% verlagen</Link></li>
          <li>→ <Link href="/blog/diergedrag-vastleggen-zo-krijg-je-betere-matches" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Diergedrag vastleggen voor betere matches</Link></li>
          <li>→ <Link href="/blog/hoe-de-ai-matching-van-pootgelukkig-werkt" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Hoe AI-matching werkt — transparantie</Link></li>
          <li>→ <Link href="/blog/impactrapportage-voor-asielen-waarom-je-moet-meten-en-delen" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Impactrapportage: waarom meten en delen</Link></li>
        </ul>
      </Section>
    </>
  )
}
