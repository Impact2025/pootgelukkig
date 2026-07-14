import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Section, SectionHeading, Eyebrow, FeatureCard, ButtonLink, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Dr. Poot — PootGelukkig',
  description:
    'Dr. Poot is de dierenwelzijn-AI die adoptanten helpt met vragen en asiels ondersteunt bij intake, matchanalyse en nazorg. Transparant, met de mens aan het stuur.',
  alternates: { canonical: '/ai-assistent' },
  openGraph: {
    title: 'Dr. Poot — PootGelukkig',
    description: 'Slimme ondersteuning die het oordeel nooit overneemt.',
    url: '/ai-assistent',
    type: 'website',
  },
}

export default function AiAssistentPage() {
  return (
    <>
      <Section className="!pt-16 sm:!pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Dr. Poot</Eyebrow>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl lg:text-6xl">
              Slim waar het kan, menselijk waar het moet
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#33335c]/65">
              Dr. Poot helpt adoptanten met vragen over het adoptieproces en ondersteunt asiels
              met intake, matchanalyse en nazorg-tips. Hij doet het voorwerk; de mens beslist.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/intake" variant="primary" icon="arrow_forward">
                Start de intake
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
                src="/images/hero/copilot.png"
                alt="PootGelukkig Copilot: de AI-assistent geeft de dagelijkse briefing en beantwoordt vragen van het asielteam"
                width={1480}
                height={828}
                priority
                className="h-auto w-full"
              />
            </div>
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
        title="Maak kennis met Dr. Poot"
        intro="Stel je vraag via Dr. Poot rechtsonder, of start direct met de intake."
        primary={{ href: '/intake', label: 'Start de intake' }}
        secondary={{ href: '/faq', label: 'Veelgestelde vragen' }}
      />
    </>
  )
}
