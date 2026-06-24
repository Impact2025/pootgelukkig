import type { Metadata } from 'next'
import { Section, Eyebrow } from '@/components/marketing/ui'
import { ContactForm } from '@/components/marketing/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — PootGelukkig',
  description:
    'Neem contact op met PootGelukkig voor een demo, een vraag over je asiel-account of algemene informatie.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — PootGelukkig',
    description: 'Plan een demo of stel je vraag.',
    url: '/contact',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Laten we kennismaken
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
            Ben je een asiel en wil je een demo? Of heb je een vraag over je account? We reageren
            doorgaans binnen één werkdag.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#f8aa25]/12 text-[#e39207]">
                <span className="material-symbols-outlined">mail</span>
              </span>
              <a
                href="mailto:info@pootgelukkig.nl"
                className="text-base font-semibold text-[#33335c] hover:text-[#ee5b2b]"
              >
                info@pootgelukkig.nl
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#f8aa25]/12 text-[#e39207]">
                <span className="material-symbols-outlined">apartment</span>
              </span>
              <span className="text-base font-semibold text-[#33335c]">
                Een initiatief van WeAreImpact
              </span>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </Section>
  )
}
