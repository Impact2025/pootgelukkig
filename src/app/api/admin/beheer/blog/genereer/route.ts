import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'
import { chatCompletion } from '@/lib/ai/client'
import { berekenSeoScore, slugify } from '@/lib/blog/seo'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Vaste kernpagina's waar de AI naar mag interlinken
const KERNPAGINAS = [
  { tekst: 'Vraag een demo aan', url: '/contact?onderwerp=demo' },
  { tekst: 'Doe de intake', url: '/intake' },
  { tekst: 'Voor organisaties', url: '/voor-organisaties' },
]

interface GegenereerdArtikel {
  titel: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  inhoudMd: string
  interneLinks: { tekst: string; url: string }[]
  externeLinks: { tekst: string; url: string }[]
}

export async function POST(req: NextRequest) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = (await req.json()) as { onderwerp?: string; focusKeyword?: string }
  if (!body.onderwerp?.trim()) {
    return NextResponse.json({ error: 'Onderwerp is verplicht' }, { status: 400 })
  }

  const onderwerp = body.onderwerp.trim()
  const focusKeyword = body.focusKeyword?.trim() || onderwerp

  // Bestaande artikelen voor interne links
  const bestaande = await db
    .select({ titel: blogPosts.titel, slug: blogPosts.slug })
    .from(blogPosts)
    .where(eq(blogPosts.status, 'gepubliceerd'))
    .limit(30)

  const interneOpties = [
    ...KERNPAGINAS,
    ...bestaande.map((b) => ({ tekst: b.titel, url: `/blog/${b.slug}` })),
  ]

  const prompt = `Je bent een Nederlandse SEO-copywriter van wereldklasse voor PootGelukkig, een platform dat asieldieren aan adoptiegezinnen koppelt.

Schrijf een diepgaand, vlot leesbaar blogartikel in het Nederlands over: "${onderwerp}".
Focuskeyword: "${focusKeyword}".

Eisen voor wereldklasse SEO:
- Minimaal 700 woorden, in Markdown.
- Gebruik het focuskeyword in de titel, de eerste alinea en in minstens één H2/H3-kop. Houd de keyworddichtheid natuurlijk (0.5–2.5%).
- Structureer met meerdere ## H2 en waar nuttig ### H3 koppen.
- Warme, deskundige toon; concreet en behulpzaam voor toekomstige adoptanten.
- Verwerk 2–4 INTERNE links uit deze lijst (gebruik exact deze url's): ${JSON.stringify(interneOpties)}.
- Verwerk 2–3 EXTERNE links naar gezaghebbende Nederlandse bronnen (bijv. dierenbescherming.nl, licg.nl, rijksoverheid.nl). Verzin geen niet-bestaande pagina's.
- Plaats links inline in de Markdown met [tekst](url).

Geef je antwoord als puur JSON, zonder uitleg of code-fences, in dit formaat:
{
  "titel": "...",
  "excerpt": "korte samenvatting van 1-2 zinnen",
  "metaTitle": "SEO titel van 30-60 tekens",
  "metaDescription": "meta-omschrijving van 70-160 tekens",
  "inhoudMd": "# Titel\\n\\n...volledige markdown...",
  "interneLinks": [{"tekst":"...","url":"/..."}],
  "externeLinks": [{"tekst":"...","url":"https://..."}]
}`

  let artikel: GegenereerdArtikel
  try {
    const raw = await chatCompletion([{ role: 'user', content: prompt }], {
      maxTokens: 4000,
      meta: { actie: 'blog', userId: admin.userId, organisatieId: 'platform' },
    })
    const schoon = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim()
    const start = schoon.indexOf('{')
    const eind = schoon.lastIndexOf('}')
    artikel = JSON.parse(schoon.slice(start, eind + 1)) as GegenereerdArtikel
  } catch (err) {
    console.error('[Blog] AI-generatie mislukt:', err)
    return NextResponse.json({ error: 'AI-generatie mislukt' }, { status: 502 })
  }

  // Unieke slug bepalen
  let slug = slugify(artikel.titel)
  const [bestaat] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1)
  if (bestaat) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  const seo = berekenSeoScore({
    titel: artikel.titel,
    inhoudMd: artikel.inhoudMd,
    metaTitle: artikel.metaTitle,
    metaDescription: artikel.metaDescription,
    focusKeyword,
    interneLinks: artikel.interneLinks,
    externeLinks: artikel.externeLinks,
  })

  const [post] = await db
    .insert(blogPosts)
    .values({
      titel: artikel.titel,
      slug,
      inhoudMd: artikel.inhoudMd,
      excerpt: artikel.excerpt,
      status: 'concept',
      metaTitle: artikel.metaTitle,
      metaDescription: artikel.metaDescription,
      focusKeyword,
      seoScore: seo.score,
      interneLinks: artikel.interneLinks ?? [],
      externeLinks: artikel.externeLinks ?? [],
      auteurId: admin.userId,
    })
    .returning()

  return NextResponse.json({ data: post, seo }, { status: 201 })
}
