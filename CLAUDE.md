# PootGelukkig — Claude Code Instructies

## Wat is dit project?
PootGelukkig is een AI-gestuurd adoptieplatform dat asieldieren koppelt aan adoptiegezinnen in
Nederland. Bedacht door Maya van Munster (13 jaar), gebouwd door WeAreImpact. Live op
`https://www.pootgelukkig.nl`.

De app is inmiddels veel meer dan een matching-tool: het is een compleet SaaS-platform met vier
gescheiden portalen (adoptant, asiel, management, publieke marketingsite), acht AI-rollen die
asielwerk overnemen, een CRM voor asielenwerving en een blog/kennisbank met SEO.

Deze repo (`pootgelukkig/`) is de web-app. Zusterprojecten in de parent-map:
- `../pootgelukkig-mobile/` — React Native + Expo asiel-app (Android + iOS). **Draait nog volledig
  op `src/data/mockData.ts`**, nog niet aangesloten op deze API.
- `../stitch_pootgelukkig_smart_dashboard (5)/` — design-mockups.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + custom design tokens
- **Database**: Neon (PostgreSQL) via Drizzle ORM
- **Auth**: NextAuth.js v5 (credentials provider, rol in de JWT)
- **AI**: **OpenRouter** (niet de Anthropic SDK direct) — model-agnostisch, default
  `anthropic/claude-sonnet-4-5`. Verbruik wordt per call gelogd met eurokosten.
- **E-mail**: Resend + react-email templates
- **File storage**: Vercel Blob
- **Validatie**: Zod
- **Deployment**: Vercel (incl. cron jobs) · **GitHub**: Impact2025/pootgelukkig

## Design System

### Kleuren (bron: `tailwind.config.ts`)
```
Primary (amber):      #f8aa25   primary-dark: #e39207
Navy:                 #33335c
Terracotta accent:    #E2725B   terracotta-dark: #ee5b2b
Background dark:      #12122a
Background light:     #f9fafb
Sage:                 #9db99d   sage-dark: #3b543b   sage-bg: #E9EDC9
```

### Typografie
- Font: **Plus Jakarta Sans** (`font-display`), weights 400–800

### UI Regels
- Adoptant-view: mobile-first, max-width 430px, bottom navigation (iOS-stijl)
- Asiel- en management-portaal: light mode, sidebar + topbar + command palette
- Rounded corners: 2xl/3xl overal
- Safe-area utilities beschikbaar: `pb-safe`, `pt-safe`, `pl-safe`, `pr-safe`, `mb-safe`
- Alle UI-tekst in het **Nederlands**

## Rollen & routing (`src/middleware.ts`)

Drie rollen, elk met een eigen thuisroute:

| Rol | Thuisroute | Portaal |
|---|---|---|
| `adoptant` | `/dashboard` | Adoptant-app |
| `asiel` | `/admin` | Asielportaal |
| `admin` | `/management` | Platformbeheer |

De middleware bewaakt de scheiding: een adoptant die `/admin` opvraagt gaat naar `/dashboard`, een
asiel dat `/management` opvraagt gaat naar `/admin`, enzovoort. Verder geregeld in de middleware:
- **Publiek zonder login**: marketingroutes, `/blog/*`, `/pitch`, sitemap, robots, OG-images
- **Publieke API's**: `/api/register`, `/api/postcode`, `/api/cron`, `/api/coupons/valideer`,
  `/api/blog/agent-os`
- **Onderhoudsmodus**: `MAINTENANCE_MODE=1` stuurt alles naar `/onderhoud`

Bij wijzigingen aan navigatie: `src/components/admin/nav.ts` is de **enige bron van waarheid** voor
sidebar, breadcrumbs en command palette (en wordt getest in `src/__tests__/admin-nav.test.ts`).

## Functionaliteit per portaal

