import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Section, SectionHeading, Eyebrow, FeatureCard, ButtonLink, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Voor asiels — PootGelukkig',
  description:
    'Een dashboard dat asiels tijd geeft: adoptanten vullen zelf hun intake in, jij ziet per aanvraag een match-score met uitleg, en elke adoptant krijgt 100 dagen nazorg. Het asiel beslist altijd.',
  alternates: { canonical: '/voor-asielen' },
  openGraph: {
    title: 'Voor asiels — PootGelukkig',
    description: 'Minder eerste schifting, betere matches, nazorg na adoptie. Het dashboard voor asiels.',
    url: '/voor-asielen',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

const PROBLEM = [
  {
    icon: 'call',
    title: 'De telefoon gaat niet stil',
    tekst: 'Tientallen belletjes per week van mensen die "even willen vragen" of "het formulier niet kunnen vinden". Jullie medewerkers zijn stratenmaker én baliemedewerker tegelijk.',
  },
  {
    icon: 'description',
    title: 'Intake lezen kost avonden',
    tekst: 'Elke aanvraag is een verhaal van een A4\'tje. Twintig aanvragen voor één hond lezen en vergelijken, naast het echte werk met de dieren. De eerste schifting slikt de meeste tijd.',
  },
  {
    icon: 'autorenew',
    title: 'Terugplaatsingen doen pijn',
    tekst: 'Een dier dat na twee weken terugkomt, kost dubbel werk en raakt het team. De eerste weken thuis bepalen of een match blijft.',
  },
]

const FEATURES = [
  {
    icon: 'pets',
    title: 'Dierbeheer',
    tekst: 'Al je dieren op één plek: foto’s, gedragsprofiel en medisch paspoort. Geen losse Excel- of Word-bestanden meer die niemand meer terugvindt.',
  },
  {
    icon: 'insights',
    title: 'AI-matching',
    tekst: 'Per aanvraag zie je een score van 0–100 mét uitleg — woning, energie, gezin, ervaring, alleen-thuis, budget. Je herkent in seconden de kansrijke kandidaten tussen de twintig.',
  },
  {
    icon: 'smart_toy',
    title: 'Copilot',
    tekst: 'De assistent schrijft de dier-samenvatting, de kennismaking-voorbereiding en de dagelijkse briefing voor je. Jij hoeft het niet meer uit te typen.',
  },
  {
    icon: 'forum',
    title: 'Aanvragen en berichten',
    tekst: 'Alle contacten met adoptanten in één inbox, gekoppeld aan het dier. Geen WhatsApp-draadjes of mailtjes meer die zoek raken.',
  },
  {
    icon: 'bar_chart',
    title: 'Statistieken',
    tekst: 'Zie live hoeveel dieren er staan, hoe lang ze gemiddeld wachten en hoeveel er deze maand geplaatst zijn. Handig voor je bestuur én je subsidiegever.',
  },
  {
    icon: 'volunteer_activism',
    title: 'Nazorg',
    tekst: 'Elke adoptant krijgt een 100-dagen begeleiding (3-3-3) met checklists en tips. Minder dieren die na twee weken terugkomen naar het asiel.',
  },
]

const STAPPEN = [
  {
    stap: '1',
    t: 'Meld je asiel aan',
    d: 'Vul je gegevens in — duurt een minuut. Je krijgt direct toegang tot het dashboard, zonder verplichtingen.',
  },
  {
    stap: '2',
    t: 'Voeg dieren toe',
    d: 'Voer ze handmatig in of laat ze importeren. Binnen een dag staat je groep online met foto, profiel en medisch paspoort.',
  },
  {
    stap: '3',
    t: 'Ontvang kansrijke aanvragen',
    d: 'Adoptanten vullen zelf hun intake in en matchen op leefstijl. Jij ziet alleen de matches met een score en een onderbouwing — en beslist.',
  },
]

export default function VoorAsielenPage() {
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PootGelukkig',
    alternateName: 'PootGelukkig — Adoptieplatform voor asiels',
    url: 'https://www.pootgelukkig.nl/voor-asielen',
    description: 'Dashboard voor asiels met AI-matching, Copilot en nazorg.',
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
            <Eyebrow>Voor asiels</Eyebrow>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl lg:text-6xl">
              Je team loopt over. PootGelukkig neemt de eerste schifting over.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#33335c]/65">
              Adoptanten vullen zelf hun intake in. Jij ziet per aanvraag een match-score met
              uitleg, zodat je in seconden ziet welke kandidaten écht bij een dier passen. De
              telefoon wordt rustiger, de intakes lezen zichzelf, en elke adoptant krijgt 100 dagen
              nazorg. Jij blijft altijd beslissen.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/voor-asielen/start" variant="primary" icon="arrow_forward">
                Meld je asiel gratis aan
              </ButtonLink>
              <ButtonLink href="/demo-aanvragen" variant="ghost">
                Plan een demo
              </ButtonLink>
            </div>
          </div>

          {/* Hero visual — echte AI Copilot screenshot */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-[#f8aa25]/20 via-[#33335c]/5 to-[#ee5b2b]/15 blur-2xl"
            />
            <div className="overflow-hidden rounded-[1.5rem] border border-[#33335c]/10 bg-white shadow-[0_30px_70px_rgba(51,51,92,0.18)]">
              <Image
                src="/images/hero/dashboard.png"
                alt="PootGelukkig asiel-dashboard: beschikbare dieren, adoptieverzoeken en AI-matches in één overzicht"
                width={1883}
                height={842}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Wat het oplost */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Waarom dit erbij helpt"
          title="Drie pijnen, één dashboard"
          intro="Niet nóg een systeem erbij. PootGelukkig pakt de drie dingen die elke dag tijd en energie kosten."
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
            title="Het dashboard voor asiels"
            intro="Alles wat je nodig hebt om sneller en zorgvuldiger te matchen — op één plek, zonder dat de AI het oordeel overneemt."
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
          title="Zo werkt het voor jouw asiel"
          intro="Binnen een dag staat je groep online en rol je de eerste aanvragen binnen."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STAPPEN.map((s) => (
            <div key={s.stap} className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
              <span className="text-sm font-extrabold text-[#e39207]">Stap {s.stap}</span>
              <h3 className="mt-2 text-lg font-bold text-[#33335c]">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Eerlijk: net gestart */}
      <div className="bg-white">
        <Section>
          <div className="grid items-center gap-10 rounded-[2rem] border border-[#33335c]/8 bg-[#f9fafb] p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>Nieuw, en dat is een voordeel</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#33335c] sm:text-4xl">
                Je praat direct met de bouwers
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#33335c]/65">
                PootGelukkig is net gelanceerd. Geen eindeloze helpdesk, maar een klein team dat
                zélf met asielen bouwt. Als jij meedoet, vorm je de roadmap: jij geeft aan wat er
                moet veranderen en ziet het terug in de volgende update. Vroege asielen krijgen
                bovendien de voorwaarden die horen bij het begin — niet bij het moment dat we vol
                zitten.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                'Rechtstreeks contact met de bouwers',
                'Jouw feedback stuurt de roadmap',
                'Voorwaarden voor vroege asielen',
                'Gratis starten, geen risico',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-[#33335c]/8 bg-white px-4 py-3"
                >
                  <span className="material-symbols-outlined text-[#e39207]">check_circle</span>
                  <span className="text-sm font-semibold text-[#33335c]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </div>

      {/* Nazorg pillar */}
      <Section>
        <div className="overflow-hidden rounded-[2rem] bg-[#33335c] px-8 py-14 text-center sm:px-16">
          <span className="material-symbols-outlined text-5xl text-[#f8aa25]">volunteer_activism</span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            De eerste 100 dagen bepalen of een match blijft
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Een dier dat na twee weken terugkomt, kost dubbel werk en raakt het team. Daarom krijgt
            elke adoptant bij PootGelukkig een 3-3-3 begeleiding: tips en checklists voor de eerste
            drie dagen, drie weken en drie maanden. Jij ziet in het dashboard of de nazorg is
            voltooid — en grijpt eerder in als het vastloopt.
          </p>
        </div>
      </Section>

      <CtaBlock
        title="Zie het in je eigen werkdag"
        intro="Meld je gratis aan en zet je eerste dieren online, of plan een korte demo met het team."
        primary={{ href: '/voor-asielen/start', label: 'Meld je asiel gratis aan' }}
        secondary={{ href: '/demo-aanvragen', label: 'Plan een demo' }}
      />

      {/* Blog links voor asiels */}
      <Section className="!pt-12 !pb-16">
        <SectionHeading
          eyebrow="Verder lezen"
          title="Artikelen voor asiels"
          intro="Praktische gidsen over werkdruk, matching en digitalisering."
        />
        <ul className="mt-6 space-y-3 text-[15px]">
          <li>→ <Link href="/blog/werkdruk-in-asielen-cijfers-en-5-oplossingen" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Werkdruk in asielen: cijfers en 5 oplossingen</Link> <span className="text-[#33335c]/40">— 7 min lezen</span></li>
          <li>→ <Link href="/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Administratieve lasten 30% verlagen</Link> <span className="text-[#33335c]/40">— 6 min lezen</span></li>
          <li>→ <Link href="/blog/retourpercentage-verlagen-met-3-3-3-nazorgaanpak" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Retourpercentage verlagen met 3-3-3 nazorg</Link> <span className="text-[#33335c]/40">— 5 min lezen</span></li>
          <li>→ <Link href="/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Capaciteitsmanagement in het asiel</Link> <span className="text-[#33335c]/40">— 5 min lezen</span></li>
        </ul>
      </Section>
    </>
  )
}
