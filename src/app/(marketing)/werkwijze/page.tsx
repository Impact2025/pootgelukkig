import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, StepItem, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Werkwijze — Zo werkt PootGelukkig',
  description:
    'Van intakegesprek tot nazorg: zo helpt PootGelukkig om mens en dier zorgvuldig én snel aan elkaar te koppelen.',
  alternates: { canonical: '/werkwijze' },
  openGraph: {
    title: 'Werkwijze — Zo werkt PootGelukkig',
    description: 'Van intake tot nazorg in vijf stappen.',
    url: '/werkwijze',
    type: 'website',
  },
}

const STAPPEN = [
  {
    title: 'Intakegesprek',
    tekst:
      'Je beantwoordt korte vragen over je woonsituatie, gezinssamenstelling, activiteitsniveau, ervaring en wensen. Dit duurt een paar minuten en bepaalt waar we op matchen.',
  },
  {
    title: 'AI-matching',
    tekst:
      'Je profiel wordt vergeleken met de beschikbare dieren. Harde voorwaarden zoals allergieën filteren we eerst weg, daarna berekenen we een compatibiliteitsscore met een korte uitleg waarom een dier past.',
  },
  {
    title: 'Contact met het asiel',
    tekst:
      'Past een dier? Je neemt contact op via het platform. Het asiel ziet je profiel en de match-score en beoordeelt de aanvraag. De medewerker beslist, altijd.',
  },
  {
    title: 'Adoptie en dossier',
    tekst:
      'Na een geslaagde kennismaking leg je de adoptie vast. Documenten en het medisch paspoort van het dier verzamel je op één plek in je dossier.',
  },
  {
    title: 'Nazorg',
    tekst:
      'De eerste periode is bepalend. Met de 3-3-3 begeleiding krijg je tips voor de eerste drie dagen, drie weken en drie maanden, zodat je dier rustig went aan zijn nieuwe thuis.',
  },
]

const LAGEN = [
  {
    title: 'Harde voorwaarden',
    tekst: 'Allergieën, diersoortvoorkeur en woonsituatie. Past het niet, dan tonen we het dier niet.',
  },
  {
    title: 'Compatibiliteitsscore',
    tekst: 'Een score van 0 tot 100 met een korte, leesbare motivatie waarom een dier bij je past.',
  },
  {
    title: 'Lerende laag',
    tekst: 'Op termijn leert het systeem van geslaagde adopties om matches verder te verbeteren.',
  },
]

export default function WerkwijzePage() {
  return (
    <>
      <Section className="!pb-10">
        <div className="max-w-2xl">
          <Eyebrow>Werkwijze</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Zorgvuldig matchen, sneller dan met de hand
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
            PootGelukkig versnelt het werk zonder de zorgvuldigheid uit handen te geven. Dit zijn de
            stappen van eerste vraag tot een blijvend thuis.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {STAPPEN.map((s, i) => (
            <StepItem key={s.title} step={i + 1} title={s.title}>
              {s.tekst}
            </StepItem>
          ))}
        </div>
      </Section>

      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="Onder de motorkap"
            title="Hoe de matching werkt"
            intro="Drie lagen die samen bepalen welke dieren je te zien krijgt en waarom."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {LAGEN.map((laag) => (
              <div key={laag.title} className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
                <h3 className="text-lg font-bold text-[#33335c]">{laag.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">{laag.tekst}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <CtaBlock
        title="Klaar voor je eerste match?"
        intro="Het intakegesprek duurt een paar minuten en is volledig gratis."
        primary={{ href: '/intake', label: 'Start de intake' }}
        secondary={{ href: '/faq', label: 'Veelgestelde vragen' }}
      />
    </>
  )
}