### 1. Adoptant (`/dashboard`, `/intake`, `/animals`, …)
- **Intake**: 10-staps leefstijlvragenlijst → AI bouwt het adopter-profiel
- **Dashboard**: matchkaarten met score; **matchbreakdown** per dier; feedback op matches
- **Zoeken** met filters, **favorieten**, dierprofiel met fotocarrousel
- **Chat** met het asiel per dier + **afspraak inplannen**
- **AI-assistent** inline bij een dier
- Na adoptie: **dossier** (documenten), **nazorg** met AI-gegenereerde dagtips (3-3-3-regel),
  **medische tijdlijn**
- Badges, welkomsttour, postcode-lookup

### 2. Asielportaal (`/admin`)
Dashboard · **AI Copilot** met dagbriefing · Dieren (CRUD, foto-upload, **AI dier-scan/intake** en
AI-verhaalgenerator) · Adopties (goedkeuren + **contract genereren**) · Afspraken · Berichten ·
Medisch + **welzijnslogs** · Wachtlijst · **Pleeggezinnen & pleegplaatsingen** · Instellingen.

### 3. AI-rollen (`src/lib/ai/rollen/`)
Acht benoemde AI-collega's, per asiel aan/uit te zetten via `/management/ai-rollen`
(tabel `ai_rollen_config`). Elke rol heeft `acties` met een eigen prompt; output kan via
`sideEffect.ts` in de database landen en komt in de **content-queue** ter goedkeuring.

| Rol-id | Naam | Titel |
|---|---|---|
| `social` | Conny | Communicatie & Social Media Manager |
| `fundraising` | Sam | Fundraising & Sponsor Manager |
| `vrijwilligers` | Bram | Vrijwilligers & Wervings Coach |
| `evenementen` | Eva | Event & Activiteiten Organisator |
| `medisch` | Dokter | Medisch / Welzijn Assistent |
| `foto` | Finn | Foto & Content Creator |
| `rapportage` | Mila | Rapportage & Insights Manager |
| `chat` | Samen | Chat Support voor Bezoekers & Vrijwilligers |

### 4. Management (`/management`)
Gebruikers · **CRM** (contacten, deals-board, activiteiten, mail) · **Asielenwerving** (import van
NL-asielen + uitnodigingsmails) · Rapportage met download · Content-queue · Blog-CMS met
AI-generatie · **Coupons** · AI-rollen activeren.

### 5. Publieke marketingsite (`src/app/(marketing)/`)
Homepage, werkwijze, voor-asielen (+ zelfaanmelding), prijzen, over-ons, FAQ, contact,
demo-aanvragen. Plus **blog** en **kennisbank** (8 categorieën, client-side search), RSS-feed,
dynamische sitemap, schema.org-markup (BlogPosting / FAQPage / HowTo) en OG-images per pagina.
Zie `PROJECT.md` voor de contentstand en SEO-audit.

## Achtergrondprocessen (`vercel.json`)
| Route | Schedule |
|---|---|
| `/api/cron/digest` | ma 8:00 — wekelijkse digest |
| `/api/cron/afspraken` | dagelijks 9:00 — afspraakherinneringen |
| `/api/cron/asielen-import` | 1e van de maand 6:00 |
| `/api/cron/management-dag` | dagelijks 7:00 |
| `/api/cron/management-maand` | 1e van de maand 7:00 |

Cron-routes authenticeren zich met `Authorization: Bearer $CRON_SECRET`.
E-mailtemplates staan in `src/emails/` (react-email); zonder `RESEND_API_KEY` worden mails alleen
gelogd, niet verzonden. Alle verzendingen komen in `mail_log`.

## Database (`src/lib/db/schema.ts`)
~36 Drizzle-tabellen. Kern: `users`, `adopter_profielen`, `asielen`, `dieren`, `matches`,
`gesprekken`, `berichten`, `adopties`, `medische_records`, `nazorg_dagen`, `favorieten`,
`afspraken`, `wachtlijst`, `welzijn_logs`, `pleeggezinnen`, `pleegplaatsingen`,
`wachtwoord_resets`. Platform: `ai_gebruik`, `mail_log`, `app_instellingen`, `crm_contacten`,
`crm_deals`, `crm_activiteiten`, `blog_categorieen`, `blog_posts`, `coupons`,
`coupon_inwisselingen`, `ai_rollen_config`, `vrijwilligers`, `sollicitaties`, `donoren`,
`fondsenwerving_campagnes`, `evenementen`, `evenement_shiften`, `ai_content_queue`.

