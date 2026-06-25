import { db } from '@/lib/db'
import { blogPosts, blogCategorieen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { readFileSync } from 'fs'
import { join } from 'path'

async function main() {
  // Read the markdown content from the sibling file
  const inhoud = readFileSync(join(__dirname, 'content-hond-adopteren-gids.md'), 'utf-8')

  // Get the adoptanten category
  const [cat] = await db
    .select({ id: blogCategorieen.id })
    .from(blogCategorieen)
    .where(eq(blogCategorieen.slug, 'adoptanten'))
    .limit(1)

  if (!cat) {
    console.error('❌ Categorie "adoptanten" niet gevonden')
    process.exit(1)
  }

  const slug = 'hond-adopteren-uit-het-asiel-complete-gids'

  // Check if it already exists
  const [bestaand] = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1)

  if (bestaand) {
    console.log('⚠️  Artikel bestaat al (id: ' + bestaand.id + '), skippen')
    process.exit(0)
  }

  await db.insert(blogPosts).values({
    titel: 'Hond adopteren uit het asiel: complete gids 2026',
    slug,
    inhoudMd: inhoud,
    excerpt: 'Overweeg je een hond adopteren uit het asiel? Complete gids van intake tot nazorg. Ontdek wat het kost, hoe de intake werkt en wat de 3-3-3 regel inhoudt.',
    coverUrl: null,
    categorieId: cat.id,
    status: 'gepubliceerd',
    metaTitle: 'Hond adopteren uit het asiel: complete gids 2026',
    metaDescription: 'Een hond adopteren uit het asiel: complete gids met stappenplan, kostenoverzicht en nazorg. Ontdek hoe PootGelukkig jou helpt bij de perfecte match.',
    focusKeyword: 'hond adopteren uit het asiel',
    leestijd: 10,
    interneLinks: [
      { tekst: 'Wat kost een asieldier', url: '/kennisbank/voorbereiding/wat-kost-een-asieldier' },
      { tekst: 'De 3-3-3 regel', url: '/kennisbank/thuiskomst/de-eerste-dagen-3-3-3' },
      { tekst: 'Is adopteren iets voor jou', url: '/kennisbank/voorbereiding/is-adopteren-iets-voor-jou' },
      { tekst: 'Kat adopteren gids', url: '/blog/een-kat-adopteren-uit-het-asiel-de-complete-gids-voor-beginners' },
      { tekst: 'Hoe matching werkt', url: '/kennisbank/hoe-het-werkt/hoe-werkt-de-matching' },
    ],
    gepubliceerdOp: new Date(),
  })

  console.log('✅ Artikel "Hond adopteren" ingevoegd met slug:', slug)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fout:', err)
  process.exit(1)
})
