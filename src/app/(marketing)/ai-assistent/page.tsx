import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, FeatureCard, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'AI-assistent — PootGelukkig',
  description:
    'Een AI-assistent die adoptanten helpt met vragen en asiels ondersteunt bij intake, matchanalyse en nazorg. Transparant, met de mens aan het stuur.',
  alternates: { canonical: '/ai-assistent' },
  openGraph: {
    title: 'AI-assistent — PootGelukkig',
    description: 'Slimme ondersteuning die het oordeel nooit overneemt.',
    url: '/ai-assistent',
    type: 'website',
  },
}

export default function AiAssistentPage() {
  return (
    <>
      <Section className="!pb-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>AI-assistent</Eyebrow>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
              Slim waar het kan, menselijk waar het moet
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
              De assistent helpt adoptanten met vragen over het adoptieproces en ondersteunt asiels
              met intake, matchanalyse en nazorg-tips. Hij doet het voorwerk; de mens beslist.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[#33335c]/8 bg-white p-6 shadow-[0_10px_40px_rgba(51,51,92,0.07)]">
            <div className="space-y-3">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-[#33335c] px-4 py-3 text-sm text-white">
                Hoe verloopt het adoptieproces?
              </div>
              <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-[#f9fafb] px-4 py-3 text-sm text-[#33335c]/80">
                In het kort: je doet de intake, je krijgt passende dieren te zien, je dient een
                aanvraag in en het asiel nodigt je uit voor een kennismaking. Zal ik je naar de
                intake brengen?
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-[#33335c]/40">
              Gebruik de assistent rechtsonder op elke pagina.
            </p>
          </div>
        </div>
      </Section>

      <Section className="!pt-4">
        <SectionHeading eyebrow="Wat de assistent doet" title="Ondersteuning op drie momenten" />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <FeatureCard icon="quiz" title="Tijdens de intake">
            Beantwoordt vragen en helpt adoptanten het profiel zorgvuldig en eerlijk in te vullen.
          </FeatureCard>
          <FeatureCard icon="insights" title="Bij de matchanalyse">
            Legt in begrijpelijke taal uit waarom een dier wel of niet bij iemand past.
          </FeatureCard>
          <FeatureCard icon="volunteer_activism" title="In de nazorg">
            Geeft praktische tips voor de eerste dagen, weken en maanden na de adoptie.
          </FeatureCard>
        </div>
      </Section>

      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="Transparantie"
            title="Wat de AI wel en niet doet"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
              <h3 className="text-lg font-bold text-[#33335c]">Wel</h3>
              <ul className="mt-4 space-y-3">
                {[
                  'Vragen beantwoorden en uitleg geven',
                  'Een match-score met motivatie voorstellen',
                  'Het asiel tijd besparen op het voorwerk',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined mt-0.5 text-[1.1rem] text-[#e39207]">check</span>
                    <span className="text-[15px] text-[#33335c]/75">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
              <h3 className="text-lg font-bold text-[#33335c]">Niet</h3>
              <ul className="mt-4 space-y-3">
                {[
                  'Beslissen wie een dier mag adopteren',
                  'Het oordeel van de medewerker vervangen',
                  'Gegevens delen buiten het adoptieproces om',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined mt-0.5 text-[1.1rem] text-[#33335c]/40">close</span>
                    <span className="text-[15px] text-[#33335c]/75">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      </div>

      <CtaBlock
        title="Probeer de assistent zelf"
        intro="Stel je vraag via de assistent rechtsonder, of start direct met de intake."
        primary={{ href: '/intake', label: 'Start de intake' }}
        secondary={{ href: '/faq', label: 'Veelgestelde vragen' }}
      />
    </>
  )
}
