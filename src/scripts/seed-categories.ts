import { db } from '@/lib/db'
import { blogCategorieen } from '@/lib/db/schema'

async function main() {
  const bestaand = await db.select().from(blogCategorieen)
  if (bestaand.length > 0) {
    console.log('Bestaand:', JSON.stringify(bestaand))
    process.exit(0)
  }
  console.log('Geen categorieën gevonden, aanmaken...')
  for (const c of [
    { naam: 'Adoptanten', slug: 'adoptanten' },
    { naam: 'Asielen', slug: 'asielen' },
    { naam: 'Pootgelukkig', slug: 'pootgelukkig' },
  ]) {
    await db.insert(blogCategorieen).values(c).onConflictDoNothing()
    console.log('✓', c.naam)
  }
  const result = await db.select().from(blogCategorieen)
  console.log('Resultaat:', JSON.stringify(result))
  process.exit(0)
}

main().catch((err) => {
  console.error('Fout:', err)
  process.exit(1)
})
