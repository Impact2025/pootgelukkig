# PootGelukkig — Marketing Website Plan

Publieke, lichte marketingwebsite naast de bestaande (donkere) app. Eén Next.js-app,
nieuwe `(marketing)` route group met eigen licht thema. Doelgroepen: adoptanten (B2C,
gratis) en asielen/dierenopvang (B2B, betalend via SaaS-abonnement).

Uitgangspunten: clean en professioneel, geen emoji's, lichte uitstraling, SEO op orde.
Alle teksten in het Nederlands. Bestaande tokens hergebruiken: amber `#f8aa25`, navy
`#33335c`, terracotta `#E2725B`, sage. Font: Plus Jakarta Sans.

---

## 1. Architectuur

Alles in de bestaande app onder een nieuwe route group zodat blog, AI-assistent en DB
worden hergebruikt en er één deploy blijft.

```
src/app/
├── (marketing)/                 # NIEUW — publiek, licht thema, geen auth
│   ├── layout.tsx               # Lichte layout: <div className="light"> + MarketingNav + Footer
│   ├── page.tsx                 # Home (hero + secties)
│   ├── over-ons/page.tsx        # Over ons
│   ├── werkwijze/page.tsx       # Werkwijze / hoe het werkt
│   ├── voor-asielen/page.tsx    # B2B landing (leidt naar prijzen)
│   ├── prijzen/page.tsx         # SaaS-prijzen voor asielen
│   ├── ai-assistent/page.tsx    # AI-assistent feature
│   ├── faq/page.tsx             # Uitgebreide FAQ
│   ├── kennisbank/
│   │   ├── page.tsx             # Kennisbank index (categorieën)
│   │   ├── [categorie]/page.tsx # Categorie-overzicht
│   │   └── [categorie]/[slug]/page.tsx  # Artikel
│   └── contact/page.tsx         # Contact / demo aanvragen
├── blog/                        # BESTAAND — visueel inlijven in marketing-stijl
├── sitemap.ts                   # NIEUW — dynamisch (blog + kennisbank)
├── robots.ts                    # NIEUW
└── page.tsx                     # WIJZIGEN — niet meer hard redirecten
```

### Routing-wijziging op `/`
Nu: `src/app/page.tsx` redirect altijd naar `/auth/login` of `/dashboard`.
Nieuw: `/` toont de marketing-home. Ingelogde gebruikers krijgen in de nav een knop
"Naar mijn dashboard"; geen harde redirect meer (anders is de site onvindbaar/onindexeerbaar
voor bezoekers). De app blijft op `/dashboard`, `/intake`, etc.

### Licht thema zonder de donkere app te raken
De root `<html className="dark">` blijft staan voor de app. De marketing-layout zet
expliciet een lichte scope (`className="light bg-[#f9fafb] text-[#33335c]"` + tokens),
zodat de donkere app ongemoeid blijft. Geen globale theme-omslag nodig.

### Gedeelde marketing-componenten
```
src/components/marketing/
├── MarketingNav.tsx     # Sticky lichte header, transparant op hero, mobiel menu
├── MarketingFooter.tsx  # Sitemap-links, juridisch, social, nieuwsbrief
├── Hero.tsx
├── Section.tsx          # Consistente sectie-wrapper (spacing/max-width)
├── FeatureCard.tsx
├── StepItem.tsx         # Genummerde werkwijze-stap
├── PricingCard.tsx
├── FaqAccordion.tsx     # Client component, toegankelijk (aria), met FAQ JSON-LD
├── Cta.tsx              # Herbruikbaar call-to-action blok
├── Testimonial.tsx
└── StatBadge.tsx
```

---

## 2. Pagina's en secties

### Home (`/`)
1. **Pro hero** — kop, subkop, twee CTA's ("Vind jouw match" voor adoptant,
   "Voor asielen" voor B2B). Rustig, veel witruimte, één sterk beeld of subtiele
   illustratie. Vertrouwensbalk eronder (aantal asielen / dieren / matches).
2. **Probleem → oplossing** — korte uitleg waarom matching op leefstijl beter werkt
   dan klassiek zoeken.
