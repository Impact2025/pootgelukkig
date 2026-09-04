/**
 * Bronbestand voor de organisaties-import cron (`/api/cron/asielen-import`).
 *
 * De cron leest deze lijst, zet nieuwe organisaties in de database met
 * `wervingStatus: 'nieuw'` en wacht op handmatige goedkeuring voordat er een
 * uitnodigingsmail uitgaat (zie /management/asielen-werving).
 *
 * ⚠️  LEEG GEMAAKT (ImpactOS-migratie)
 * Dit bestand bevatte voorheen een echte dataset van ~1340 Nederlandse
 * dierenasielen (naam, adres, telefoon, e-mailadres) — bedoeld om die
 * organisaties uit te nodigen voor het vorige product (PootGelukkig, een
 * huisdier-adoptieplatform). ImpactOS richt zich op een ander type
 * organisatie (welzijnsstichtingen, zorgkwartiermakers, gemeentelijke
 * initiatieven), dus die dataset is hier bewust verwijderd in plaats van
 * te worden "omgezet": de cron verstuurt uiteindelijk echte koude
 * e-mails naar de adressen in deze lijst, en het zou onjuist zijn om
 * verzonnen organisaties te verzinnen en die als echte leads te
 * presenteren.
 *
 * Vul deze lijst met een legitieme, geverifieerde brondata voor de nieuwe
 * doelgroep (bijv. een licensed leadlijst, handmatig onderzoek, of een
 * export vanuit een brancheorganisatie) voordat je de import-cron opnieuw
 * activeert. Controleer per organisatie het e-mailadres in het
 * werving-scherm voordat je uitnodigt — de cron dedupliceert op naam.
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

export const NL_ASIELEN: AsielSeed[] = []
