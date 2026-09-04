import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, StepItem, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Werkwijze — Zo werkt ImpactOS',
  description:
    'Van intake tot veilige publicatie: zo helpt ImpactOS organisaties in het sociaal domein om processen te structureren, zonder de menselijke beoordeling uit handen te geven.',
  alternates: { canonical: '/werkwijze' },
  openGraph: {
    title: 'Werkwijze — Zo werkt ImpactOS',
    description: 'Van intake tot verantwoording in vier stappen.',
    url: '/werkwijze',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

const STAPPEN = [
  {
    title: 'Slimme intake & kenniskluis',
    tekst:
      'Cliëntgegevens komen binnen via een gestructureerd intakeformulier. Bestaande formulieren en PDF-documenten laad je in de kenniskluis, zodat je AI-collega\'s vanaf dag één met de juiste context werken.',
  },
  {
    title: 'AI-voorbereiding',
    tekst:
      'Sam, Mila en Conny gaan aan de slag met jouw dossier- en projectdata: een concept-subsidieaanvraag, een Wmo-rapportage of een geanonimiseerd verhaal voor social media — volledig voorbereid.',
  },
  {
    title: 'Human-in-the-loop review',
    tekst:
      'Elk concept landt in de wachtrij. Een medewerker leest, past aan waar nodig, en keurt goed of wijst af. Niets vertrekt zonder die menselijke klik.',
  },
  {
    title: 'Veilige publicatie & verantwoording',
    tekst:
      'Na goedkeuring gaat het concept de deur uit: naar de gemeente, de subsidiegever, of live op het web. Elke stap blijft herleidbaar in het dossier voor latere verantwoording.',
  },
]

const ONDER_DE_MOTORKAP = [
  {
    title: 'RAG-lite context',
    tekst: 'Elke AI-collega werkt met actuele data uit jouw eigen dossiers en veldlogs — geen generieke tekst, maar concepten die kloppen met de praktijk.',
  },
  {
    title: 'Modelroutering',
    tekst: 'Lichte taken (triage, screening, de webassistent) lopen via een snel model; complexe schrijf- en analysetaken via een krachtiger model. Jij merkt daar niets van, behalve de snelheid.',
  },
  {
    title: 'Altijd een concept, nooit een besluit',
    tekst: 'De AI beslist niet en verstuurt niet. Ze bereidt voor. De beoordeling en verantwoordelijkheid blijven bij jouw organisatie.',
  },
]

export default function WerkwijzePage() {
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ImpactOS',
    alternateName: 'ImpactOS — Zo werkt de methode',
    url: 'https://www.impactos.nl/werkwijze',
    description: 'Van intake tot verantwoording: hoe ImpactOS werkt.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />
      <Section className="!pb-10">
        <div className="max-w-2xl">
          <Eyebrow>Werkwijze</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1E293B] sm:text-5xl">
            Structuur en snelheid, zonder de controle uit handen te geven
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#1E293B]/65">
            ImpactOS versnelt het voorbereidende werk zonder de zorgvuldigheid uit handen te geven. Dit
            zijn de vier stappen van intake tot verantwoording.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
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
            title="Hoe de AI-collega's werken"
            intro="Drie principes die samen bepalen hoe ImpactOS voorbereidt — en waarom jij altijd de laatste stap zet."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {ONDER_DE_MOTORKAP.map((item) => (
              <div key={item.title} className="rounded-3xl border border-[#1E293B]/8 bg-[#F8FAFC] p-7">
                <h3 className="text-lg font-bold text-[#1E293B]">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#1E293B]/65">{item.tekst}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <CtaBlock
        title="Klaar om te structureren?"
        intro="Plan een Doorbraak Sprint of vraag een demo aan — we laten zien hoe het in jullie werkweek past."
        primary={{ href: '/contact?onderwerp=doorbraak-sprint', label: 'Plan een Doorbraak Sprint' }}
        secondary={{ href: '/faq', label: 'Veelgestelde vragen' }}
      />
    </>
  )
}
