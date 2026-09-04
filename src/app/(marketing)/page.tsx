import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import {
  Section,
  SectionHeading,
  Eyebrow,
  ButtonLink,
  FeatureCard,
  CtaBlock,
} from '@/components/marketing/ui'

export const dynamic = 'force-dynamic'

async function haalLaatstePosts() {
  try {
    return await db
      .select({
        id: blogPosts.id,
        titel: blogPosts.titel,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverUrl: blogPosts.coverUrl,
        gepubliceerdOp: blogPosts.gepubliceerdOp,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'gepubliceerd'))
      .orderBy(desc(blogPosts.gepubliceerdOp))
      .limit(3)
  } catch {
    return []
  }
}

export const metadata: Metadata = {
  title: 'ImpactOS — Het Complete Platform voor het Sociaal Domein',
  description:
    'ImpactOS combineert een Pro CRM, 24/7 AI-webassistent en vijf AI-collega\'s in één platform voor sociaal ondernemers en zorgkwartiermakers. Minder bureaucratie, meer maatschappelijke impact. Een initiatief van WeAreImpact.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ImpactOS — Het Complete Platform voor het Sociaal Domein',
    description: 'Minder bureaucratie, 24/7 bereikbaarheid en tot 70% minder administratieve lasten.',
    url: '/',
    type: 'website',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 675 }],
  },
}

const STATS = [
  { waarde: '-70%', label: 'Minder administratie & dubbele invoer' },
  { waarde: '24/7', label: 'Directe bereikbaarheid voor cliënten' },
  { waarde: '5-10 uur', label: 'Wekelijkse structurele tijdwinst' },
]

const AI_COLLEGAS = [
  { naam: 'Sam', rol: 'Fondsen & Subsidies', icoon: 'volunteer_activism', omschrijving: 'Schrijft concept-subsidieaanvragen, projectbegrotingen en fondsverantwoordingen op basis van jouw dossier- en projectdata.' },
  { naam: 'Mila', rol: 'Impact & Verantwoording', icoon: 'bar_chart', omschrijving: 'Bundelt veldlogs, uren en resultaten tot gestructureerde Wmo-/SROI-rapportages voor financiers en gemeenten.' },
  { naam: 'Conny', rol: 'Communicatie & PR', icoon: 'campaign', omschrijving: 'Vertaalt praktijksuccesjes naar geanonimiseerde LinkedIn-artikelen, nieuwsbrieven en persberichten.' },
  { naam: 'Bram', rol: 'Vrijwilligers & Welzijn', icoon: 'groups', omschrijving: 'Screent aanmeldingen, stelt onboarding-checklists op en houdt vrijwilligers/maatjes betrokken.' },
  { naam: 'Samen', rol: '24/7 Eerstelijns Support', icoon: 'forum', omschrijving: 'Beantwoordt veelgestelde vragen van cliënten en bezoekers direct op je website, dag en nacht.' },
]

