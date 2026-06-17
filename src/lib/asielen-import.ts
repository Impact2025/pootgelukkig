import { db } from './db'
import { asielen } from './db/schema'
import { NL_ASIELEN, type AsielSeed } from './data/nl-asielen'

export interface ImportResultaat {
  gevonden: number   // aantal asielen in de bron
  nieuw: number      // nieuw toegevoegd aan de database
  overgeslagen: number // bestond al (dedupe)
  toegevoegd: Array<{ naam: string; stad: string }>
}

// Normaliseer naam+stad voor deduplicatie (case/spatie-ongevoelig)
function sleutel(naam: string, stad: string): string {
  return `${naam}|${stad}`.toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * Leest de samengestelde asielen-lijst en voegt onbekende asielen toe aan de
 * database. Bestaande asielen (zelfde naam + stad) worden ongemoeid gelaten,
 * zodat handmatig gecorrigeerde gegevens niet overschreven worden.
 *
 * Nieuwe asielen krijgen `bron: 'import'` en `wervingStatus: 'nieuw'`, zodat ze
 * in het werving-overzicht verschijnen en pas na goedkeuring een mail krijgen.
 */
export async function importeerAsielen(bron: AsielSeed[] = NL_ASIELEN): Promise<ImportResultaat> {
  const bestaande = await db
    .select({ naam: asielen.naam, stad: asielen.stad })
    .from(asielen)

  const bestaandeSleutels = new Set(bestaande.map((a) => sleutel(a.naam, a.stad)))

  // Dedupe ook binnen de bron zelf
  const gezien = new Set<string>()
  const teVoegen = bron.filter((a) => {
    const s = sleutel(a.naam, a.stad)
    if (bestaandeSleutels.has(s) || gezien.has(s)) return false
    gezien.add(s)
    return true
  })

  if (teVoegen.length > 0) {
    await db.insert(asielen).values(
      teVoegen.map((a) => ({
        naam: a.naam,
        stad: a.stad,
        regio: a.regio,
        adres: a.adres ?? null,
        postcode: a.postcode ?? null,
        telefoon: a.telefoon ?? null,
        email: a.email ?? null,
        website: a.website ?? null,
        actief: true,
        bron: 'import',
        wervingStatus: 'nieuw' as const,
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
