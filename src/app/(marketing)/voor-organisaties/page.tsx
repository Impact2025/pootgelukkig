import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, FeatureCard, ButtonLink, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Voor organisaties — ImpactOS',
  description:
    'ImpactOS structureert intake, dossiers en rapportages voor sociaal ondernemers, welzijnsstichtingen, zorgkwartiermakers en gemeentelijke initiatieven. Minder bureaucratie, meer tijd voor mensen.',
  alternates: { canonical: '/voor-organisaties' },
  openGraph: {
    title: 'Voor organisaties — ImpactOS',
    description: 'Gestructureerde intake, AI-voorbereide rapportages en 24/7 bereikbaarheid voor het sociaal domein.',
    url: '/voor-organisaties',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

const PROBLEM = [
  {
    icon: 'call',
    title: 'De telefoon staat niet stil',
    tekst: 'Tientallen vragen per week van cliënten die iets willen weten dat al ergens beantwoord staat. Je team is behandelaar én receptie tegelijk.',
  },
  {
    icon: 'description',
    title: 'Dossiers en Excel naast elkaar',
    tekst: 'Intake in één systeem, uren in een spreadsheet, communicatie in de mail. Tegen de tijd dat er gerapporteerd moet worden, is niemand meer zeker van de cijfers.',
  },
  {
    icon: 'schedule',
    title: 'Verantwoording kost avonden',
    tekst: 'De jaarlijkse Wmo- of subsidierapportage voelt als reconstrueren in plaats van rapporteren, omdat data het hele jaar versnipperd is bijgehouden.',
  },
]

const FEATURES = [
  {
    icon: 'folder',
    title: 'Dossierbeheer',
    tekst: 'Elk traject als dossier: categorie, status, samenvatting en gekoppelde veldlogs op één centrale plek — geen losse Word- en Excel-bestanden meer.',
  },
  {
    icon: 'person',
    title: 'Cliëntenoverzicht',
    tekst: 'Hulpvraag, contactgegevens en status van elke cliënt overzichtelijk gekoppeld aan hun dossier en begeleiding.',
  },
  {
    icon: 'auto_awesome',
    title: 'AI-collega\'s',
    tekst: 'Sam, Mila, Conny en Bram bereiden concept-subsidieaanvragen, rapportages, communicatie en vrijwilligerswerving voor — jij keurt goed.',
  },
  {
    icon: 'forum',
    title: '24/7 webassistent',
    tekst: '"Samen" beantwoordt veelgestelde vragen van cliënten direct op je website, ook buiten kantooruren.',
  },
  {
    icon: 'bar_chart',
    title: 'Rapportage',
    tekst: 'Live zicht op actieve dossiers, doorlooptijd en afgeronde begeleidingen per categorie — handig voor bestuur én gemeente.',
  },
  {
    icon: 'inbox',
    title: 'Human-in-the-loop wachtrij',
    tekst: 'Elk AI-concept staat klaar in de wachtrij ter goedkeuring. Niets vertrekt automatisch — jij houdt de regie.',
  },
]

const STAPPEN = [
  {
    stap: '1',
    t: 'Meld je organisatie aan',
    d: 'Vul je gegevens in — duurt een minuut. Je krijgt direct toegang tot het platform, zonder verplichtingen.',
  },
  {
    stap: '2',
    t: 'Richt je dossiers in',
    d: 'Zet je eerste dossiers en cliënten op, of laat ze importeren. Binnen een dag staat je organisatie online.',
  },
  {
    stap: '3',
    t: 'Activeer je AI-collega\'s',
    d: 'Zet Sam, Mila, Conny, Bram en Samen aan via AI Rollen. Elk concept dat ze voorbereiden wacht in de wachtrij op jouw goedkeuring.',
  },
]

export default function VoorOrganisatiesPage() {
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ImpactOS',
    alternateName: 'ImpactOS — Platform voor het sociaal domein',
    url: 'https://www.impactos.nl/voor-organisaties',
    description: 'Platform voor sociaal ondernemers en zorgkwartiermakers met AI-collega\'s, dossierbeheer en rapportage.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />

      {/* Hero */}
      <Section className="!pt-16 sm:!pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Voor sociaal ondernemers &amp; zorgkwartiermakers</Eyebrow>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1E293B] sm:text-5xl lg:text-6xl">
              Jouw team loopt over. ImpactOS neemt de bureaucratie over.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#1E293B]/65">
              Voor welzijnsstichtingen, zorgkwartiermakers en gemeentelijke initiatieven die processen
              willen structureren: gestandaardiseerde intake, AI-voorbereide rapportages en 24/7
              bereikbaarheid — terwijl jij altijd de regie houdt.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/voor-organisaties/start" variant="primary" icon="arrow_forward">
                Meld je organisatie gratis aan
              </ButtonLink>
              <ButtonLink href="/contact?onderwerp=demo" variant="ghost">
                Plan een demo
              </ButtonLink>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-[#3B82F6]/20 via-[#1E293B]/5 to-[#2563EB]/15 blur-2xl"
            />
            <div className="overflow-hidden rounded-[1.5rem] border border-[#1E293B]/10 bg-white p-8 shadow-[0_30px_70px_rgba(30,41,59,0.18)]">
              <div className="space-y-3">
                <div className="rounded-2xl bg-[#F8FAFC] px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">Wachtrij</p>
                  <p className="mt-1 text-sm font-semibold text-[#1E293B]">Concept-subsidieaanvraag — Sam</p>
                  <p className="text-xs text-[#1E293B]/40">Wacht op goedkeuring</p>
                </div>
                <div className="rounded-2xl bg-[#F8FAFC] px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">Dossier</p>
                  <p className="mt-1 text-sm font-semibold text-[#1E293B]">Wmo-begeleiding zelfstandig wonen</p>
                  <p className="text-xs text-[#1E293B]/40">Status: actief</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Wat het oplost */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Waarom dit erbij helpt"
          title="Drie pijnen, één platform"
          intro="Niet nóg een systeem erbij. ImpactOS pakt de drie dingen die elke week tijd en energie kosten."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {PROBLEM.map((p) => (
            <FeatureCard key={p.title} icon={p.icon} title={p.title}>
              {p.tekst}
            </FeatureCard>
          ))}
        </div>
      </Section>

      {/* Features */}
      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="Wat je krijgt"
            title="Het platform voor het sociaal domein"
            intro="Alles wat je nodig hebt om processen te structureren — op één plek, zonder dat de AI de beslissing overneemt."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title}>
                {f.tekst}
              </FeatureCard>
            ))}
          </div>
        </Section>
      </div>

      {/* Hoe het werkt */}
      <Section>
        <SectionHeading
          eyebrow="Beginnen is laagdrempelig"
          title="Zo werkt het voor jouw organisatie"
          intro="Binnen een dag staat je organisatie online en richt je de eerste dossiers in."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STAPPEN.map((s) => (
            <div key={s.stap} className="rounded-3xl border border-[#1E293B]/8 bg-[#F8FAFC] p-7">
              <span className="text-sm font-extrabold text-[#2563EB]">Stap {s.stap}</span>
              <h3 className="mt-2 text-lg font-bold text-[#1E293B]">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#1E293B]/65">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Human-in-the-loop pillar */}
      <Section>
        <div className="overflow-hidden rounded-[2rem] bg-[#1E293B] px-8 py-14 text-center sm:px-16">
          <span className="material-symbols-outlined text-5xl text-[#3B82F6]">shield</span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Jij beslist altijd — de AI bereidt alleen voor
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Sam, Mila en Conny leveren concepten: subsidieaanvragen, rapportages, communicatie. Elk
            concept landt in de wachtrij en wacht op een menselijke klik voordat het de deur uitgaat.
            Niets vertrekt autonoom.
          </p>
        </div>
      </Section>

      <CtaBlock
        title="Zie het in je eigen werkweek"
        intro="Meld je gratis aan en richt je eerste dossiers in, of plan een korte demo met het team."
        primary={{ href: '/voor-organisaties/start', label: 'Meld je organisatie gratis aan' }}
        secondary={{ href: '/contact?onderwerp=demo', label: 'Plan een demo' }}
      />

      {/* Kennisbank links */}
      <Section className="!pt-12 !pb-16">
        <SectionHeading
          eyebrow="Verder lezen"
          title="Artikelen voor organisaties"
          intro="Praktische gidsen over subsidies, verantwoording en vrijwilligers."
        />
        <ul className="mt-6 space-y-3 text-[15px]">
          <li>→ <a href="/kennisbank/subsidies/subsidieaanvragen-40-procent-sneller-met-ai" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">Subsidieaanvragen 40% sneller afronden met AI</a></li>
          <li>→ <a href="/kennisbank/verantwoording/verantwoorden-zonder-buikpijn-wmo-rapportages" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">Verantwoorden zonder buikpijn: Wmo-rapportages</a></li>
          <li>→ <a href="/kennisbank/vrijwilligers/vrijwilligers-werven-en-behouden-geluksmonitor" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">Vrijwilligers werven en behouden: de Geluksmonitor</a></li>
        </ul>
      </Section>
    </>
  )
}
