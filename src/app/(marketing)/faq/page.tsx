import type { Metadata } from 'next'
import { Section, Eyebrow } from '@/components/marketing/ui'
import { FaqAccordion } from '@/components/marketing/FaqAccordion'
import { faqPageSchema, breadcrumbSchema } from '@/lib/seo-kit'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen — ImpactOS',
  description:
    'Antwoorden op vragen van zakelijke beslissers over ImpactOS: AVG en privacy, de human-in-the-loop garantie, het inbegrepen AI-tegoed en hoe snel je operationeel bent.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Veelgestelde vragen — ImpactOS',
    description: 'AVG en privacy, human-in-the-loop, AI-tegoed en implementatietijd — helder uitgelegd.',
    url: '/faq',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

const GROEPEN = [
  {
    titel: 'AVG en privacy',
    items: [
      {
        vraag: 'Hoe waarborgen jullie AVG en privacy rondom cliëntgegevens?',
        antwoord:
          'Al je gegevens worden versleuteld verwerkt binnen de EU. We hanteren zero-retention bij de onderliggende AI-modellen: prompts en cliëntgegevens worden niet bewaard door de modelleverancier en nooit gebruikt om publieke AI-modellen te trainen. Jouw dossiers en cliëntgegevens blijven van jouw organisatie.',
      },
      {
        vraag: 'Van wie zijn de gegevens?',
        antwoord: 'De gegevens van je dossiers, cliënten en begeleidingen blijven van jouw organisatie. We verwerken ze uitsluitend om ImpactOS voor jullie te laten werken.',
      },
    ],
  },
  {
    titel: 'Human-in-the-loop',
    items: [
      {
        vraag: 'Wat houdt de Human-in-the-Loop garantie in?',
        antwoord:
          'Geen enkele tekst die een AI-collega genereert — een subsidieaanvraag, een rapportage, een social post — vertrekt autonoom. Elk concept landt in de wachtrij en vereist een menselijke klik op "Goedkeuren" voordat het de deur uitgaat. De AI bereidt voor, jouw team beslist.',
      },
      {
        vraag: 'Wat doet de AI precies, en wat niet?',
        antwoord:
          'De AI-collega\'s (Sam, Mila, Conny, Bram en Samen) bereiden concepten voor op basis van jouw eigen dossierdata en beantwoorden veelgestelde vragen van bezoekers. Ze nemen nooit een besluit over een cliënt, dossier of aanvraag — dat blijft altijd bij een medewerker.',
      },
    ],
  },
  {
    titel: 'AI-tegoed en kosten',
    items: [
      {
        vraag: 'Wat dekt het inbegrepen AI-tegoed van € 35,- per maand?',
        antwoord:
          'Elk pakket bevat € 35 AI-tegoed per maand, goed voor circa 15 tot 25 miljoen tokens — ruim voldoende voor regulier gebruik van een gemiddelde organisatie. Je ziet je actuele verbruik altijd terug op het dashboard. Extra verbruik daarboven wordt transparant doorbelast.',
      },
      {
        vraag: 'Kan ik overstappen of stoppen?',
        antwoord: 'Ja. Alle abonnementen zijn maandelijks opzegbaar en je houdt te allen tijde toegang tot je eigen gegevens.',
      },
    ],
  },
  {
    titel: 'Implementatie',
    items: [
      {
        vraag: 'Hoe snel is ImpactOS operationeel?',
        antwoord:
          'De AI-Widget staat binnen 5 werkdagen live op je website. Het complete platform — CRM, dossiers, AI-collega\'s en training van je team — is binnen 10 tot 14 dagen volledig operationeel. Kies je voor een Doorbraak Sprint, dan richten we alles in één dagdeel op locatie in.',
      },
      {
        vraag: 'Heb ik technische kennis nodig om te starten?',
        antwoord: 'Nee. We richten het platform samen met je team in en verzorgen de training. De AI-Widget plaats je met een eenvoudige embed-code op je bestaande website.',
      },
    ],
  },
]

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl').replace(/\/+$/, '')

export default function FaqPage() {
  const faqItems = GROEPEN.flatMap((g) =>
    g.items.map((i) => ({ question: i.vraag, answer: i.antwoord })),
  )
  const jsonLd = [
    faqPageSchema(faqItems),
    breadcrumbSchema([
      { name: 'Home', url: `${APP_URL}/` },
      { name: 'FAQ', url: `${APP_URL}/faq` },
    ]),
  ]

  return (
    <>
      {jsonLd.map((s, idx) => (
        <script key={idx} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <Section className="!pb-10">
        <div className="max-w-2xl">
          <Eyebrow>Veelgestelde vragen</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1E293B] sm:text-5xl">
            Antwoorden op je vragen
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#1E293B]/65">
            Staat je vraag er niet bij? Neem contact met ons op.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="space-y-14">
          {GROEPEN.map((groep) => (
            <div key={groep.titel}>
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.14em] text-[#1E293B]/40">
                {groep.titel}
              </h2>
              <FaqAccordion items={groep.items} />
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
