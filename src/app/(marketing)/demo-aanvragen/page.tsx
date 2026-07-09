import type { Metadata } from 'next'
import { Section, Eyebrow } from '@/components/marketing/ui'
import { DemoAanvraagForm } from '@/components/marketing/DemoAanvraagForm'

export const metadata: Metadata = {
  title: 'Demo aanvragen — PootGelukkig voor asiels',
  description:
    'Plan een gratis online demonstratie van PootGelukkig, afgestemd op jullie agenda. Kies de Snelle Tour of de Complete Demo en geef aan waar we op moeten focussen.',
  alternates: { canonical: '/demo-aanvragen' },
  openGraph: {
    title: 'Demo aanvragen — PootGelukkig',
    description: 'Een online demonstratie op maat, afgestemd op jullie asiel-agenda.',
    url: '/demo-aanvragen',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

export default function DemoAanvragenPage() {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        <div>
          <Eyebrow>Demo aanvragen</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Een kijkje in jullie eigen werkdag
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
            We snappen dat jullie agenda&apos;s druk zijn, dus we stemmen de online demonstratie (via Teams
            of Google Meet) helemaal af op jullie voorkeur. Vink aan wat jullie het beste uitkomt en we
            sturen binnen één werkdag een bevestiging met de definitieve tijd.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f8aa25]/12 text-[#e39207]">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </span>
              <p className="text-[15px] leading-relaxed text-[#33335c]/70">
                <span className="font-semibold text-[#33335c]">Kies je lengte.</span> De Snelle Tour
                (15–20 min) of de Complete Demo (30–40 min) — jullie bepalen.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f8aa25]/12 text-[#e39207]">
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </span>
              <p className="text-[15px] leading-relaxed text-[#33335c]/70">
                <span className="font-semibold text-[#33335c]">We bereiden voor.</span> Geef aan waar je
                het liefst naar kijkt, dan laten we precies dat zien.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f8aa25]/12 text-[#e39207]">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <p className="text-[15px] leading-relaxed text-[#33335c]/70">
                <span className="font-semibold text-[#33335c]">Geen verplichtingen.</span> Vraag gerust aan,
                ook als je alleen nieuwsgierig bent.
              </p>
            </div>
          </div>
        </div>

        <DemoAanvraagForm />
      </div>
    </Section>
  )
}
