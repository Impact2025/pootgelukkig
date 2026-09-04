import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, ButtonLink, CtaBlock } from '@/components/marketing/ui'
import { FaqAccordion } from '@/components/marketing/FaqAccordion'

export const metadata: Metadata = {
  title: 'Tarieven — ImpactOS',
  description:
    'ImpactOS Compleet vanaf € 950 eenmalig en € 129/maand: Pro CRM, 24/7 Helpdesk, AI-Widget en Agenda-sync, inclusief € 35 AI-tegoed. Ook als Doorbraak Sprint combi-deal of losse modules.',
  alternates: { canonical: '/tarieven' },
  openGraph: {
    title: 'Tarieven — ImpactOS',
    description: 'Pro CRM, 24/7 Helpdesk, AI-Widget en Agenda-sync in één platform, inclusief AI-tegoed.',
    url: '/tarieven',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

const PAKKETTEN = [
  {
    naam: 'ImpactOS Compleet',
    subtitel: 'Bestaande website',
    eenmalig: '€ 950',
    maandelijks: '€ 129',
    voor: 'Organisaties die hun huidige website willen behouden',
    features: [
      'Pro CRM',
      '24/7 Helpdesk (AI-webassistent "Samen")',
      'AI-Widget insluitbaar op je bestaande site',
      'Agenda-sync',
      '€ 35 AI-tegoed per maand inbegrepen',
    ],
    cta: { href: '/contact', label: 'Vraag aan' },
    highlight: false,
  },
  {
    naam: 'ImpactOS Compleet',
    subtitel: 'Nieuwe website',
    eenmalig: '€ 1.450',
    maandelijks: '€ 149',
    voor: 'Organisaties die ook een nieuwe website willen',
    features: [
      'Alles uit "Bestaande Website"',
      'Nieuwe website in jouw huisstijl',
      'Kennisbank inbegrepen',
      'SEO/AEO-blog voor vindbaarheid',
      '€ 35 AI-tegoed per maand inbegrepen',
    ],
    cta: { href: '/contact', label: 'Vraag aan' },
    highlight: true,
    badge: 'Meest gekozen',
  },
  {
    naam: 'Combi-Deal',
    subtitel: 'Doorbraak Sprint + Setup',
    eenmalig: '€ 2.350',
    eenmaligNote: 'incl. € 350 korting',
    maandelijks: '€ 129',
    voor: 'Organisaties die in één dagdeel volledig ingericht willen zijn',
    features: [
      'Doorbraak Sprint: 1 dagdeel op locatie',
      'Volledige ImpactOS-setup inbegrepen',
      'Team traint meteen mee in het platform',
      '€ 35 AI-tegoed per maand inbegrepen',
    ],
    cta: { href: '/contact?onderwerp=doorbraak-sprint', label: 'Plan de Doorbraak Sprint' },
    highlight: false,
  },
]

const MODULES = [
  { naam: 'Digital Core', prijs: '€ 79', periode: '/mnd', omschrijving: 'De basis: dossiers, cliënten en begeleidingen in één centraal systeem.' },
  { naam: 'AI-Widget', prijs: '€ 25', periode: '/mnd', omschrijving: '24/7 webassistent "Samen", insluitbaar op elke website (WordPress, Wix, etc.).' },
  { naam: 'Kenniskluis met Sam & Mila', prijs: '€ 35', periode: '/mnd', omschrijving: 'Subsidie- en rapportage-ondersteuning: concept-aanvragen en Wmo-/SROI-rapportages.' },
  { naam: 'Communicatie met Conny', prijs: 'op aanvraag', periode: '', omschrijving: 'Geanonimiseerde storytelling: LinkedIn-artikelen, nieuwsbrieven en persberichten.' },
  { naam: 'Vrijwilligers met Bram', prijs: 'op aanvraag', periode: '', omschrijving: 'Screening, onboarding en retentie van vrijwilligers en maatjes.' },
]

const TARIEVEN_FAQ = [
  {
    vraag: 'Wat houdt het inbegrepen AI-tegoed van € 35/maand in?',
    antwoord:
      'Elk pakket bevat € 35 AI-tegoed per maand, goed voor circa 15-25 miljoen tokens. Dat dekt het reguliere verbruik van een gemiddelde organisatie voor 100%. Extra verbruik daarboven wordt transparant doorbelast — je ziet je actuele verbruik altijd terug op het dashboard.',
  },
  {
    vraag: 'Hoe zit het met AVG en privacy?',
    antwoord:
      'Al je gegevens worden versleuteld verwerkt binnen de EU. We gebruiken je data nooit om publieke AI-modellen te trainen — jouw dossiers en cliëntgegevens blijven van jou en worden uitsluitend gebruikt om jouw eigen AI-collega\'s te laten functioneren.',
  },
  {
    vraag: 'Wat is het verschil tussen "Bestaande Website" en "Nieuwe Website"?',
    antwoord:
      'Bij "Bestaande Website" koppel je ImpactOS (CRM, Helpdesk, AI-Widget, Agenda-sync) aan je huidige site. Bij "Nieuwe Website" bouwen we ook een nieuwe website in jouw huisstijl, inclusief kennisbank en een SEO/AEO-geoptimaliseerde blog.',
  },
  {
    vraag: 'Kan ik ook losse modules afnemen?',
    antwoord:
      'Ja. Naast de complete pakketten kun je modulair starten met bijvoorbeeld Digital Core, de AI-Widget of de Kenniskluis met Sam & Mila, en later uitbreiden.',
  },
  {
    vraag: 'Wat is een Doorbraak Sprint?',
    antwoord:
      'Een Doorbraak Sprint is één dagdeel op locatie waarin we samen met je team ImpactOS volledig inrichten. Je vertrekt met een werkend platform en gemiddeld 5-10 uur per week structurele tijdwinst.',
  },
]

export default function TarievenPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'ImpactOS Compleet',
    description: 'Pro CRM, 24/7 Helpdesk, AI-Widget en Agenda-sync voor het sociaal domein, inclusief AI-tegoed.',
    offers: [
      { '@type': 'Offer', name: 'ImpactOS Compleet — Bestaande website', price: '129', priceCurrency: 'EUR', description: '€ 950 eenmalig, € 129/maand' },
      { '@type': 'Offer', name: 'ImpactOS Compleet — Nieuwe website', price: '149', priceCurrency: 'EUR', description: '€ 1.450 eenmalig, € 149/maand' },
      { '@type': 'Offer', name: 'Combi-Deal: Doorbraak Sprint + Setup', price: '129', priceCurrency: 'EUR', description: '€ 2.350 eenmalig incl. € 350 korting, € 129/maand' },
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
          <Eyebrow>Tarieven</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1E293B] sm:text-5xl">
            Eén platform, transparante prijzen
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#1E293B]/65">
            ImpactOS Compleet combineert een Pro CRM, 24/7 Helpdesk, AI-Widget en Agenda-sync in één
            abonnement — inclusief € 35 AI-tegoed per maand. Kies je pakket, of stel je eigen combinatie
            samen met losse modules.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-6 lg:grid-cols-3">
          {PAKKETTEN.map((pakket) => (
            <div
              key={`${pakket.naam}-${pakket.subtitel}`}
              className={`flex flex-col rounded-[2rem] border p-8 ${
                pakket.highlight
                  ? 'border-[#1E293B] bg-[#1E293B] text-white shadow-[0_20px_60px_rgba(30,41,59,0.18)]'
                  : 'border-[#1E293B]/10 bg-white'
              }`}
            >
              {pakket.badge && (
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[#3B82F6] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
                  {pakket.badge}
                </span>
              )}
              <h2 className={`text-sm font-bold uppercase tracking-wide ${pakket.highlight ? 'text-white/60' : 'text-[#1E293B]/45'}`}>
                {pakket.naam}
              </h2>
              <p className={`text-base font-bold ${pakket.highlight ? 'text-white' : 'text-[#1E293B]'}`}>{pakket.subtitel}</p>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-extrabold tracking-tight">{pakket.eenmalig}</span>
                <span className={pakket.highlight ? 'mb-1 text-sm text-white/55' : 'mb-1 text-sm text-[#1E293B]/45'}>eenmalig</span>
              </div>
              {pakket.eenmaligNote && (
                <p className={`text-xs ${pakket.highlight ? 'text-white/55' : 'text-[#1E293B]/45'}`}>{pakket.eenmaligNote}</p>
              )}
              <div className="mt-1 flex items-end gap-1">
                <span className="text-2xl font-extrabold tracking-tight">{pakket.maandelijks}</span>
                <span className={pakket.highlight ? 'mb-0.5 text-sm text-white/55' : 'mb-0.5 text-sm text-[#1E293B]/45'}>/maand</span>
              </div>
              <p className={`mt-3 text-sm font-medium ${pakket.highlight ? 'text-white/70' : 'text-[#1E293B]/60'}`}>{pakket.voor}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {pakket.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className={`material-symbols-outlined mt-0.5 text-[1.1rem] ${pakket.highlight ? 'text-[#3B82F6]' : 'text-[#2563EB]'}`}>
                      check
                    </span>
                    <span className={`text-[15px] ${pakket.highlight ? 'text-white/85' : 'text-[#1E293B]/75'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <ButtonLink href={pakket.cta.href} variant={pakket.highlight ? 'primary' : 'ghost'} className="w-full">
                  {pakket.cta.label}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[#1E293B]/45">
          Genoemde bedragen zijn exclusief btw. Alle pakketten zijn maandelijks opzegbaar.
        </p>
      </Section>

      {/* Losse modules */}
      <div className="bg-white">
        <Section>
          <SectionHeading eyebrow="Modulair opbouwen" title="Of stel je eigen combinatie samen" intro="Liever stap voor stap uitbreiden? Elke module is ook los af te nemen." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {MODULES.map((m) => (
              <div key={m.naam} className="flex items-start justify-between gap-4 rounded-2xl border border-[#1E293B]/8 bg-[#F8FAFC] p-5">
                <div>
                  <p className="font-bold text-[#1E293B]">{m.naam}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1E293B]/60">{m.omschrijving}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-extrabold text-[#2563EB]">{m.prijs}</p>
                  {m.periode && <p className="text-xs text-[#1E293B]/40">{m.periode}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeading center title="Vragen over tarieven" />
        <div className="mx-auto mt-10 max-w-3xl">
          <FaqAccordion items={TARIEVEN_FAQ} />
        </div>
      </Section>

      <CtaBlock
        title="Benieuwd wat ImpactOS voor jouw organisatie doet?"
        intro="Plan een Doorbraak Sprint of vraag een demo aan — we laten zien hoe het in jullie werkweek past."
        primary={{ href: '/contact?onderwerp=doorbraak-sprint', label: 'Plan een Doorbraak Sprint' }}
        secondary={{ href: '/demo-aanvragen', label: 'Bekijk demo / intake' }}
      />
    </>
  )
}
