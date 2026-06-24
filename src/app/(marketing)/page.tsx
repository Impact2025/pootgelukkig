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
  StepItem,
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
  title: 'PootGelukkig — Slimme matching voor asieldieren',
  description:
    'PootGelukkig helpt asiels om sneller en beter de juiste adoptant bij het juiste dier te vinden. Gratis voor adoptanten. Een initiatief van WeAreImpact.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'PootGelukkig — Slimme matching voor asieldieren',
    description:
      'AI-gestuurde matching die asiels helpt om de juiste adoptant bij het juiste dier te vinden.',
    url: '/',
    type: 'website',
  },
}

export default async function HomePage() {
  const posts = await haalLaatstePosts()

  return (
    <>
      {/* Hero */}
      <Section className="!pt-16 sm:!pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Voor adoptanten en asiels</Eyebrow>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-[#33335c] sm:text-5xl lg:text-6xl">
              Sneller een gelukkig thuis voor ieder asieldier
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#33335c]/65">
              PootGelukkig koppelt mens en dier op basis van leefstijl in plaats van toeval.
              Het asiel beslist, altijd. Wij helpen ze sneller tot een goede match te komen.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/intake" variant="primary" icon="arrow_forward">
                Vind jouw match
              </ButtonLink>
              <ButtonLink href="/voor-asielen" variant="ghost">
                Voor asiels
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm font-medium text-[#33335c]/45">
              Gratis voor adoptanten. Geen account nodig om rond te kijken.
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="rounded-[2rem] border border-[#33335c]/8 bg-white p-6 shadow-[0_20px_60px_rgba(51,51,92,0.10)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f8aa25]/15 text-[#e39207]">
                    <span className="material-symbols-outlined">pets</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#33335c]">Bram</p>
                    <p className="text-xs text-[#33335c]/50">Kruising, 3 jaar</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#33335c] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#f8aa25]">
                  94% match
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { label: 'Leefstijl', value: 'Actief gezin met tuin' },
                  { label: 'Ervaring', value: 'Past bij jouw profiel' },
                  { label: 'Nazorg', value: '3-3-3 begeleiding inbegrepen' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-2xl bg-[#f9fafb] px-4 py-3"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#33335c]/40">
                      {row.label}
                    </span>
                    <span className="text-sm font-semibold text-[#33335c]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Probleem -> oplossing */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Waarom PootGelukkig"
          title="Matchen op gevoel kost tijd en goede matches"
          intro="Nederlandse asiels zitten vol en het personeel loopt over. Het koppelen van mens en dier gebeurt grotendeels met de hand. Daar gaat tijd verloren, en soms een dier dat net niet op de juiste plek terechtkomt."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <FeatureCard icon="favorite" title="Matching op leefstijl">
            Adoptanten beantwoorden vragen over hun woonsituatie, ervaring en ritme. Wij vertalen dat
            naar dieren die echt passen.
          </FeatureCard>
          <FeatureCard icon="schedule" title="Minder handwerk">
            Het asiel ziet in één oogopslag welke aanvragen kansrijk zijn en bespaart tijd op
            de intake.
          </FeatureCard>
          <FeatureCard icon="verified_user" title="Het asiel beslist">
            De AI neemt het oordeel niet over. De medewerker houdt altijd de regie over wie welk dier
            adopteert.
          </FeatureCard>
        </div>
      </Section>

      {/* Werkwijze compact */}
      <div className="bg-white">
        <Section>
          <SectionHeading
            eyebrow="Werkwijze"
            title="Van eerste vraag tot een blijvend thuis"
            intro="Vier stappen die de match net zo zorgvuldig maken als snel."
          />
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <StepItem step={1} title="Intake">
              Een kort gesprek over je leefstijl, ervaring en wensen.
            </StepItem>
            <StepItem step={2} title="AI-matching">
              Je profiel wordt gekoppeld aan de dieren die het beste passen.
            </StepItem>
            <StepItem step={3} title="Contact met het asiel">
              Je neemt contact op en het asiel beoordeelt de aanvraag.
            </StepItem>
            <StepItem step={4} title="Adoptie en nazorg">
              Na de adoptie helpt de 3-3-3 begeleiding bij het wennen.
            </StepItem>
          </div>
          <div className="mt-12">
            <Link
              href="/werkwijze"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#ee5b2b] hover:text-[#d94e22]"
            >
              Lees de volledige werkwijze
              <span className="material-symbols-outlined text-[1.1rem]">arrow_forward</span>
            </Link>
          </div>
        </Section>
      </div>

      {/* AI-assistent teaser */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>AI-assistent</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#33335c] sm:text-4xl">
              Een slimme assistent die nooit het oordeel overneemt
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#33335c]/65">
              De assistent helpt adoptanten met vragen en helpt asiels met intake, matchanalyse en
              nazorg-tips. Transparant over wat de AI wel en niet doet, met de mens altijd aan het
              stuur.
            </p>
            <div className="mt-7">
              <ButtonLink href="/ai-assistent" variant="secondary" icon="arrow_forward">
                Bekijk de AI-assistent
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[#33335c]/8 bg-white p-6 shadow-[0_10px_40px_rgba(51,51,92,0.07)]">
            <div className="space-y-3">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-[#33335c] px-4 py-3 text-sm text-white">
                Past een hond bij een appartement zonder tuin?
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-[#f9fafb] px-4 py-3 text-sm text-[#33335c]/80">
                Dat hangt af van het ras en de energie van de hond. Op basis van je profiel laat ik je
                de rassen zien die zich prettig voelen in een appartement, en welke dagelijkse
                beweging ze nodig hebben.
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Voor asiels teaser */}
      <div className="bg-white">
        <Section>
          <div className="grid items-center gap-10 rounded-[2rem] border border-[#33335c]/8 bg-[#f9fafb] p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <Eyebrow>Voor asiels</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#33335c] sm:text-4xl">
                Een dashboard dat tijd bespaart bij elke adoptie
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#33335c]/65">
                Beheer dieren, lees aanvragen met AI-score, gebruik de Copilot voor briefings en
                dossiers, en volg je adopties met heldere statistieken. Gratis te proberen, betaald
                vanaf het moment dat het je echt werk uit handen neemt.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href="/prijzen" variant="primary">Bekijk de prijzen</ButtonLink>
                <ButtonLink href="/contact" variant="ghost">Plan een demo</ButtonLink>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                "Onbeperkt dieren en foto's",
                'AI-matching en aanvragenbeheer',
                'Copilot voor briefings en dossiers',
                'Statistieken en rapportage',
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

      {/* Laatste uit de blog */}
      {posts.length > 0 && (
        <Section>
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Kennis en verhalen" title="Laatste uit de blog" />
            <Link
              href="/blog"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-[#ee5b2b] hover:text-[#d94e22] sm:inline-flex"
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
                className="group flex flex-col overflow-hidden rounded-3xl border border-[#33335c]/8 bg-white shadow-[0_1px_3px_rgba(51,51,92,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(51,51,92,0.08)]"
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
                  <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#33335c] to-[#1a1a3e]">
                    <span className="material-symbols-outlined text-4xl text-[#f8aa25]">pets</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold leading-tight text-[#33335c]">{p.titel}</h3>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#33335c]/55">{p.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <CtaBlock
        title="Klaar om jouw match te vinden?"
        intro="Begin met een kort intakegesprek. Gratis, en je zit nergens aan vast."
        primary={{ href: '/intake', label: 'Start de intake' }}
        secondary={{ href: '/werkwijze', label: 'Hoe het werkt' }}
      />
    </>
  )
}
