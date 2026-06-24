import type { Metadata } from 'next'
import { Section, Eyebrow } from '@/components/marketing/ui'
import { FaqAccordion } from '@/components/marketing/FaqAccordion'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen — PootGelukkig',
  description:
    'Antwoorden op veelgestelde vragen over adopteren via PootGelukkig, het asiel-dashboard, en hoe de AI en privacy werken.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Veelgestelde vragen — PootGelukkig',
    description: 'Alles wat je wilt weten over adopteren, asiels, AI en privacy.',
    url: '/faq',
    type: 'website',
  },
}

const GROEPEN = [
  {
    titel: 'Voor adoptanten',
    items: [
      { vraag: 'Wat kost PootGelukkig voor mij?', antwoord: 'Niets. Voor adoptanten is alles gratis: de intake, de matching en de nazorg.' },
      { vraag: 'Hoe werkt de matching?', antwoord: 'Je vult een korte intake in over je leefstijl. Op basis daarvan koppelen we je aan dieren die bij je passen, met een score en uitleg waarom.' },
      { vraag: 'Wat gebeurt er na een match?', antwoord: 'Je neemt via het platform contact op met het asiel. Het asiel beoordeelt je aanvraag en nodigt je uit voor een kennismaking. Het asiel beslist altijd zelf.' },
      { vraag: 'Krijg ik hulp na de adoptie?', antwoord: 'Ja. Met de 3-3-3 begeleiding krijg je tips voor de eerste dagen, weken en maanden, zodat je dier rustig kan wennen.' },
    ],
  },
  {
    titel: 'Voor asiels',
    items: [
      { vraag: 'Hoe meld ik mijn asiel aan?', antwoord: 'Je maakt een account aan en voert je eerste dieren in. Met de gratis Start-tier kun je meteen beginnen.' },
      { vraag: 'Wat kost het voor asiels?', antwoord: 'Starten is gratis tot vijf actieve dieren. Daarna kies je het Asiel-abonnement (€39 per maand) of, voor Dierenlot-aangesloten asiels, de Netwerk-tier op aanvraag.' },
      { vraag: 'Van wie zijn de gegevens?', antwoord: 'De gegevens van je dieren en adopties blijven van jouw asiel. We verwerken ze alleen om het adoptieproces te laten werken.' },
      { vraag: 'Kan ik overstappen of stoppen?', antwoord: 'Ja. Het maandabonnement is maandelijks opzegbaar en je houdt toegang tot je eigen gegevens.' },
    ],
  },
  {
    titel: 'AI en privacy',
    items: [
      { vraag: 'Wat doet de AI precies?', antwoord: 'De AI ondersteunt bij de intake, stelt een match-score met uitleg voor en geeft nazorg-tips. Beslissingen over adoptie neemt het asiel, niet de AI.' },
      { vraag: 'Hoe gaan jullie om met mijn gegevens?', antwoord: 'We verwerken gegevens conform de AVG en alleen voor het doel van matching en adoptie. We delen ze niet met derden voor andere doeleinden.' },
      { vraag: 'Worden mijn antwoorden gebruikt om de AI te trainen?', antwoord: 'Je intake wordt gebruikt om jouw matches te berekenen. We zetten gegevens niet in voor doeleinden buiten het adoptieproces.' },
    ],
  },
  {
    titel: 'Account en techniek',
    items: [
      { vraag: 'Heb ik een account nodig om rond te kijken?', antwoord: 'Nee. Je kunt de website en het aanbod bekijken zonder account. Voor een aanvraag maak je wel een account aan.' },
      { vraag: 'Op welke apparaten werkt het?', antwoord: 'PootGelukkig werkt in de browser op telefoon, tablet en computer. De adoptant-app is ontworpen voor mobiel gebruik.' },
    ],
  },
]

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROEPEN.flatMap((g) =>
      g.items.map((i) => ({
        '@type': 'Question',
        name: i.vraag,
        acceptedAnswer: { '@type': 'Answer', text: i.antwoord },
      })),
    ),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Section className="!pb-10">
        <div className="max-w-2xl">
          <Eyebrow>Veelgestelde vragen</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Antwoorden op je vragen
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
            Staat je vraag er niet bij? Gebruik de assistent rechtsonder of neem contact met ons op.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="space-y-14">
          {GROEPEN.map((groep) => (
            <div key={groep.titel}>
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.14em] text-[#33335c]/40">
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
