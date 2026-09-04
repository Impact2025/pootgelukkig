import { db } from './db'
import { organisaties } from './db/schema'
import { NL_ASIELEN, type AsielSeed } from './data/nl-asielen'

export interface ImportResultaat {
  gevonden: number   // aantal organisaties in de bron
  nieuw: number      // nieuw toegevoegd aan de database
  overgeslagen: number // bestond al (dedupe)
  toegevoegd: Array<{ naam: string; stad: string }>
}

// Normaliseer naam+stad voor deduplicatie (case/spatie-ongevoelig)
function sleutel(naam: string, stad: string): string {
  return `${naam}|${stad}`.toLowerCase().replace(/\s+/g, ' ').trim()
}

function slugify(naam: string, uniekSuffix: string): string {
  const basis = naam
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${basis || 'organisatie'}-${uniekSuffix}`.slice(0, 160)
}

/**
 * Leest de samengestelde organisaties-lijst en voegt onbekende organisaties toe aan de
 * database. Bestaande organisaties (zelfde naam + stad) worden ongemoeid gelaten,
 * zodat handmatig gecorrigeerde gegevens niet overschreven worden.
 *
 * Nieuwe organisaties krijgen `bron: 'import'` en `wervingStatus: 'nieuw'`, zodat ze
 * in het werving-overzicht verschijnen en pas na goedkeuring een mail krijgen.
 */
export async function importeerAsielen(bron: AsielSeed[] = NL_ASIELEN): Promise<ImportResultaat> {
  const bestaande = await db
    .select({ naam: organisaties.naam })
    .from(organisaties)

  const bestaandeSleutels = new Set(bestaande.map((a) => sleutel(a.naam, '')))

  // Dedupe ook binnen de bron zelf (naam+stad — de bron kent nog stad, het schema niet meer)
  const gezien = new Set<string>()
  const teVoegen = bron.filter((a) => {
    const s = sleutel(a.naam, a.stad)
    const sZonderStad = sleutel(a.naam, '')
    if (bestaandeSleutels.has(sZonderStad) || gezien.has(s)) return false
    gezien.add(s)
    return true
  })

  if (teVoegen.length > 0) {
    await db.insert(organisaties).values(
      teVoegen.map((a, i) => ({
        naam: a.naam,
        slug: slugify(a.naam, `${Date.now()}-${i}`),
        telefoon: a.telefoon ?? null,
        contactEmail: a.email ?? null,
        website: a.website ?? null,
        bron: 'import',
        wervingStatus: 'nieuw' as const,
        status: 'proef' as const,
      }))
    )
  }

  return {
    gevonden: bron.length,
    nieuw: teVoegen.length,
    overgeslagen: bron.length - teVoegen.length,
    toegevoegd: teVoegen.map((a) => ({ naam: a.naam, stad: a.stad })),
  }
}
