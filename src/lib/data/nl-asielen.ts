/**
 * Samengestelde dataset van Nederlandse dierenasielen / dierenopvangcentra.
 *
 * Dit bestand is de BRON voor de asielen-import cron (`/api/cron/asielen-import`).
 * De cron leest deze lijst, zet nieuwe asielen in de database met
 * `wervingStatus: 'nieuw'` en wacht op handmatige goedkeuring voordat er een
 * uitnodigingsmail uitgaat (zie /admin/asielen-werving).
 *
 * ⚠️  BELANGRIJK — VERIFIEER VOOR VERZENDING
 * Deze gegevens (met name e-mailadressen) zijn een startset en kunnen verouderd
 * zijn. Omdat de uitnodigingsmail pas verstuurt ná handmatige goedkeuring in het
 * admin-paneel, controleer je daar per asiel het e-mailadres voordat je mailt.
 * Voeg gerust nieuwe asielen toe of corrigeer bestaande — de cron dedupliceert
 * op (naam + stad), dus dubbele invoer is veilig.
 */

export interface AsielSeed {
  naam: string
  stad: string
  regio: string // provincie
  adres?: string
  postcode?: string
  telefoon?: string
  email?: string
  website?: string
}

export const NL_ASIELEN: AsielSeed[] = [
  // ─── Noord-Holland ──────────────────────────────────────────────────────────
  {
    naam: 'Dierenopvangcentrum Amsterdam',
    stad: 'Amsterdam',
    regio: 'Noord-Holland',
    email: 'info@dierenasielamsterdam.nl',
    website: 'https://www.dierenasielamsterdam.nl',
  },
  {
    naam: 'Dierentehuis Crailo',
    stad: 'Hilversum',
    regio: 'Noord-Holland',
    email: 'info@dierentehuiscrailo.nl',
    website: 'https://www.dierentehuiscrailo.nl',
  },
  {
    naam: 'Dierenopvangcentrum Den Helder',
    stad: 'Den Helder',
    regio: 'Noord-Holland',
    email: 'info@dierenopvangdenhelder.nl',
    website: 'https://www.dierenopvangdenhelder.nl',
  },
  {
    naam: 'Dierenasiel Zaanstreek-Waterland',
    stad: 'Zaandam',
    regio: 'Noord-Holland',
    email: 'info@dierenasielzaandam.nl',
    website: 'https://www.dierenasielzaandam.nl',
  },
  {
    naam: 'Dierenopvang Kennemerland',
    stad: 'Zandvoort',
    regio: 'Noord-Holland',
    email: 'info@dierenopvangkennemerland.nl',
    website: 'https://www.dierenopvangkennemerland.nl',
  },

  // ─── Zuid-Holland ───────────────────────────────────────────────────────────
  {
    naam: 'Dierenasiel Rotterdam',
    stad: 'Rotterdam',
    regio: 'Zuid-Holland',
    email: 'info@dierenasielrotterdam.nl',
    website: 'https://www.dierenasielrotterdam.nl',
  },
  {
    naam: 'Haags Dierencentrum',
    stad: 'Den Haag',
    regio: 'Zuid-Holland',
    email: 'info@haagsdierencentrum.nl',
    website: 'https://www.haagsdierencentrum.nl',
  },
  {
    naam: 'Dierenopvangcentrum Delft',
    stad: 'Delft',
    regio: 'Zuid-Holland',
    email: 'info@dierenopvangcentrumdelft.nl',
    website: 'https://www.dierenopvangcentrumdelft.nl',
  },
  {
    naam: 'Dierentehuis Stevenshage',
    stad: 'Leiden',
    regio: 'Zuid-Holland',
    email: 'info@stevenshage.nl',
    website: 'https://www.stevenshage.nl',
  },
  {
    naam: 'Dierenasiel Dordrecht',
    stad: 'Dordrecht',
    regio: 'Zuid-Holland',
    email: 'info@dierenasieldordrecht.nl',
    website: 'https://www.dierenasieldordrecht.nl',
  },

  // ─── Utrecht ────────────────────────────────────────────────────────────────
  {
    naam: 'Dierenopvang Utrecht',
    stad: 'Utrecht',
    regio: 'Utrecht',
    email: 'info@dierenopvangutrecht.nl',
    website: 'https://www.dierenopvangutrecht.nl',
  },
  {
    naam: 'Dierenasiel Amersfoort',
    stad: 'Amersfoort',
    regio: 'Utrecht',
    email: 'info@dierenasielamersfoort.nl',
    website: 'https://www.dierenasielamersfoort.nl',
  },

  // ─── Noord-Brabant ──────────────────────────────────────────────────────────
  {
    naam: 'Dierenopvangcentrum Eindhoven',
    stad: 'Eindhoven',
    regio: 'Noord-Brabant',
    email: 'info@doce.nl',
    website: 'https://www.doce.nl',
  },
  {
    naam: 'Dierenasiel Den Bosch',
    stad: "'s-Hertogenbosch",
    regio: 'Noord-Brabant',
    email: 'info@dierenasieldenbosch.nl',
    website: 'https://www.dierenasieldenbosch.nl',
  },
  {
    naam: 'Dierenopvang Tilburg',
    stad: 'Tilburg',
    regio: 'Noord-Brabant',
    email: 'info@dierenopvangtilburg.nl',
    website: 'https://www.dierenopvangtilburg.nl',
  },
  {
    naam: 'Dierenasiel Breda',
    stad: 'Breda',
    regio: 'Noord-Brabant',
    email: 'info@dierenasielbreda.nl',
    website: 'https://www.dierenasielbreda.nl',
  },

  // ─── Gelderland ─────────────────────────────────────────────────────────────
  {
    naam: 'Dierenopvangcentrum Arnhem',
    stad: 'Arnhem',
    regio: 'Gelderland',
    email: 'info@dierenopvangarnhem.nl',
    website: 'https://www.dierenopvangarnhem.nl',
  },
  {
    naam: 'Dierenasiel Nijmegen',
    stad: 'Nijmegen',
    regio: 'Gelderland',
    email: 'info@dierenasielnijmegen.nl',
    website: 'https://www.dierenasielnijmegen.nl',
  },
  {
    naam: 'Dierenbescherming Apeldoorn',
    stad: 'Apeldoorn',
    regio: 'Gelderland',
    email: 'info@dierenopvangapeldoorn.nl',
    website: 'https://www.dierenopvangapeldoorn.nl',
  },

  // ─── Overijssel ─────────────────────────────────────────────────────────────
  {
    naam: 'Dierenasiel Zwolle',
    stad: 'Zwolle',
    regio: 'Overijssel',
    email: 'info@dierenasielzwolle.nl',
    website: 'https://www.dierenasielzwolle.nl',
  },
  {
    naam: 'Dierenopvang Enschede',
    stad: 'Enschede',
    regio: 'Overijssel',
    email: 'info@dierenopvangenschede.nl',
    website: 'https://www.dierenopvangenschede.nl',
  },

  // ─── Groningen ──────────────────────────────────────────────────────────────
  {
    naam: 'Dierenasiel Groningen',
    stad: 'Groningen',
    regio: 'Groningen',
    email: 'info@dierenasielgroningen.nl',
    website: 'https://www.dierenasielgroningen.nl',
  },

  // ─── Friesland ──────────────────────────────────────────────────────────────
  {
    naam: 'Dierenasiel De Wissel',
    stad: 'Leeuwarden',
    regio: 'Friesland',
    email: 'info@dierenasieldewissel.nl',
    website: 'https://www.dierenasieldewissel.nl',
  },

  // ─── Drenthe ────────────────────────────────────────────────────────────────
  {
    naam: 'Dierenasiel Assen',
    stad: 'Assen',
    regio: 'Drenthe',
    email: 'info@dierenasielassen.nl',
    website: 'https://www.dierenasielassen.nl',
  },

  // ─── Flevoland ──────────────────────────────────────────────────────────────
  {
    naam: 'Dierenasiel Almere',
    stad: 'Almere',
    regio: 'Flevoland',
    email: 'info@dierenasielalmere.nl',
    website: 'https://www.dierenasielalmere.nl',
  },

  // ─── Limburg ────────────────────────────────────────────────────────────────
  {
    naam: 'Dierenopvang Maastricht',
    stad: 'Maastricht',
    regio: 'Limburg',
    email: 'info@dierenopvangmaastricht.nl',
    website: 'https://www.dierenopvangmaastricht.nl',
  },
  {
    naam: 'Dierenasiel Roermond',
    stad: 'Roermond',
    regio: 'Limburg',
    email: 'info@dierenasielroermond.nl',
    website: 'https://www.dierenasielroermond.nl',
  },

  // ─── Zeeland ────────────────────────────────────────────────────────────────
  {
    naam: 'Dierenopvangcentrum Zeeland',
    stad: 'Middelburg',
    regio: 'Zeeland',
    email: 'info@dierenopvangzeeland.nl',
    website: 'https://www.dierenopvangzeeland.nl',
  },
]
