import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type TocEntry = { id: string; text: string; level: number }

function slugifyHeading(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function analyseerInhoud(inhoudMd: string, titel: string) {
  const zonderH1 = inhoudMd.replace(/^\s*#\s+.*(\r?\n)+/, '')
  const toc: TocEntry[] = []
  const faqItems: { vraag: string; antwoord: string }[] = []
  const howtoSteps: { name: string; text: string }[] = []

  let inFaq = false
  let huidigeFaqVraag = ''
  let huidigeFaqAntwoord = ''

  const lijnen = zonderH1.split('\n')
  for (let i = 0; i < lijnen.length; i++) {
    const l = lijnen[i]
    const h2Match = l.match(/^##\s+(.+)/)
    const h3Match = l.match(/^###\s+(.+)/)

    if (h2Match) {
      const txt = h2Match[1].replace(/\*\*/g, '').trim()
      const id = slugifyHeading(txt)
      toc.push({ id, text: txt, level: 2 })
      if (inFaq && huidigeFaqVraag && huidigeFaqAntwoord) {
        faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
      }
      inFaq = h2Match[1].toLowerCase().includes('vraag') || h2Match[1].toLowerCase().includes('faq')
      huidigeFaqVraag = ''
      huidigeFaqAntwoord = ''

      const volgendeLijnH2 = lijnen[i + 1]?.trim() || ''
      if (volgendeLijnH2.match(/^\d+\.\s/)) {
        let stepText = ''
        let j = i + 1
        while (j < lijnen.length && lijnen[j].trim().match(/^\d+\.\s/)) {
          stepText += lijnen[j].trim().replace(/^\d+\.\s+/, '') + ' '
          j++
        }
        if (stepText) howtoSteps.push({ name: txt, text: stepText.trim().substring(0, 200) })
      }
    }
    if (h3Match) {
      const txt = h3Match[1].replace(/\*\*/g, '').trim()
      const id = slugifyHeading(txt)
      toc.push({ id, text: txt, level: 3 })
      if (inFaq) {
        if (huidigeFaqVraag && huidigeFaqAntwoord) {
          faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
          huidigeFaqVraag = ''
          huidigeFaqAntwoord = ''
        }
        huidigeFaqVraag = txt.endsWith('?') ? txt : txt + '?'
      }
      const volgendeLijn = lijnen[i + 1]?.trim() || ''
      if (volgendeLijn.match(/^\d+\.\s/)) {
        let stepText = ''
        let j = i + 1
        while (j < lijnen.length && lijnen[j].trim().match(/^\d+\.\s/)) {
          stepText += lijnen[j].trim().replace(/^\d+\.\s+/, '') + ' '
          j++
        }
        if (stepText) howtoSteps.push({ name: txt, text: stepText.trim().substring(0, 200) })
      }
    }
    if (inFaq && huidigeFaqVraag && !l.match(/^#{1,3}\s/) && l.trim() && !l.match(/^>\s/)) {
      huidigeFaqAntwoord += l.trim() + ' '
    }
  }
  if (inFaq && huidigeFaqVraag && huidigeFaqAntwoord) {
    faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
  }
  return { toc, faqItems, howtoSteps }
}

async function main() {
  const [post] = await db
    .select({ titel: blogPosts.titel, inhoudMd: blogPosts.inhoudMd })
    .from(blogPosts)
    .where(eq(blogPosts.slug, 'hond-adopteren-uit-het-asiel-complete-gids'))
    .limit(1)

  if (!post) { console.log('Post not found'); return }

  const result = analyseerInhoud(post.inhoudMd, post.titel)
  console.log('ToC entries:', result.toc.length)
  console.log('FAQ items:', result.faqItems.length)
  console.log('HowTo steps:', result.howtoSteps.length)
  result.toc.forEach(t => console.log(`  ${'  '.repeat(t.level-2)}${t.text.substring(0,50)}`))
  result.faqItems.forEach(f => console.log(`  FAQ: ${f.vraag.substring(0,50)} → ${f.antwoord.substring(0,50)}...`))
  result.howtoSteps.forEach(s => console.log(`  Step: ${s.name.substring(0,50)}`))

  // Check for 'vraag' in H2s
  const lines = post.inhoudMd.split('\n')
  lines.forEach((l, i) => {
    const m = l.match(/^##\s+(.+)/)
    if (m) console.log(`H2 line ${i}: "${m[1]}" → bevat vraag? ${/vraag/i.test(m[1])}`)
  })
}

main().catch(console.error)
