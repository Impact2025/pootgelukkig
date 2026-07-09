import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { slugify } from '@/lib/blog/seo'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Publish-endpoint voor AgentOS (het content-review dashboard).
 *
 * Gespiegeld op Bijeen's /api/blog: AgentOS doet een POST met een static
 * Bearer-token (geen sessiecookie) en verwacht dat het artikel direct live
 * komt. Verschil met Bijeen: Pootgelukkig rendert blog-inhoud als Markdown
 * (via `marked` in de blog-pagina), terwijl AgentOS een HTML-body meestuurt.
 * Daarom zetten we de HTML hier om naar schone Markdown voordat we opslaan —
 * anders zou er rauwe <h2> op de pagina komen te staan.
 *
 * Wordt aangeroepen door AgentOS `_publish_to_project_site()` (content_pipeline.py),
 * die deze payload stuurt voor niet-BIJEEN-sites:
 *   { title, content (HTML), slug, seoDescription, tags[], source: 'agent-os' }
 */

const AGENT_OS_KEY = process.env.AGENT_OS_PUBLISH_KEY ?? ''

function htmlToMarkdown(html: string): string {
  if (!html) return ''
  let s = html

  // Verwijder script/style volledig
  s = s.replace(/<(script|style)[\s\S]*?<\/(script|style)>/gi, '')

  // Blok-elementen → newlines
  s = s.replace(/<\/(h[1-6]|p|li|blockquote|div|section|article)>/gi, '\n')
  s = s.replace(/<br\s*\/?>/gi, '\n')
  s = s.replace(/<\/tr>/gi, '\n')
  s = s.replace(/<\/td>/gi, ' | ')

  // Headings → MD
  s = s.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
  s = s.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
  s = s.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
  s = s.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n')

  // Lijsten
  s = s.replace(/<ul[^>]*>/gi, '\n')
  s = s.replace(/<\/ul>/gi, '\n')
  s = s.replace(/<ol[^>]*>/gi, '\n')
  s = s.replace(/<\/ol>/gi, '\n')
  s = s.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')

  // Vet / cursief
  s = s.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**')
  s = s.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*')

  // Links + afbeeldingen
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)')
  s = s.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')

  // Verwijder overgebleven tags
  s = s.replace(/<[^>]+>/g, '')

  // HTML-entities decoderen (meest voorkomend)
  s = s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&euml;/g, 'ë')
    .replace(/&aacute;/g, 'á')
    .replace(/&ograve;/g, 'ò')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uuml;/g, 'ü')
    .replace(/&ouml;/g, 'ö')
    .replace(/&iuml;/g, 'ï')
    .replace(/&copy;/g, '©')
    .replace(/&hellip;/g, '…')

  // Opruimen: dubbele spaties en lege regels
  s = s
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n')
    .trim()

  return s
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!AGENT_OS_KEY || token !== AGENT_OS_KEY) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 })
  }

  const title = (body.title ?? '').toString().trim()
  const htmlContent = (body.content ?? '').toString()
  if (!title || !htmlContent.trim()) {
    return NextResponse.json({ error: 'Titel en content zijn verplicht' }, { status: 400 })
  }

  const inhoudMd = htmlToMarkdown(htmlContent)
  const excerpt = (body.seoDescription ?? '').toString().trim()
  const focusKeyword = Array.isArray(body.tags) && body.tags.length ? body.tags[0] : null
  // AgentOS zet soms een ✅ (of ander emoticon) vooraan de titel, vaak gevolgd
  // door een streepje ("✅-Titel"). De slug wordt via slugify() gesaned (✅ weg),
  // maar dan blijft de leading "-" hangen. Hier halen we ✅ én een eventuele
  // "✅-" direct weg, en strippen de slug ook leading/trailing dashes.
  const cleanTitle = title.replace(/✅-?/g, '').replace(/\s+/g, ' ').trim()
  const slugRaw = (body.slug ?? '').toString().trim().replace(/✅-?/g, '')
  const slug = slugify(slugRaw || cleanTitle).replace(/^-+/, '').replace(/-+$/g, '').slice(0, 280)
  const metaTitle = cleanTitle.slice(0, 60)

  // Unieke slug
  let finalSlug = slug.slice(0, 280)
  const [bestaat] = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, finalSlug))
    .limit(1)
  if (bestaat) finalSlug = `${finalSlug}-${Date.now().toString(36).slice(-4)}`.slice(0, 280)

  const [post] = await db
    .insert(blogPosts)
    .values({
      titel: title.slice(0, 255),
      slug: finalSlug,
      inhoudMd,
      excerpt: excerpt || null,
      status: 'gepubliceerd',
      metaTitle,
      metaDescription: excerpt ? excerpt.slice(0, 320) : null,
      focusKeyword,
      seoScore: 0,
      gepubliceerdOp: new Date(),
      auteurId: null,
    })
    .returning()

  return NextResponse.json(
    { post: { id: post.id, slug: post.slug, status: post.status }, url: `/blog/${post.slug}` },
    { status: 201 },
  )
}
