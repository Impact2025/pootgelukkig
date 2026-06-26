# 🐾 PootGelukkig — Wereldklasse Adoptieplatform

> AI-gestuurde dieren-adoptie matching. Bedacht door Maya van Munster (13 jaar).
> Gebouwd met Next.js 15, Neon PostgreSQL, Drizzle ORM, Anthropic Claude AI.
> Initiatief van WeAreImpact.

---

## 📊 Dashboard — Huidige Status

| Onderdeel | Status | Details |
|-----------|--------|---------|
| **Blog** | ✅ 28 artikelen | Adoptanten (15), Asielen (10), Pootgelukkig (3) |
| **Kennisbank** | ✅ 25 artikelen | 8 categorieën, min. 3 per cat |
| **KB Cover images** | ⚠️ 2/25 | Gateway 402 — hervatten met FAL_KEY |
| **Marketing schema's** | ✅ 6/6 pagina's | WebSite, Product, ContactPoint |
| **Blog rich results** | ✅ 28/28 | Article + BreadcrumbList |
| **FAQPage schema** | ✅ 13 blog + 6 KB artikelen | Automatische detectie via headings |
| **RSS feed** | ✅ /blog/feed.xml | Via rewrite naar /blog/rss |
| **KB Search** | ✅ Client-side | Debounce, category icons |
| **Homepage blog** | ✅ Laatste 3 posts | Met cover images |
| **Sitemap** | ✅ 70+ URLs | Blog, KB, statisch, marketing |
| **IndexNow** | ✅ Key: d3b5c5b8a7e94f2e9c1a6f3d8b2e4c7a | |

---

## 🚀 Snelle Start

```bash
npm install
cp .env.example .env.local
# Vul DATABASE_URL, ANTHROPIC_API_KEY, NEXTAUTH_SECRET in
npm run db:generate && npm run db:migrate && npm run db:seed
npm run dev
```

---

## 🗺️ Site Architectuur

### Marketing pagina's (statisch)

| Pad | Doel | Schema | Interne links |
|-----|------|--------|---------------|
| `/` | Homepage | Organization+WebSite (layout) | 3 blog posts |
| `/blog` | Blog overzicht | CollectionPage | — |
| `/blog/[slug]` | Blog artikel | Article + BreadcrumbList + FAQPage/HowTo | Gerelateerd |
| `/kennisbank` | KB overzicht | — | — |
| `/kennisbank/[cat]` | KB categorie | — | Cover images per artikel |
| `/kennisbank/[cat]/[slug]` | KB artikel | Article + BreadcrumbList + FAQPage/HowTo | Gerelateerde cats |
| `/voor-asielen` | B2B landing | WebSite | 5 asiel-blog links |
| `/werkwijze` | Hoe het werkt | WebSite | 4 blog + 1 KB |
| `/prijzen` | Prijzen | Product schema | 4 blog links |
| `/over-ons` | Over ons | WebSite | 4 blog links |
| `/contact` | Contact | ContactPoint | — |
| `/faq` | FAQ | FAQPage | — |
| `/intake` | Intake start | — | — |

### App pagina's (authenticated)

| Pad | Doel |
|-----|------|
| `/dashboard` | Hoofdscherm AI matches |
| `/intake` | Stap-voor-stap intake |
| `/animals/[id]` | Dierenprofiel + match analyse |
| `/chat/[id]` | Chat met asiel |
| `/dossier` | Documenten na adoptie |
| `/nazorg` | Post-adoptie begeleiding |
| `/medical/[id]` | Medische tijdlijn |

---

## 📝 Blog — 28 Artikelen

### Adoptanten (15 artikelen)
- Hond adopteren complete gids, Kat adopteren complete gids
- Wat kost een huisdier echt?, Senior kat adopteren
- Kinderen en een asieldier, Puppy adopteren
- Angstige hond adopteren, Twee katten adopteren
- Buitenkat of binnenkat, Herplaatser vs asielhond
- Verlatingsangst herkennen, Konijn adopteren
- Voeding voor asieldieren, Kennismakingsprotocol
- Toekomst van asieladopties

### Asielen (10 artikelen)
- Werkdruk in asielen, Administratieve lasten 30% verlagen
- Capaciteitsmanagement, Diergedrag vastleggen
- Hoe AI-matching werkt, Retourpercentage verlagen
- Vrijwilligerstekort, Medische dossiers digitaliseren
- Subsidies voor asielen, Impactrapportage
- Casestudy: asiel plaatst 40% meer

### Pootgelukkig (3 artikelen)
- Van bestuurskamer naar startup
- Hoe AI-matching werkt (transparantie)
- Integratie asiel-workflow

### Blog features
- Cover images op alle 28 artikelen ✅
- FAQPage schema op 13 artikelen
- HowTo schema op 3 artikelen
- Categorie filter (Adoptanten/Asielen/Pootgelukkig)
- Gerelateerde artikelen, social share, auteur block
- RSS feed op `/blog/feed.xml`

---

## 📚 Kennisbank — 25 Artikelen

| Categorie | Artikelen | Doelgroep |
|-----------|-----------|-----------|
| Voorbereiding | 4 | Adoptant |
| Intake | 3 | Adoptant |
| Thuiskomst | 3 | Adoptant |
| Nazorg | 3 | Adoptant |
| Dashboard | 3 | Asiel |
| Matching | 3 | Asiel |
| Privacy/AVG | 3 | Asiel |
| Hoe het werkt | 3 | Algemeen |