export default async function HomePage() {
  const posts = await haalLaatstePosts()

  return (
    <>
      {/* Hero */}
      <Section className="!pt-16 sm:!pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Voor sociaal ondernemers &amp; zorgkwartiermakers</Eyebrow>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#1E293B] sm:text-5xl lg:text-6xl">
              ImpactOS: Het Complete Platform voor het Sociaal Domein
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#1E293B]/65">
              Minder bureaucratie, 24/7 bereikbaarheid en tot 70% minder administratieve lasten. Eén
              platform met een Pro CRM, AI-webassistent en vijf AI-collega&apos;s die concepten
              voorbereiden — de mens beslist altijd.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/contact?onderwerp=doorbraak-sprint" variant="primary" icon="arrow_forward">
                Plan een Doorbraak Sprint
              </ButtonLink>
              <ButtonLink href="/demo-aanvragen" variant="ghost">
                Bekijk Demo / Intake
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm font-medium text-[#1E293B]/45">
              Human-in-the-loop gegarandeerd. Er vertrekt niets zonder jouw akkoord.
            </p>
          </div>

          {/* Hero visual — kernstatistieken */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-[#3B82F6]/20 via-[#1E293B]/5 to-[#2563EB]/15 blur-2xl"
            />
            <div className="overflow-hidden rounded-[1.5rem] border border-[#1E293B]/10 bg-white p-8 shadow-[0_30px_70px_rgba(30,41,59,0.18)]">
              <div className="grid gap-5">
                {STATS.map((s) => (
                  <div key={s.label} className="flex items-center gap-5 rounded-2xl bg-[#F8FAFC] px-5 py-4">
                    <span className="text-3xl font-extrabold tracking-tight text-[#2563EB]">{s.waarde}</span>
                    <span className="text-sm font-semibold leading-snug text-[#1E293B]/70">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Kernstatistieken (herhaald, prominent op mobiel) */}
      <Section className="!pt-0 sm:hidden">
        <div className="grid gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-[#1E293B]/8 bg-white px-5 py-4 text-center">
              <p className="text-2xl font-extrabold text-[#2563EB]">{s.waarde}</p>
              <p className="mt-1 text-sm font-semibold text-[#1E293B]/60">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Probleem -> oplossing */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Waarom ImpactOS"
          title="Te veel tijd naar formulieren, te weinig naar mensen"
          intro="Sociaal ondernemers en zorgkwartiermakers besteden een groot deel van hun week aan dubbele invoer, rapportages en losse Excel-bestanden. ImpactOS bundelt CRM, dossiers en AI-ondersteuning in één platform, zodat die tijd weer naar cliënten kan."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <FeatureCard icon="bolt" title="Minder dubbele invoer">
            Eén centrale plek voor dossiers, cliënten en begeleidingen — geen los CRM, spreadsheet en
            mailbox meer naast elkaar.
          </FeatureCard>
          <FeatureCard icon="schedule" title="24/7 bereikbaar">
            De &quot;Samen&quot;-webassistent beantwoordt veelgestelde vragen van cliënten direct op je
            website, ook buiten kantooruren.
          </FeatureCard>
          <FeatureCard icon="verified_user" title="Jij houdt de regie">
            AI-collega&apos;s bereiden concepten voor — subsidies, rapportages, communicatie. Niets
            vertrekt zonder jouw goedkeuring.
          </FeatureCard>
        </div>
      </Section>

      {/* De 5 AI-collega's */}
      <div className="bg-white">
        <Section id="ai-collegas" className="scroll-mt-20">
          <SectionHeading
            eyebrow="Jouw AI-team"
            title="Vijf AI-collega's die het zware werk voorbereiden"
            intro="Elke AI-collega is gespecialiseerd in één taak en werkt met de data uit jouw eigen dossiers. Activeer ze per organisatie via AI Rollen."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AI_COLLEGAS.map((c) => (
              <div key={c.naam} className="rounded-3xl border border-[#1E293B]/8 bg-[#F8FAFC] p-7">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#1E293B] text-[#3B82F6]">
                    <span className="material-symbols-outlined">{c.icoon}</span>
                  </span>
                  <div>
                    <p className="text-lg font-extrabold text-[#1E293B]">{c.naam}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">{c.rol}</p>
                  </div>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-[#1E293B]/65">{c.omschrijving}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-4 rounded-3xl border border-[#2563EB]/20 bg-[#2563EB]/5 p-6">
            <span className="material-symbols-outlined mt-0.5 text-[#2563EB]">shield</span>
            <div>
              <p className="font-bold text-[#1E293B]">Human-in-the-loop garantie</p>
              <p className="mt-1 text-sm leading-relaxed text-[#1E293B]/65">
                Sam, Mila en Conny leveren altijd een concept — geen enkele e-mail, aanvraag of post
                wordt automatisch verstuurd. Elk concept staat klaar in de wachtrij, wachtend op jouw
                goedkeuring.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* Doorbraak Sprint teaser */}
      <Section>
        <div className="grid items-center gap-10 rounded-[2rem] border border-[#1E293B]/8 bg-[#F8FAFC] p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Eyebrow>Doorbraak Sprint</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#1E293B] sm:text-4xl">
              In één dagdeel je administratie op orde
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#1E293B]/65">
              We komen op locatie, richten ImpactOS samen met je team in en vertrekken met een werkend
              platform. Gemiddeld 5-10 uur per week structureel terug.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/contact?onderwerp=doorbraak-sprint" variant="primary">Plan een Doorbraak Sprint</ButtonLink>
              <ButtonLink href="/tarieven" variant="ghost">Bekijk tarieven</ButtonLink>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              '1 dagdeel, op locatie',
              'Direct werkend platform + ingerichte AI-collega\'s',
              'Team meteen aan de slag',
              '5-10 uur per week structurele tijdwinst',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl border border-[#1E293B]/8 bg-white px-4 py-3">
                <span className="material-symbols-outlined text-[#2563EB]">check_circle</span>
                <span className="text-sm font-semibold text-[#1E293B]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Laatste uit de blog */}
      {posts.length > 0 && (
        <Section>
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Kennis en verhalen" title="Laatste uit de blog" />
            <Link
              href="/blog"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] sm:inline-flex"
            >
              Alle artikelen
              <span className="material-symbols-outlined text-[1.1rem]">arrow_forward</span>
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-[#1E293B]/8 bg-white shadow-[0_1px_3px_rgba(30,41,59,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(30,41,59,0.08)]"
              >
                {p.coverUrl ? (
                  <div className="relative aspect-[16/9] bg-[#f1f1f5]">
                    <Image
                      src={p.coverUrl}
                      alt={p.titel}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
                    <span className="material-symbols-outlined text-4xl text-[#3B82F6]">auto_awesome</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold leading-tight text-[#1E293B]">{p.titel}</h3>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#1E293B]/55">{p.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <CtaBlock
        title="Klaar om je administratie te halveren?"
        intro="Plan een vrijblijvend gesprek en ontdek wat ImpactOS voor jouw organisatie kan betekenen."
        primary={{ href: '/contact?onderwerp=doorbraak-sprint', label: 'Plan een Doorbraak Sprint' }}
        secondary={{ href: '/demo-aanvragen', label: 'Bekijk demo / intake' }}
      />
    </>
  )
}
