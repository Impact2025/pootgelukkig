import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, FeatureCard, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Voor asiels — PootGelukkig',
  description:
    'Een dashboard dat asiels tijd bespaart: dierbeheer, AI-matching, Copilot, statistieken en nazorg op één plek. Gratis te proberen.',
  alternates: { canonical: '/voor-asielen' },
  openGraph: {
    title: 'Voor asiels — PootGelukkig',
    description: 'Minder handwerk, betere matches. Het dashboard voor asiels.',
    url: '/voor-asielen',
    type: 'website',
  },
}

const FEATURES = [
  { icon: 'pets', title: 'Dierbeheer', tekst: 'Voer onbeperkt dieren in met foto’s, gedragsprofiel en medisch paspoort.' },
  { icon: 'insights', title: 'AI-matching', tekst: 'Zie per aanvraag een match-score met uitleg, zodat je sneller de kansrijke aanvragen herkent.' },
  { icon: 'smart_toy', title: 'Copilot', tekst: 'Laat de assistent briefings, taken en dossiers voorbereiden, zodat je medewerkers minder typen.' },
  { icon: 'forum', title: 'Aanvragen en berichten', tekst: 'Beheer aanvragen en communiceer met adoptanten op één centrale plek.' },
  { icon: 'bar_chart', title: 'Statistieken', tekst: 'Volg adopties, wachtlijst en doorlooptijden met heldere rapportage.' },
  { icon: 'volunteer_activism', title: 'Nazorg', tekst: 'Begeleid adoptanten met de 3-3-3 regel en verlaag het risico op terugplaatsingen.' },
]

export default function VoorAsielenPage() {
  return (
    <>
      <Section className="!pb-10">
        <div className="max-w-2xl">
          <Eyebrow>Voor asiels</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Minder handwerk. Betere matches.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
            PootGelukkig brengt dierbeheer, aanvragen, matching en nazorg samen in één dashboard. Je
            houdt de regie, het systeem doet het voorwerk.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title}>
              {f.tekst}
            </FeatureCard>
          ))}
        </div>
      </Section>

      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="Beginnen is laagdrempelig"
            title="Gratis starten, betalen als het werkt"
            intro="Probeer PootGelukkig kosteloos met de Start-tier. Je groeit door naar een abonnement op het moment dat het je echt werk uit handen neemt."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { stap: '1', t: 'Maak een account', d: 'Registreer je asiel en voer je eerste dieren in.' },
              { stap: '2', t: 'Ontvang aanvragen', d: 'Adoptanten matchen op leefstijl en dienen aanvragen in.' },
              { stap: '3', t: 'Beslis sneller', d: 'Lees de match-score, gebruik de Copilot en rond de adoptie af.' },
            ].map((s) => (
              <div key={s.stap} className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
                <span className="text-sm font-extrabold text-[#e39207]">Stap {s.stap}</span>
                <h3 className="mt-2 text-lg font-bold text-[#33335c]">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">{s.d}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <CtaBlock
        title="Zie het in je eigen werkdag"
        intro="Plan een korte demo, of begin meteen gratis met de Start-tier."
        primary={{ href: '/contact', label: 'Plan een demo' }}
        secondary={{ href: '/prijzen', label: 'Bekijk de prijzen' }}
      />
    </>
  )
}