3. **Werkwijze (compact)** — 4 stappen met link naar volledige `/werkwijze`.
4. **AI-assistent teaser** — link naar `/ai-assistent`.
5. **Voor asielen teaser** — B2B blok dat naar `/prijzen` leidt.
6. **Social proof** — testimonials / logo's van aangesloten asielen.
7. **Laatste blogposts** — 3 meest recente uit de bestaande blog-DB.
8. **Afsluitende CTA**.

### Over ons (`/over-ons`)
- Het verhaal: bedacht door Maya van Munster (13), gebouwd door WeAreImpact.
- Missie: meer geslaagde, blijvende adopties; minder terugplaatsingen.
- Waarden, team, samenwerking met asielen. JSON-LD `Organization`.

### Werkwijze (`/werkwijze`)
Volledige flow met genummerde stappen: intake-gesprek → AI-matching (3 lagen, leesbaar
uitgelegd) → contact met asiel → adoptie/dossier → nazorg (3-3-3 regel). Per stap kort
en concreet. Sluit af met CTA naar intake.

### Voor asielen (`/voor-asielen`)
B2B-landing: wat het asiel krijgt (dashboard, wachtlijst, matching, berichten,
rapportage, medisch), tijdsbesparing, betere matches. Leidt naar `/prijzen` en `/contact`
(demo aanvragen).

### Prijzen (`/prijzen`) — SaaS voor asielen
Adoptanten zien hier expliciet: "Voor adoptanten is PootGelukkig gratis." De tabel is
B2B. Voorstel drie tiers (maandelijks, jaar = 2 maanden gratis):

| Tier | Voor wie | Indicatie | Kernfeatures |
|------|----------|-----------|--------------|
| **Start** | Klein asiel / pleegnetwerk | gratis of laag instap | basis dierbeheer, matching, beperkt aantal actieve dieren |
| **Groei** | Regulier asiel | midden | onbeperkt dieren, berichten, nazorg, medisch dossier, rapportage |
| **Landelijk** | Koepel / meerdere locaties | op aanvraag | meerdere locaties, SSO, prioriteit-support, API |

- Concrete bedragen volgen van jou; nu placeholders met duidelijke feature-matrix.
- Maand/jaar-toggle, FAQ-strip onderaan (facturatie, opzeggen, btw).
- JSON-LD `Product`/`Offer` per tier.

### AI-assistent (`/ai-assistent`)
Uitleg van de Claude-gedreven assistent: intake-gesprek, matchanalyse, nazorg-tips.
Hergebruik de bestaande `AIAssistentWidget` als live demo op deze pagina. Privacy/AI-
transparantie blok (wat de AI wel/niet doet, menselijke controle door asiel).

### FAQ uitgebreid (`/faq`)
Toegankelijke accordion, gegroepeerd per thema:
- Voor adoptanten (kosten, hoe matching werkt, na de match, nazorg)
- Voor asielen (aanmelden, prijzen, data-eigendom, overstappen)
- AI & privacy (hoe de AI werkt, AVG, dataopslag)
- Account & techniek
Elke vraag levert `FAQPage` JSON-LD voor rich results in Google.

### Blog (`/blog`) — bestaand
Reeds DB-backed (Drizzle, `blogPosts`) en licht gestyled. Acties: visueel gelijktrekken
met marketing-nav/footer, `Article` JSON-LD + OG-tags toevoegen, opnemen in sitemap.

### Kennisbank (`/kennisbank`)
Inhoudelijke gidsen, los van blog (blog = nieuws/verhalen, kennisbank = naslag).
Categorieën, bijv.: Eerste hulp bij adoptie, Hond, Kat, Gedrag, Gezondheid, Nazorg
(3-3-3). Index → categorie → artikel. Zoek/filter op categorie. `Article`/`HowTo`
JSON-LD waar passend.

**Content-bron kennisbank:** nieuwe DB-tabel `knowledge_articles` (analoog aan
`blogPosts`: titel, slug, categorie, inhoud, status, samenvatting, seo-velden) zodat
het via het bestaande admin-patroon te beheren is. Alternatief (sneller te starten):
MDX-bestanden in de repo. Voorstel: DB-tabel voor consistentie met blog en admin.

### Contact (`/contact`)
Demo-aanvraag voor asielen + algemeen contact. Formulier via bestaande Resend-mailflow.
JSON-LD `ContactPoint`.