## AI-laag (`src/lib/ai/`)
- `client.ts` — OpenRouter client (OpenAI-compatibel formaat), `chatCompletion` + `chatStream`.
  Vereist `OPENROUTER_API_KEY`. Ondersteunt tekst en afbeeldingen (voor de dier-scan).
- `pricing.ts` — prijstabel per model, rekent USD → EUR (koers 0.92). Gebruikt de echte `cost` van
  OpenRouter als die meekomt, anders een schatting.
- `usage.ts` — `logAiGebruik()` schrijft elke call naar `ai_gebruik`.
- `matching.ts` — matchingalgoritme (harde filters → compatibiliteitsscore 0-100 + NL-motivatie).
- `intake.ts` — verwerking van de 10 intakevragen naar een adopter-profiel.
- `rollen/` — de acht AI-rollen (`index.ts` = definities, `context.ts` = datacontext,
  `sideEffect.ts` = wat er met de output gebeurt).

**Nieuwe AI-calls altijd via `client.ts`**, nooit rechtstreeks fetchen — anders mis je de
kostenlogging.

## Beveiliging
- `src/lib/beheer/guard.ts` — `vereisAdmin()` in elke management-route (server-side, niet alleen
  middleware)
- `src/lib/rate-limit.ts` — in-memory rate limiter (per Vercel-instantie; vervang door Upstash
  Redis bij schaal)
- `src/lib/security/escape.ts` — escaping voor gebruikersinvoer in e-mails/HTML

## Omgevingsvariabelen
Zie `.env.example` voor de volledige, actuele lijst met uitleg. Kort:
`DATABASE_URL` · `DATABASE_URL_UNPOOLED` · `NEXTAUTH_SECRET` · `NEXTAUTH_URL` ·
`OPENROUTER_API_KEY` · `BLOB_READ_WRITE_TOKEN` · `RESEND_API_KEY` · `CRON_SECRET` ·
`MANAGEMENT_EMAIL` · `NEXT_PUBLIC_APP_URL` · `NEXT_PUBLIC_APP_NAME` · `DEMO_VIDEO_URL` ·
`MAINTENANCE_MODE`.

## Commando's
```powershell
npm run dev                # development
npm run build              # productie-build
npm run lint
npm test                   # node --test over src/**/*.test.ts

npm run db:generate        # drizzle migraties genereren
npm run db:migrate
npm run db:studio
npm run db:seed            # testdieren invullen
npm run db:import-asielen  # NL-asielen importeren

npm run test:beheer        # smoke-test management-portaal
npm run crm:asielen        # asielen in CRM zetten

vercel --prod              # deploy
```

## Code Conventies
- Alle UI-tekst in het Nederlands, ook foutmeldingen (gebruiksvriendelijk)
- TypeScript strict mode (geen `any`)
- Server Components waar mogelijk; Client Components alleen voor interactie
- API routes returnen `{ data, error }`
- Datum/tijd in NL-locale
- Zod voor input-validatie op API-routes
- Navigatie/breadcrumbs alleen via `src/components/admin/nav.ts`
- AI-calls alleen via `src/lib/ai/client.ts`

## Openstaande punten
- Mobiele app aansluiten op de echte API (nu nog `mockData.ts`)
- Rate limiting naar Redis/Upstash bij groei
- Zie `PROJECT.md` voor de contentbacklog (o.a. 23 ontbrekende kennisbank-covers)
- `ADMIN-PRO-PLAN.md` en `WEBSITE-PLAN.md` bevatten de bredere roadmap