### KB features
- Cover images op artikelpagina en categorie-overzicht
- Client-side search met debounce
- FAQPage + HowTo detectie via `analyseerInhoud()`
- ToC sidebar (>2 headings, sticky op lg+)
- Feedback widget ("Was dit artikel nuttig?")
- Gerelateerde categorieën op basis van doelgroep
- Statische data (géén DB) — snel, betrouwbaar

---

## 🏷️ Schema.org Markup

Alle pagina's hebben per-pagina ld+json schema. Geen gedeelde layout — elke pagina definieert zijn eigen schema-object.

| Pagina | Schema type(s) |
|--------|----------------|
| Layout (alle) | Organization + WebSite |
| Blog artikel | Article + BreadcrumbList + FAQPage/HowTo |
| Blog overzicht | CollectionPage |
| KB artikel | Article + BreadcrumbList + FAQPage/HowTo |
| Voor-asielen | WebSite (per-pagina) |
| Werkwijze | WebSite (per-pagina) |
| Prijzen | Product schema + WebSite |
| Over-ons | WebSite (per-pagina) |
| Contact | ContactPoint + WebSite |
| FAQ | FAQPage |

**Inspectie:** elk artikel heeft `curl -s <url> | grep -c "application/ld+json"` → 2 (artikel + breadcrumb) of 3 (met FAQPage/HowTo)

---

## 🎨 Design Tokens

| Token | Waarde | Gebruik |
|-------|--------|---------|
| Navy | `#33335c` | Headings, CTA achtergrond |
| Terracotta | `#E2725B` | CTA buttons, hover links |
| Terracotta Dark | `#ee5b2b` | Hover states |
| Goud (primary) | `#f8aa25` / `#e39207` | Icon badges, accenten |
| Sage | `#9db99d` / `#3b543b` | Subtekst, tinten |
| Bg Dark | `#12122a` | CTA block |
| Bg Light | `#f9fafb` | Kaarten, widgets |
| Font | Plus Jakarta Sans | 800 extrabold headings, 400-700 body |

---

## ⚙️ Project Structuur

```
pootgelukkig/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Marketing pages
│   │   │   ├── blog/              # Blog overzicht + [slug]
│   │   │   ├── kennisbank/        # KB overzicht + [cat] + [cat]/[slug]
│   │   │   ├── voor-asielen/      # B2B landing
│   │   │   ├── werkwijze/         # Hoe het werkt
│   │   │   ├── prijzen/           # Prijzen
│   │   │   ├── over-ons/          # Over ons
│   │   │   ├── contact/           # Contact
│   │   │   ├── faq/               # FAQ
│   │   │   └── page.tsx           # Homepage
│   │   ├── dashboard/             # App dashboard
│   │   ├── intake/                # Intake flow
│   │   ├── animals/[id]/          # Dierprofiel
│   │   ├── chat/[id]/             # Chat
│   │   ├── sitemap.ts             # Dynamische sitemap
│   │   └── api/                   # API routes
│   ├── components/
│   │   ├── marketing/             # UI components (Section, CtaBlock, etc.)
│   │   └── kennisbank/            # KennisbankSearch
│   ├── lib/
│   │   ├── db/                    # Schema + connectie + seed
│   │   ├── kennisbank/            # content.ts (25 artikelen, helpers)
│   │   └── ai/                    # Anthropic matching
│   └── scripts/                   # Content upload tools
├── public/
│   ├── images/
│   │   ├── blog/                  # 28 cover images
│   │   └── kennisbank/            # 2/25 cover images (FAL-key pending)
├── next.config.ts
└── .env.example
```

---

## 🛠️ Handige Commando's

```bash
# Lokale build
npx next build

# Deploy naar Vercel
git add -A && git commit -m "..." && git push origin main

# Vercel deploy status
vercel list --prod
vercel inspect <url> --logs   # build logs bij error

# IndexNow ping nieuwe URLs
curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{"host":"www.pootgelukkig.nl","key":"d3b5c5b8a7e94f2e9c1a6f3d8b2e4c7a","keyLocation":"https://www.pootgelukkig.nl/d3b5c5b8a7e94f2e9c1a6f3d8b2e4c7a.txt","urlList":["https://www.pootgelukkig.nl/..."]}'

# KB per categorie check
python3.11 -c "
import re
from collections import Counter
with open('src/lib/kennisbank/content.ts') as f: content = f.read()
cats = re.findall(r\"categorieSlug: '([^']+)'\", content)
for c, n in sorted(Counter(cats).items()):
    print(f'  {c}: {n} artikelen')
"

# Meta description check
curl -s https://www.pootgelukkig.nl/blog/<slug> | grep -oP 'name="description" content="[^"]+' | head -1

# Rich results check
curl -s <url> | python3.11 -c "
import sys,json,re
for s in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', sys.stdin.read(), re.DOTALL):
    try:
        d=json.loads(s)
        t=d.get('@type','')
        if t in ('FAQPage','HowTo','Article','BreadcrumbList','Product','ContactPoint'):
            print(f'{t}: found')
    except: pass
"
```

---

## 🔜 Nog te doen

- [ ] 23 KB cover images genereren (FAL gateway fixen)
- [ ] Content uitbreiden blog naar 40+ artikelen
- [ ] Interne linking matrix optimaliseren
- [ ] GSC prestaties monitoren na IndexNow ping

---

## 📞 Contact

**Idee:** Maya van Munster
**Uitvoering:** WeAreImpact BV
**Directeur:** Vincent van Munster
**Email:** v.munster@weareimpact.nl
**Website:** www.pootgelukkig.nl