---

## 3. SEO — concreet

- **Per-pagina metadata** via Next `Metadata` export: title, description, canonical,
  Open Graph, Twitter card. Eén `metadataBase` instellen.
- **`sitemap.ts`** — statische marketingroutes + dynamisch blog- en kennisbank-slugs
  uit de DB.
- **`robots.ts`** — alles index-baar behalve `/auth`, `/dashboard`, `/admin`, `/api`.
- **JSON-LD structured data** — `Organization` (over-ons/footer), `WebSite` +
  `SearchAction`, `FAQPage` (faq), `Article` (blog + kennisbank), `Product`/`Offer`
  (prijzen), `BreadcrumbList` (kennisbank).
- **OG-afbeeldingen** — `opengraph-image` via `next/og` (dynamisch per pagina/artikel).
- **Performance/Core Web Vitals** — server components by default, `next/image` met
  width/height, lettertype via `next/font` (preload, geen layout shift), minimale client-JS.
- **Semantiek & a11y** — één `<h1>` per pagina, logische heading-hiërarchie, alt-teksten,
  toegankelijke accordion (toetsenbord + aria), voldoende contrast op licht thema.
- **Canonical & taal** — `lang="nl"`, canonicals overal, schone slugs.
- **Interne links** — hero → werkwijze → ai-assistent → prijzen; blog ↔ kennisbank
  cross-links voor crawl-diepte en autoriteit.

---

## 4. Design-richtlijnen (licht, clean, pro)

- Achtergrond `#f9fafb`/wit, tekst navy `#33335c`, accenten amber `#f8aa25` en spaarzaam
  terracotta. Sage voor zachte vlakken.
- Veel witruimte, ruime sectiespacing, max content-breedte ~1200px, leesbreedte ~720px.
- Afgeronde hoeken (xl/2xl), subtiele schaduwen, dunne borders, geen drukke gradients.
- Eén accentkleur per sectie; rust boven decoratie. Geen emoji's; iconen via een nette
  line-icon set (bijv. lucide) consistent op stroke.
- Subtiele animaties (bestaande `fade-in`/`slide-up`), geen overdaad.
- Mobile-first; nette responsive nav met hamburger.

---

## 5. Database / content

- **Blog**: bestaand (`blogPosts`) hergebruiken.
- **Kennisbank**: nieuwe tabel `knowledge_articles` + Drizzle-migratie + admin-beheer
  (analoog aan blog), of MDX als snelle start.
- **Contact/demo**: opslaan en/of mailen via bestaande Resend-setup.
- Geen wijziging aan de app-data; marketing is grotendeels statisch + leest blog/kennisbank.

---

## 6. Implementatie in fasen

**Fase 1 — Fundament**
- `(marketing)` route group, lichte `layout.tsx`, `MarketingNav`, `MarketingFooter`.
- `/` ombouwen naar marketing-home (redirect verwijderen, dashboard-knop voor ingelogden).
- Basis SEO: `metadataBase`, `robots.ts`, `sitemap.ts`.

**Fase 2 — Kernpagina's**
- Home (hero + secties), Over ons, Werkwijze, Voor asielen, Prijzen.
- Herbruikbare componenten (Hero, Section, FeatureCard, StepItem, PricingCard, Cta).

**Fase 3 — Content & conversie**
- AI-assistent (met live widget), FAQ + accordion + JSON-LD, Contact/demo-formulier.
- Blog visueel inlijven + `Article` JSON-LD/OG.

**Fase 4 — Kennisbank**
- `knowledge_articles` tabel + migratie + admin, index/categorie/artikel-pagina's,
  cross-links met blog, sitemap-uitbreiding.

**Fase 5 — Polish & SEO-afronding**
- OG-images via `next/og`, alle JSON-LD, a11y- en Lighthouse-check, contrast, responsive QA.

---

## 7. Open punten (van jou)
- Concrete prijsbedragen per tier (Start/Groei/Landelijk) + maand/jaar.
- Definitieve teksten Over ons (verhaal Maya / WeAreImpact) en eventuele echte
  testimonials/asiel-logo's.
- Kennisbank-categorieën en eerste artikelen.
- Keuze kennisbank-bron: DB-tabel (aanbevolen) of MDX.
