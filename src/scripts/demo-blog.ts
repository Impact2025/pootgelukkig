/**
 * Genereert via de echte AI-pipeline een blogartikel en publiceert het direct,
 * zodat /blog en /blog/[slug] live te bekijken zijn.
 * Uitvoeren: npx tsx --env-file=.env.local src/scripts/demo-blog.ts
 */
import { db } from '../lib/db'
import { blogPosts, users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import { chatCompletion } from '../lib/ai/client'
import { berekenSeoScore, slugify } from '../lib/blog/seo'

const onderwerp = 'Een kat adopteren uit het asiel: de complete gids voor beginners'
const focusKeyword = 'kat adopteren'

const interneOpties = [
  { tekst: 'Vraag een demo aan', url: '/contact?onderwerp=demo' },
  { tekst: 'Doe de intake', url: '/intake' },
  { tekst: 'Voor organisaties', url: '/voor-organisaties' },
]

interface Artikel {
  titel: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  inhoudMd: string
  interneLinks: { tekst: string; url: string }[]
  externeLinks: { tekst: string; url: string }[]
}

async function run() {
  console.log('🤖 AI schrijft een artikel…')
  const prompt = `Je bent een Nederlandse SEO-copywriter van wereldklasse voor PootGelukkig, een platform dat asieldieren aan adoptiegezinnen koppelt.

Schrijf een diepgaand, vlot leesbaar blogartikel in het Nederlands over: "${onderwerp}".
Focuskeyword: "${focusKeyword}".

Eisen voor wereldklasse SEO:
- Minimaal 700 woorden, in Markdown.
- Gebruik het focuskeyword in de titel, de eerste alinea en in minstens één H2/H3-kop. Houd de keyworddichtheid natuurlijk (0.5–2.5%).
- Structureer met meerdere ## H2 en waar nuttig ### H3 koppen.
- Warme, deskundige toon; concreet en behulpzaam voor toekomstige adoptanten.
- Verwerk 2–4 INTERNE links uit deze lijst (gebruik exact deze url's): ${JSON.stringify(interneOpties)}.
- Verwerk 2–3 EXTERNE links naar gezaghebbende Nederlandse bronnen (bijv. dierenbescherming.nl, licg.nl).
- Plaats links inline in de Markdown met [tekst](url).

Geef je antwoord als puur JSON, zonder uitleg of code-fences:
{"titel":"...","excerpt":"...","metaTitle":"...","metaDescription":"...","inhoudMd":"# ...","interneLinks":[{"tekst":"...","url":"/..."}],"externeLinks":[{"tekst":"...","url":"https://..."}]}`

  const raw = await chatCompletion([{ role: 'user', content: prompt }], { maxTokens: 4000, meta: { actie: 'blog', organisatieId: 'platform' } })
  const schoon = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim()
  const artikel = JSON.parse(schoon.slice(schoon.indexOf('{'), schoon.lastIndexOf('}') + 1)) as Artikel

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

  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.rol, 'admin')).limit(1)

  const [post] = await db
    .insert(blogPosts)
    .values({
      titel: artikel.titel,
      slug,
      inhoudMd: artikel.inhoudMd,
      excerpt: artikel.excerpt,
      status: 'gepubliceerd',
      metaTitle: artikel.metaTitle,
      metaDescription: artikel.metaDescription,
      focusKeyword,
      seoScore: seo.score,
      interneLinks: artikel.interneLinks ?? [],
      externeLinks: artikel.externeLinks ?? [],
      auteurId: admin?.id ?? null,
      gepubliceerdOp: new Date(),
    })
    .returning()

  console.log(`\n✓ Gepubliceerd: "${post.titel}"`)
  console.log(`  SEO-score: ${seo.score}/100`)
  console.log(`  Interne links: ${artikel.interneLinks?.length ?? 0} · Externe links: ${artikel.externeLinks?.length ?? 0}`)
  console.log(`  Live op: /blog/${post.slug}\n`)
  process.exit(0)
}

run().catch((e) => {
  console.error('Fout:', e)
  process.exit(1)
})
