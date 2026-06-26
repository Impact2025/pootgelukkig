import type { Metadata } from 'next'
import { Section, SectionHeading, Eyebrow, CtaBlock } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Over ons — PootGelukkig',
  description:
    'PootGelukkig is ontstaan uit een simpele vraag: waarom duurt het zo lang voordat een asieldier een nieuw thuis vindt? Een initiatief van WeAreImpact.',
  alternates: { canonical: '/over-ons' },
  openGraph: {
    title: 'Over ons — PootGelukkig',
    description:
      'Het verhaal achter PootGelukkig: gebouwd samen met asiels, voor asiels.',
    url: '/over-ons',
    type: 'website',
  },
}

export default function OverOnsPage() {
  return (
    <>
      <Section className="!pb-12">
        <div className="max-w-2xl">
          <Eyebrow>Over PootGelukkig</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Meer dieren een gelukkig thuis
          </h1>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-[#33335c]/75">
          <p>
            PootGelukkig is ontstaan uit een simpele vraag van mijn dochter Maya: waarom duurt het zo
            lang voordat een asieldier een nieuw thuis vindt? Die vraag liet me niet meer los.
          </p>
          <p>
            We zagen het probleem van dichtbij. Nederlandse asiels zitten vol, het personeel loopt
            over en het matchen van mens en dier gebeurt grotendeels op gevoel en met de hand. Daar
            gaat veel tijd verloren, en soms ook een goede match.
          </p>
          <p>
            Daarom bouwden we PootGelukkig. Een platform dat asiels helpt om sneller en beter te zien
            welke adoptant bij welk dier past. De app neemt het oordeel van het asiel niet over, maar
            helpt ze sneller tot dat oordeel te komen. De medewerker beslist, altijd.
          </p>
          <p>
            PootGelukkig is een initiatief van WeAreImpact. We bouwen het samen met asiels, voor
            asiels, met één doel: meer dieren een gelukkig thuis.
          </p>
        </div>
      </Section>

      <div className="bg-white">
        <Section>
          <SectionHeading eyebrow="Waar we voor staan" title="Onze uitgangspunten" />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'De mens beslist',
                tekst:
                  'Onze AI ondersteunt, maar het asiel houdt altijd de regie over wie welk dier adopteert.',
              },
              {
                title: 'Samen met asiels',
                tekst:
                  'We ontwikkelen elke functie in de praktijk, samen met de mensen die er dagelijks mee werken.',
              },
              {
                title: 'Blijvende matches',
                tekst:
                  'Een goede match betekent minder terugplaatsingen en een dier dat echt op zijn plek blijft.',
              },
            ].map((v) => (
              <div key={v.title} className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
                <h3 className="text-lg font-bold text-[#33335c]">{v.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">{v.tekst}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <CtaBlock
        title="Bouw met ons mee"
        intro="Ben je een asiel dat sneller en beter wil matchen? We gaan graag met je in gesprek."
        primary={{ href: '/contact', label: 'Neem contact op' }}
        secondary={{ href: '/voor-asielen', label: 'Voor asiels' }}
      />

      {/* Blog links */}
      <Section className="!pt-12 !pb-16">
        <SectionHeading
          eyebrow="Verder lezen"
          title="Lees het verhaal"
        />
        <ul className="mt-6 space-y-3 text-[15px]">
          <li>→ <Link href="/blog/van-bestuurskamer-naar-startup-waarom-ik-stopte-met-managen-en-ging-bouwen" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Van bestuurskamer naar startup — het persoonlijke verhaal</Link></li>
          <li>→ <Link href="/blog/hoe-de-ai-matching-van-pootgelukkig-werkt" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Hoe de AI-matching werkt</Link></li>
          <li>→ <Link href="/blog/toekomst-van-asieladopties-van-papier-naar-data-gedreven" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">De toekomst van asieladopties</Link></li>
          <li>→ <Link href="/blog/hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">Casestudy: asiel plaatst 40% meer</Link></li>
        </ul>
      </Section>
    </>
  )
}
