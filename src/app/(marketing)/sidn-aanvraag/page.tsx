import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Section,
  SectionHeading,
  Eyebrow,
  FeatureCard,
  CtaBlock,
  ButtonLink,
} from '@/components/marketing/ui'
import { PrintButton } from '@/components/marketing/PrintButton'

export const metadata: Metadata = {
  title: 'Aanvraag SIDN Fonds — PootGelukkig',
  description:
    'PootGelukkig: verantwoorde, mens-gestuurde AI die asieldieren sneller een thuis geeft. Aanvraag Pioniersbijdrage SIDN fonds.',
  alternates: { canonical: '/sidn-aanvraag' },
  openGraph: {
    title: 'Aanvraag SIDN Fonds — PootGelukkig',
    description:
      'Responsible AI in de praktijk: een open matchingmethode en digitaal werkplatform voor de hele asielsector.',
    url: '/sidn-aanvraag',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

/* ── Lokale helpers ─────────────────────────────────────────────────────── */

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#33335c]/8 bg-white p-5">
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#ee5b2b]">
        {label}
      </dt>
      <dd className="mt-1.5 text-[15px] font-semibold leading-snug text-[#33335c]">
        {value}
      </dd>
    </div>
  )
}

function TimelineItem({
  period,
  title,
  children,
}: {
  period: string
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="relative border-l-2 border-[#f8aa25]/40 pb-10 pl-8 last:pb-0">
      <span className="absolute -left-[9px] top-1 size-4 rounded-full bg-[#f8aa25] ring-4 ring-[#f9fafb]" />
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#33335c]/45">
        {period}
      </p>
      <h4 className="mt-1 text-lg font-bold text-[#33335c]">{title}</h4>
      <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">{children}</p>
    </li>
  )
}

