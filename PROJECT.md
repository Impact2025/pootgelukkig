# PootGelukkig — Blog & Kennisbank Dashboard

## 📊 Content Totaal

| Type | Aantal | Status |
|------|--------|--------|
| Blog artikelen | 28 | Live ✅ |
| Kennisbank artikelen | 25 | Live ✅ |
| Marketing pagina's | 10 | Alle met schema ✅ |
| Sitemap URLs | 70+ | Dynamisch ✅ |
| KB Search | 1 component | Client-side ✅ |
| RSS feed | 1 endpoint | /blog/feed.xml ✅ |

## 🔬 SEO Status (28 jun 2026 — na audit)

| Check | Status |
|-------|--------|
| Blog schema | BlogPosting ✅ (was Article) |
| KB artikel schema | Article + FAQPage + HowTo ✅ |
| FAQ pagina | FAQPage schema ✅ |
| Meta descriptions KB | 150+ chars per categorie ✅ (was 45) |
| OG images alle pagina's | ✅ 15/15 (was 5/15) |
| OG default images | 2 stuks ✅ |
| Build | ✅ Schoon |

## 🌐 Live URLs

### Blog (28)
`https://www.pootgelukkig.nl/blog` — overzicht
`https://www.pootgelukkig.nl/blog/{slug}` — per artikel

### Kennisbank (25)
`https://www.pootgelukkig.nl/kennisbank` — overzicht met search
`https://www.pootgelukkig.nl/kennisbank/{cat}` — per categorie
`https://www.pootgelukkig.nl/kennisbank/{cat}/{slug}` — per artikel

### Marketing
`https://www.pootgelukkig.nl/voor-asielen` ✅ og:image
`https://www.pootgelukkig.nl/werkwijze` ✅ og:image
`https://www.pootgelukkig.nl/prijzen` ✅ og:image
`https://www.pootgelukkig.nl/over-ons` ✅ og:image
`https://www.pootgelukkig.nl/contact` ✅ og:image
`https://www.pootgelukkig.nl/faq` ✅ og:image

## 🗂️ KB Categorieën

| Categorie | Aantal | Doelgroep |
|-----------|--------|-----------|
| voorbereiding | 4 | adoptant |
| intake | 3 | adoptant |
| thuiskomst | 3 | adoptant |
| nazorg | 3 | adoptant |
| dashboard | 3 | asiel |
| matching | 3 | asiel |
| privacy-avg | 3 | asiel |
| hoe-het-werkt | 3 | algemeen |

## 🔐 Secrets & Config

- **IndexNow key:** d3b5c5b8a7e94f2e9c1a6f3d8b2e4c7a
- **Vercel:** vmunster-2243s-projects / pootgelukkig
- **GitHub:** Impact2025/pootgelukkig

## 🖼️ Cover Images

- Blog: 28/28 — `public/images/blog/*.jpg`
- KB: 2/25 — 23 missen (wacht op FAL_KEY)
  - Script klaar: `scripts/post-to-x.py` voor X/Twitter

## ✅ Afgerond deze sessie

- [x] SEO audit 15 pagina's — alle gaten gedicht
- [x] BlogPosting schema i.p.v. Article
- [x] og:image op álle 15 pagina's + 2 default OG beelden
- [x] KB meta descriptions 150+ chars per categorie
- [x] Toekomstige datums gefixt: 16 KB + 13 blog → jan t/m mei 2026
- [x] X/Twitter post script: `scripts/post-to-x.py`
- [x] Email lezen & versturen (POP3/SMTP): `scripts/mail.py`
- [x] Wekelijkse SEO health check cronjob (ma 9:00)

## 📋 Nog te doen

| # | Wat | Actie van jou | Actie van mij |
|---|-----|---------------|---------------|
| 1 | 23 KB cover beelden | FAL_KEY in `.env` zetten | Genereer + converteer alle 23 |
| 2 | LinkedIn WeAreImpact | Client ID + Secret + Access Token | Bouw post-script |
| 3 | Nieuwe blog content | Kies onderwerp | Schrijf + publiceer + post op X |
| 4 | Git deploy | — | Push + deploy naar Vercel |
| 5 | WeAreImpact email | Wil je ook hallo@weareimpact.nl? | Configureren |
