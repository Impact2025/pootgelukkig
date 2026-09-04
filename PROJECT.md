# ImpactOS — Content status

Korte stand van zaken voor de publieke content-laag (marketing, kennisbank, blog). Zie
`README.md` voor de algemene projectbeschrijving en architectuur.

## Kennisbank

3 categorieën, 3 artikelen (`src/lib/kennisbank/content.ts`) — gericht op sociaal ondernemers en
zorgkwartiermakers:

| Categorie | Artikel |
|-----------|---------|
| Fondsen & subsidies | Hoe stichtingen subsidieaanvragen 40% sneller afronden met AI |
| Impact & verantwoording | Verantwoorden zonder buikpijn: Wmo- en gemeentelijke rapportages |
| Vrijwilligers & maatjes | Vrijwilligers werven en behouden: de kracht van de Geluksmonitor |

De statische data staat volledig in `content.ts` — geen database nodig voor de kennisbank.

## Blog

De blog draait op de `blog_posts`-tabel (database, CMS in `/management/blog`) en bevat op dit
moment geen ImpactOS-content — de oude PootGelukkig-artikelen zijn niet migreerbaar (ander
onderwerp/domein) en zijn niet automatisch verwijderd uit een eventuele bestaande database.
Nieuwe artikelen voor sociaal-domein-onderwerpen moeten nog geschreven en gepubliceerd worden.

## Nog te doen

- Blog-content voor het sociaal domein schrijven en publiceren.
- Cover images voor de 3 kennisbank-artikelen (`public/images/kennisbank/`) — nog niet aangemaakt.
- Marketingpagina's `/faq`, `/werkwijze`, `/over-ons`, `/voor-organisaties`, `/tarieven`, homepage
  en contact zijn bijgewerkt naar ImpactOS (zie git-geschiedenis); overige marketingpagina's
  (bijv. blog/kennisbank-overzichtspagina's zelf) zijn ongemoeid qua copy, alleen qua kleurstijl.