function Table({
  head,
  children,
  caption,
}: {
  head: string[]
  children: React.ReactNode
  caption?: string
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#33335c]/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b-2 border-[#33335c]/10 bg-[#f9fafb]">
              {head.map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[#33335c]/50 ${
                    i === head.length - 1 ? 'text-right' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {caption && (
        <p className="border-t border-[#33335c]/8 bg-[#f9fafb] px-5 py-3 text-xs text-[#33335c]/45">
          {caption}
        </p>
      )}
    </div>
  )
}

/* ── Pagina ─────────────────────────────────────────────────────────────── */

export default function SidnAanvraagPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Aanvraag SIDN Fonds — PootGelukkig (Pioniers)',
    author: { '@type': 'Organization', name: 'WeAreImpact' },
    datePublished: '2026-07-01',
    about: 'Responsible AI voor de asielsector',
  }

  return (
    <div className="print-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <Section className="!pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Eyebrow>Aanvraag · SIDN Fonds · Pioniers</Eyebrow>
          <div className="no-print">
            <PrintButton />
          </div>
        </div>

        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-[#33335c] sm:text-5xl">
          Verantwoorde AI die asieldieren sneller een thuis geeft
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#33335c]/70">
          Een open, mens-gestuurde matchingmethode en digitaal werkplatform voor de
          hele asielsector.
        </p>

        {/* Kerngegevens */}
        <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact
            label="Aanvrager"
            value={
              <>
                WeAreImpact
                <span className="block text-[13px] font-normal text-[#33335c]/55">
                  Vincent van Munster, directeur-bestuurder
                </span>
              </>
            }
          />
          <Fact
            label="Idee & Concept"
            value={
              <>
                Maya van Munster
                <span className="block text-[13px] font-normal text-[#33335c]/55">
                  13 jaar, 3 vwo — bedenker van PootGelukkig
                </span>
              </>
            }
          />
          <Fact
            label="Partner"
            value="Stichting Dierenlot + vijf pilot-asiels"
          />
          <Fact
            label="Gevraagd bedrag"
            value={
              <>
                Maximaal € 10.000
                <span className="block text-[13px] font-normal text-[#33335c]/55">
                  Pioniers
                </span>
              </>
            }
          />
          <Fact
            label="Looptijd"
            value="6 maanden · pilotstart november 2026"
          />
          <Fact
            label="Thema-aansluiting"
            value="Responsible AI & digitale gemeenschapsgoederen"
          />
        </dl>

        {/* In het kort */}
        <div className="mt-10 rounded-3xl border-l-4 border-[#f8aa25] bg-[#f8aa25]/[0.06] p-6 sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#e39207]">
            In het kort
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/75">
            De techniek staat, de partner is enthousiast en de pilot staat klaar. De
            bijdrage van SIDN fonds gaat daarom niet naar softwarebouw, maar
            volledig naar de innovatieve pilot, een onafhankelijke effectmeting en
            een open methodiek die de hele sector mag gebruiken.
          </p>
        </div>
      </Section>

      {/* 1. SAMENVATTING */}
      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="1 · Samenvatting"
            title="Van keukentafelvraag naar startklare pilot"
          />
          <div className="mt-8 max-w-2xl space-y-5 text-[15px] leading-relaxed text-[#33335c]/75">
            <p>
              PootGelukkig is een digitaal platform dat asieldieren koppelt aan de
              best passende adoptant, op basis van leefstijl in plaats van uiterlijk.
              Het begon in januari 2026, toen Maya van Munster (13 jaar, 3 vwo) online
              las dat er door toenemende verwaarlozing en inbeslagnames steeds meer
              huisdieren in asiels belanden. Haar vraag aan haar vader was simpel:{' '}
              <em>papa, kunnen we niet samen een app bouwen om hier iets aan te doen?</em>{' '}
              Samen met klasgenoten en een ouder die als vrijwilliger in een dierenasiel
              werkt, is dat idee uitgewerkt en gebouwd tot een werkend platform.
            </p>
            <p>
              Na goede gesprekken is Stichting Dierenlot, de koepel van circa 300
              Nederlandse asiels, enthousiast geworden en in het eigen netwerk op zoek
              gegaan naar geschikte asiels. Die zijn gevonden: vijf asiels willen
              meedoen. Het platform is inmiddels voor ongeveer negentig procent gereed.
              Met de benodigde financiering kunnen de pilots in november 2026 van start.
            </p>
            <p>
              Met deze aanvraag vragen we geen geld voor het bouwen van software. Dat
              draagt WeAreImpact zelf. We vragen steun om de pilot verantwoord uit te
              voeren, onafhankelijk te meten wat het effect is, en de methode en
              resultaten open te delen met de hele asielsector. Zo wordt een privaat
              gebouwd platform ingezet als publiek leerproject over hoe je AI op een
              betrouwbare, mens-gestuurde manier inzet voor een maatschappelijk probleem.
            </p>
            <p>
              <strong className="text-[#33335c]">De kern voor SIDN fonds:</strong> Dit
              is Responsible AI in de praktijk. De AI adviseert, de asielmedewerker
              beslist altijd. De methode is transparant en uitlegbaar, en we maken de
              kennis vrij beschikbaar als digitaal gemeenschapsgoed. Bovendien sluit het
              aan op de nieuwe EU-regels rond onderling uitwisselbare registratie, in
              een sector die vandaag nog geen gedeelde digitale standaard kent.
            </p>
          </div>
        </Section>
      </div>

      {/* 2. MAATSCHAPPELIJK PROBLEEM */}
      <Section>
        <SectionHeading
          eyebrow="2 · Het maatschappelijke probleem"
          title="Een sector onder druk, een datagebrek en een wettelijke kans"
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <FeatureCard icon="warning" title="2.1 Een sector onder druk">
            <p>
              Nederlandse dierenasiels staan structureel onder druk. Volgens de koepel
              kampen asiels met volle opvang, hoge dierenartskosten en een tekort aan
              vrijwilligers, terwijl voer, energie en medische zorg blijven stijgen. De
              instroom neemt toe: een meerderheid van de dierenhulporganisaties meldt
              voor het tweede jaar op rij een stijging van afstands- en gedumpte dieren.
              De Dierenbescherming alleen al ving in 2024 ruim 24.500 dieren op.
            </p>
            <p className="mt-3">
              Het personeelstekort is sinds corona structureel, terwijl de opgevangen
              dieren complexer worden. Veel asiels werken nog met verouderde,
              versnipperde systemen en papier. Er is geen landelijke, gedeelde digitale
              standaard voor intake, dossier en matching. Het gevolg: matches komen nog
              te vaak op uiterlijk tot stand, verblijfstijden lopen op en een deel van de
              adopties mislukt en keert terug.
            </p>
          </FeatureCard>

          <FeatureCard icon="database" title="2.2 Een structureel datagebrek">
            <p>
              Onder deze druk ligt een dieperliggend, digitaal probleem: niemand weet
              precies hoeveel dieren er jaarlijks binnenkomen. Schattingen lopen uiteen
              van 35.000 tot 100.000 dieren per jaar, simpelweg omdat een landelijke,
              verplichte registratie ontbreekt. Dat maakt sturing, verantwoording en
              beleid lastig.
            </p>
            <p className="mt-3">
              Het is bij uitstek een probleem waar een gedeelde, betrouwbare digitale
              infrastructuur het verschil kan maken.
            </p>
          </FeatureCard>

          <FeatureCard icon="gavel" title="2.3 Regelgeving als kans">
            <p>
              Nederland werkt aan een chip- en registratieplicht voor katten, en in
              april 2026 nam het Europees Parlement de eerste EU-verordening aan die
              honden en katten beschermt. Die verplicht identificatie met een microchip
              en registratie in onderling uitwisselbare nationale databases, en benoemt
              asiels expliciet als partij die dieren moet registreren voordat ze naar een
              nieuwe eigenaar gaan.
            </p>
            <p className="mt-3">
              Een systeem dat de registratie op het adoptiemoment standaardiseert,
              helpt asiels om vooraf compliant te zijn. Ter illustratie: jaarlijks raken
              naar schatting meer dan 60.000 katten zoek, en zonder chip of kloppende
              registratie kan ruim tachtig procent niet met het baasje worden herenigd.
              Bij honden, die al een chipplicht kennen, keert meer dan negentig procent
              terug.
            </p>
          </FeatureCard>
        </div>
      </Section>

      {/* 3. VAN IDEE NAAR PILOT */}
      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="3 · Van idee naar startklare pilot"
            title="90% afgebouwd — de euro gaat naar de pilot, niet naar code"
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <ul className="space-y-0">
              <TimelineItem period="Januari 2026" title="Het idee ontstaat">
                Maya leest over de toenemende verwaarlozing en inbeslagnames en het
                groeiende aantal dieren in asiels, en vraagt haar vader om er samen
                iets aan te bouwen.
              </TimelineItem>
              <TimelineItem period="Voorjaar 2026" title="Bouwen met de praktijk">
                Samen met klasgenoten en een ouder die als asielvrijwilliger de praktijk
                kent, wordt het idee uitgewerkt en gebouwd. WeAreImpact brengt de
                professionele slagkracht.
              </TimelineItem>
              <TimelineItem period="Zomer 2026" title="Dierenlot stapt in">
                Na goede gesprekken is de koepel enthousiast geworden en actief op zoek
                gegaan naar asiels om mee te starten.
              </TimelineItem>
              <TimelineItem period="Status Quo" title="Klaar voor de start">
                Vijf aangesloten asiels willen de pilot draaien. Het platform is voor
                ongeveer negentig procent gereed — inclusief vier gescheiden portalen,
                mobiele apps en een complete beheerstack.
              </TimelineItem>
            </ul>

            <div className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
              <h3 className="text-lg font-bold text-[#33335c]">Waarom dit sterk is</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#33335c]/70">
                Dat de techniek al staat en de partner en pilot-asiels klaarstaan, is
                bewust een sterk punt van deze aanvraag. Het betekent dat elke euro van
                SIDN fonds naar de pilot, de meting en de open kennisdeling gaat, en niet
                naar softwareontwikkeling van een enkel bedrijf.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-5 text-center">
                  <p className="text-3xl font-extrabold text-[#f8aa25]">~90%</p>
                  <p className="mt-1 text-xs font-semibold text-[#33335c]/55">
                    Platform gereed
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 text-center">
                  <p className="text-3xl font-extrabold text-[#ee5b2b]">5</p>
                  <p className="mt-1 text-xs font-semibold text-[#33335c]/55">
                    Pilot-asiels klaar
                  </p>
                </div>
              </div>
              <p className="mt-6 text-[15px] leading-relaxed text-[#33335c]/70">
                <strong className="text-[#33335c]">Planning:</strong> Met de benodigde
                financiering kunnen de pilots in november 2026 van start.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* 4. PIONIERSPROJECT */}
      <Section>
        <SectionHeading
          eyebrow="4 · Waarom dit een pioniersproject is"
          title="Verantwoorde AI, cross-species matching en een gedeeld goed"
        />

        {/* 4.1 Content Queue + 8 AI-collega's */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <FeatureCard icon="psychology" title="4.1 Mens-gestuurde AI & de Content Queue">
            <p>
              PootGelukkig laat zien hoe AI in een gevoelige, publieke context
              betrouwbaar kan werken. De AI berekent een advies, maar de
              asielmedewerker beslist altijd. De adoptant ziet enkel een bevestiging dat
              het profiel is doorgestuurd; de volledige analyse is alleen zichtbaar voor
              het asiel.
            </p>
            <p className="mt-3">
              Er is geen black box: we leggen uit wat de AI wel en niet doet, we werken
              met dataminimalisatie waarbij het data-eigendom bij het asiel ligt, en alle
              AI-tokenkosten worden transparant per call in euro&apos;s geregistreerd.
            </p>
          </FeatureCard>

          <FeatureCard icon="group" title="De 8 AI-collega's voor arbeidsverlichting">
            <p>
              Om de werkdruk in asielen te verlagen, bevat het systeem 8 gespecialiseerde
              AI-rollen. Belangrijk voor de ethiek:{' '}
              <strong className="text-[#33335c]">
                alle output landt verplicht in een menselijke Content Queue
              </strong>
              . Een medewerker moet de suggesties altijd accorderen voordat ze worden
              verzonden of gepubliceerd.
            </p>
          </FeatureCard>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-[#33335c]/8 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b-2 border-[#33335c]/10 bg-[#f9fafb]">
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[#33335c]/50">
                    AI-collega
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[#33335c]/50">
                    Rol
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[#33335c]/50">
                    Taak binnen het asiel
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Conny', 'Social', 'Posts, nieuwsbrieven, analyse van adoptieverhalen'],
                  ['Sam', 'Fundraising', 'Donatie-appeals, gesegmenteerde e-mails, sponsorvoorstellen'],
                  ['Bram', 'Vrijwilligers', 'Vacatureteksten, sollicitaties screenen, onboarding'],
                  ['Eva', 'Evenementen', 'Adoptiedagen plannen en promotie verzorgen'],
                  ['Dokter', 'Medisch', 'Medische rapportages en tijdlijnen structureren'],
                  ['Finn', 'Foto/Content', 'Fotosuggesties en beeldanalyse van dierfoto’s'],
                  ['Mila', 'Rapportage', 'Geautomatiseerde maandrapportages voor het bestuur'],
                  ['Samen', 'Chat', '24/7 support voor bezoekers en vrijwilligers'],
                ].map(([naam, rol, taak], i) => (
                  <tr
                    key={naam}
                    className={i % 2 ? 'bg-[#f9fafb]/60' : ''}
                  >
                    <td className="px-5 py-3.5 font-bold text-[#33335c]">{naam}</td>
                    <td className="px-5 py-3.5 text-[#33335c]/70">{rol}</td>
                    <td className="px-5 py-3.5 text-[#33335c]/70">{taak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FeatureCard icon="pets" title="4.2 Nieuw: cross-species matching">
            <p>
              Uniek is dat de intake niet vastzit aan een diersoort. Past de leefstijl
              van een gezin niet bij een hond, maar wel bij een kat of een ander dier,
              dan suggereert het systeem dat proactief. Dat vergroot de kans op een
              duurzame plaatsing en opent deuren voor dieren die anders lang blijven
              zitten. Deze benadering bestaat nog niet in de Nederlandse asielsector.
            </p>
          </FeatureCard>

          <FeatureCard icon="hub" title="4.3 Een gedeeld digitaal goed">
            <p>
              De sector mist een gemeenschappelijke digitale standaard, terwijl de nieuwe
              EU-regels juist om onderling uitwisselbare registratie vragen. In dit
              project ontwikkelen we een open beschrijving van de matchingmethode, de
              gestandaardiseerde gedragsscore, en de herbruikbare werkinstructies/prompts
              van de AI-collega&apos;s. Zo is de kennis herbruikbaar voor elk asiel, ook
              buiten ons eigen platform. Dat maakt het een digitaal gemeenschapsgoed, en
              niet het bezit van een enkel bedrijf.
            </p>
          </FeatureCard>
        </div>
      </Section>

      {/* 5. BESTEDING */}
      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="5 · Waar de bijdrage aan besteed wordt"
            title="Volledig naar publieke waarde — geen cent aan softwarebouw"
          />
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#33335c]/65">
            De Pioniersbijdrage is volledig gericht op onderdelen die publieke waarde
            opleveren en die passen bij wat SIDN fonds financiert. We vragen nadrukkelijk
            geen bijdrage voor softwarebouw, hosting, exploitatie of salarissen. Die
            draagt WeAreImpact zelf, en op termijn het eigen verdienmodel van het
            platform.
          </p>

          <div className="mt-8">
            <Table head={['Onderdeel', 'Wat we doen', 'Bedrag']}>
              {[
                [
                  'Onafhankelijke effectmeting',
                  'Meten van verblijfsduur, matchkwaliteit en tevredenheid, met een nul- en eindmeting',
                  '€ 3.000,-',
                ],
                [
                  'Open methodiek en toolkit',
                  'Publiceerbare beschrijving van de mens-gestuurde matching, gedragsscore en AI-prompts, herbruikbaar voor de sector',
                  '€ 2.500,-',
                ],
                [
                  'Kennisdeling en verspreiding',
                  'Openbare sessies, een webinar met de sector, publicatie van de resultaten en een open kennisbank',
                  '€ 2.000,-',
                ],
                [
                  'Begeleiding vijf pilot-asiels',
                  'Projectgebonden onboarding en begeleiding gedurende het pilottraject op de werkvloer',
                  '€ 2.000,-',
                ],
              ].map(([o, w, b], i) => (
                <tr key={o} className={i % 2 ? 'bg-[#f9fafb]/60' : ''}>
                  <td className="px-5 py-4 align-top font-bold text-[#33335c]">{o}</td>
                  <td className="px-5 py-4 align-top text-[#33335c]/70">{w}</td>
                  <td className="px-5 py-4 text-right align-top font-bold text-[#33335c]">
                    {b}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#33335c]/15 bg-[#f8aa25]/[0.08]">
                <td
                  colSpan={2}
                  className="px-5 py-4 font-extrabold text-[#33335c]"
                >
                  TOTAAL GEVRAAGD
                </td>
                <td className="px-5 py-4 text-right font-extrabold text-[#33335c]">
                  € 9.500,-
                </td>
              </tr>
            </Table>
            <p className="mt-4 text-[15px] leading-relaxed text-[#33335c]/65">
              WeAreImpact brengt de bouw en de technische begeleiding in als eigen
              investering, met een geschatte marktwaarde van rond de € 64.000. De gevraagde
              bijdrage staat daarmee in gezonde verhouding tot de eigen inbreng.
            </p>
          </div>
        </Section>
      </div>

      {/* 6. MEERWAARDE */}
      <Section>
        <SectionHeading
          eyebrow="6 · Maatschappelijke meerwaarde"
          title="Wie profiteert er — en hoe?"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon="pets" title="De dieren">
            Sneller een passend en duurzaam thuis, minder tijd in het asiel, minder
            terugplaatsingen.
          </FeatureCard>
          <FeatureCard icon="volunteer_activism" title="De asiels">
            Minder werkdruk door slimmere intake en minder mislukte adopties, en toegang
            tot een open werkwijze.
          </FeatureCard>
          <FeatureCard icon="diversity_1" title="De adoptanten">
            Een eerlijke, begrijpelijke match en een goede voorbereiding op het dier.
          </FeatureCard>
          <FeatureCard icon="public" title="De sector als geheel">
            Een openbaar voorbeeld van hoe verantwoorde AI en een gedeelde digitale
            methode het herplaatsen kunnen verbeteren.
          </FeatureCard>
        </div>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[#33335c]/65">
          De resultaten van de pilot en de methodiek maken we vrij beschikbaar, zodat ook
          asiels die niet met ons platform werken ervan kunnen leren.
        </p>
      </Section>

      {/* 7. KENISDELING */}
      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="7 · Kennisdeling en openheid"
            title="Actief kennis delen, als voorwaarde én overtuiging"
          />
          <ul className="mt-8 max-w-2xl space-y-4">
            {[
              'Een openbaar eindrapport met de meetresultaten van de pilot, ook bruikbaar voor de jaarverslaggeving van Dierenlot.',
              'Een open methodiek-document over de mens-gestuurde matching, gedragsscore en AI-sjablonen, herbruikbaar door andere asiels en initiatieven.',
              'Een publieke kennisbankpagina die uitlegt wat de AI wel en niet doet, gericht op vertrouwen bij asiels en adoptanten.',
              'Een kennissessie of webinar met de sector, in samenwerking met Dierenlot, om de lessen te verspreiden.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[#33335c]/75">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f8aa25]/15 text-[#e39207]">
                  <span className="material-symbols-outlined text-[1.05rem]">check</span>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* 8. VOORTBESTAAN */}
      <Section>
        <SectionHeading
          eyebrow="8 · Voortbestaan na de financiering"
          title="Een eenmalige impuls, geen structurele kostenpost"
        />
        <div className="mt-8 max-w-2xl space-y-5 text-[15px] leading-relaxed text-[#33335c]/75">
          <p>
            SIDN fonds vraagt terecht of een project ook na de financieringsperiode kan
            blijven bestaan. Voor PootGelukkig is dat geen open vraag. Er ligt een
            uitgewerkt verdienmodel dat het platform zelfstandig draaiende houdt, zonder
            afhankelijkheid van structurele subsidie.
          </p>
          <p>
            De kern daarvan: asiels zijn donatie-afhankelijk en betalen niet of nauwelijks.
            De inkomsten komen uit het adoptiemoment zelf, via optionele
            partneraanbiedingen voor de nieuwe eigenaar en een vaste merkpartner,
            aangevuld met een bescheiden abonnement voor asiels die meer willen. Zo blijft
            het platform gratis of goedkoop voor asiels en draait het toch op eigen benen.
            De Pioniersbijdrage is dus een eenmalige impuls voor de pilot en de
            kennisdeling.
          </p>
          <p>
            De bijdrage van SIDN fonds financiert een bounded, openbaar leerproject. Het
            platform zelf houdt zichzelf daarna in stand via een eigen verdienmodel.
            Precies de duurzaamheid die het fonds zoekt.
          </p>
        </div>
      </Section>

      {/* 9. TEAM */}
      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="9 · Team en samenwerking"
            title="Jeugdig initiatief, uitvoeringskracht en sectorkennis"
          />
          <div className="mt-8">
            <Table head={['Rol', 'Wie', 'Bijdrage']}>
              {[
                ['Bedenker', 'Maya van Munster', 'Oorspronkelijke idee en het perspectief van een nieuwe generatie'],
                ['Uitvoering en techniek', 'Vincent van Munster (WeAreImpact)', 'Bouw, projectleiding, bestuurlijke en juridische borging'],
                ['Sectorpartner', 'Stichting Dierenlot', 'Toegang tot het netwerk, sectorkennis, verspreiding van resultaten'],
                ['Praktijk', 'Vijf pilot-asiels', 'De dagelijkse realiteit, testen en feedback'],
              ].map(([rol, wie, bij], i) => (
                <tr key={rol} className={i % 2 ? 'bg-[#f9fafb]/60' : ''}>
                  <td className="px-5 py-4 align-top font-bold text-[#33335c]">{rol}</td>
                  <td className="px-5 py-4 align-top text-[#33335c]">{wie}</td>
                  <td className="px-5 py-4 align-top text-[#33335c]/70">{bij}</td>
                </tr>
              ))}
            </Table>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#33335c]/65">
              Het team is intergenerationeel en verbindt techniek met praktijk: een jonge
              bedenker, klasgenoten, een asielvrijwilliger die de dagelijkse realiteit
              kent, en een ervaren uitvoeringspartner.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
              <h3 className="text-lg font-bold text-[#33335c]">9.1 Over WeAreImpact</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#33335c]/70">
                WeAreImpact is de impactorganisatie die PootGelukkig bouwt en draagt. Ze
                combineert technologische kennis met een missiegedreven aanpak en verzorgt
                de ontwikkeling, de projectleiding en de bestuurlijke en juridische
                borging, waaronder privacy en AVG. WeAreImpact brengt de bouw in als eigen
                investering, zodat de gevraagde bijdrage volledig naar publieke waarde gaat.
              </p>
            </div>
            <div className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
              <h3 className="text-lg font-bold text-[#33335c]">
                9.2 Over Stichting Dierenlot
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#33335c]/70">
                Stichting Dierenlot is een erkende, CBF-gecertificeerde koepelorganisatie
                die zich inzet voor dierenhulp in Nederland en samenwerkt met een groot
                aantal lokale asiels en dierenambulances. Voor dit project is Dierenlot de
                schakel naar de sector: zij is enthousiast, heeft in haar netwerk de
                pilot-asiels gevonden en helpt straks de resultaten en de opgedane kennis
                breed te verspreiden.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* 10. PLANNING */}
      <Section>
        <SectionHeading
          eyebrow="10 · Planning binnen zes maanden"
          title="Van nulmeting naar open publicatie"
        />
        <div className="mt-8">
          <Table head={['Periode', 'Activiteiten', 'Resultaat']}>
            {[
              [
                'November 2026',
                'Laatste tien procent afronden, vijf asiels onboarden, nulmeting opzetten',
                'Werkend platform, meetbaar startpunt',
              ],
              [
                'December 2026 – februari 2027',
                'Pilot live, matching actief, wekelijkse check-ins, data verzamelen',
                'Eerste matches en adopties, praktijkdata',
              ],
              [
                'Maart 2027',
                'Analyse, methodiek en open AI-toolkit opstellen',
                'Concept-resultaten en open methodiek',
              ],
              [
                'April 2027',
                'Kennissessie/webinar, openbare publicatie, eindrapport en advies opschaling',
                'Gedeelde kennis en go of no-go',
              ],
            ].map(([p, a, r], i) => (
              <tr key={p} className={i % 2 ? 'bg-[#f9fafb]/60' : ''}>
                <td className="px-5 py-4 align-top font-bold text-[#33335c]">{p}</td>
                <td className="px-5 py-4 align-top text-[#33335c]/70">{a}</td>
                <td className="px-5 py-4 align-top text-[#33335c]/70">{r}</td>
              </tr>
            ))}
          </Table>
        </div>
      </Section>

      {/* 11. RISICO'S */}
      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="11 · Risico's en mitigatie"
            title="Wat we zien aankomen — en hoe we het opvangen"
          />
          <div className="mt-8">
            <Table head={['Risico', 'Impact', 'Mitigatie']}>
              {[
                ['Te weinig adoptanten in pilotregio', 'Midden', 'Gerichte lokale werving samen met de vijf asiels en Dierenlot.'],
                ['Matchkwaliteit voldoet nog niet', 'Hoog', 'Menselijke validatie blijft leidend, AI adviseert, verplichte goedkeuring via Content Queue, wekelijks bijsturen.'],
                ['Privacyzorgen bij data', 'Hoog', 'Dataminimalisatie, verwerkersovereenkomst, data-eigendom blijft 100% bij het asiel.'],
                ['Perceptie van commercie', 'Midden', 'Geen fee aan adoptanten, geen datahandel, asiel houdt de regie, open kennis.'],
              ].map(([r, i, m], idx) => (
                <tr key={r} className={idx % 2 ? 'bg-[#f9fafb]/60' : ''}>
                  <td className="px-5 py-4 align-top font-bold text-[#33335c]">{r}</td>
                  <td className="px-5 py-4 align-top">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        i === 'Hoog'
                          ? 'bg-[#ee5b2b]/12 text-[#ee5b2b]'
                          : 'bg-[#f8aa25]/15 text-[#e39207]'
                      }`}
                    >
                      {i}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-[#33335c]/70">{m}</td>
                </tr>
              ))}
            </Table>
          </div>
        </Section>
      </div>

      {/* 12. CONTACT */}
      <Section>
        <SectionHeading
          eyebrow="12 · Contact"
          title="Een vraag van een kind, een antwoord in de praktijk"
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border border-[#33335c]/8 bg-white p-7">
            <p className="text-[15px] leading-relaxed text-[#33335c]/75">
              De vraag van Maya was waarom het zo lang duurt voordat een asieldier een
              thuis vindt. Met de steun van SIDN fonds bewijzen we het antwoord in de
              praktijk, en delen we wat we leren met iedereen die er iets aan heeft.
            </p>
            <div className="mt-6 space-y-3 text-[15px]">
              <p className="flex items-center gap-3 text-[#33335c]/75">
                <span className="material-symbols-outlined text-[#e39207]">person</span>
                <span>
                  <strong className="text-[#33335c]">Vincent van Munster</strong>
                  <span className="block text-[13px] text-[#33335c]/55">
                    Directeur-bestuurder WeAreImpact
                  </span>
                </span>
              </p>
              <p className="flex items-center gap-3 text-[#33335c]/75">
                <span className="material-symbols-outlined text-[#e39207]">mail</span>
                <a
                  href="mailto:v.munster@weareimpact.nl"
                  className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]"
                >
                  v.munster@weareimpact.nl
                </a>
              </p>
              <p className="flex items-center gap-3 text-[#33335c]/75">
                <span className="material-symbols-outlined text-[#e39207]">call</span>
                <a
                  href="tel:+31614470977"
                  className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]"
                >
                  06 144 709 77
                </a>
              </p>
              <p className="flex items-center gap-3 text-[#33335c]/75">
                <span className="material-symbols-outlined text-[#e39207]">language</span>
                <a
                  href="https://www.pootgelukkig.nl"
                  className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]"
                >
                  www.pootgelukkig.nl
                </a>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start justify-center gap-4 rounded-3xl bg-[#33335c] p-7">
            <p className="text-lg font-bold text-white">Direct verder?</p>
            <p className="text-[15px] leading-relaxed text-white/70">
              Lees hoe de matching werkt of praat mee over de pilot met de asielsector.
            </p>
            <div className="no-print mt-2 flex flex-wrap gap-3">
              <ButtonLink href="/werkwijze" variant="primary">
                Bekijk de werkwijze
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="ghost"
                className="!bg-white/10 !text-white !border-white/20 hover:!border-white/40"
              >
                Neem contact op
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <CtaBlock
        title="Help ons het bewijzen — en deel het daarna met iedereen"
        intro="Met een eenmalige Pioniersbijdrage financiert u een openbaar leerproject over Responsible AI voor de asielsector."
        primary={{ href: 'mailto:v.munster@weareimpact.nl', label: 'Neem contact over deze aanvraag' }}
        secondary={{ href: '/over-ons', label: 'Over PootGelukkig' }}
      />
    </div>
  )
}
