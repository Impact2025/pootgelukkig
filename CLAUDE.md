# ImpactOS — Claude Code Instructies

## Wat is dit project?
ImpactOS is een AI-gestuurd B2B SaaS-platform voor sociaal ondernemers en zorgkwartiermakers
(welzijnsstichtingen, zorgkwartiermakers, gemeentelijke initiatieven). Een initiatief van
WeAreImpact. Missie: minder bureaucratie, meer maatschappelijke impact.

Deze repo (`pootgelukkig/`) is een getransformeerde kopie van het vorige product PootGelukkig
(een dieren-adoptieplatform) — de historische naam leeft nog voort in de mapnaam en in
sommige interne bestandsnamen (`asielen`-API, `AsielSeed`-types), maar de database, AI-laag
en portalen zijn volledig omgebouwd naar het sociaal-domein-domein. Waar je "asiel"/"dieren"/
"adoptie" tegenkomt in bestandsnamen of oude routes, gaat het conceptueel om
organisatie/dossier/begeleiding.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS — navy `#0F172A`/`#1E293B`, accent-blauw `#2563EB`/`#3B82F6`,
  zachtgrijs `#F8FAFC`. Font: Plus Jakarta Sans.
- **Database**: Neon (PostgreSQL) via Drizzle ORM
- **Auth**: NextAuth.js v5 (credentials provider, rol in de JWT: `adoptant` | `asiel` | `admin` —
  `asiel` en `admin` zijn de twee actieve ImpactOS-rollen: organisatie-medewerker resp.
  platformbeheerder. `adoptant` is een restant van het vorige product en heeft geen eigen portaal
  meer)
- **AI**: OpenRouter (niet de Anthropic SDK direct) — model-agnostisch. Haiku voor
  triage/screening/chat, Sonnet voor complexe schrijf-/analysetaken. Elke AI-generatie is
  verplicht gekoppeld aan een `organisatieId` voor kostentracking.
- **E-mail**: Resend + react-email templates
- **File storage**: Vercel Blob
- **Validatie**: Zod
- **Deployment**: Vercel (incl. cron jobs)

## Kernentiteiten (`src/lib/db/schema.ts`)

| Tabel | Betekenis |
|---|---|
| `organisaties` | B2B tenants (voorheen "asielen") — `id` is text/UUID, niet serial |
| `dossiers` | Zorg-/hulpverleningstrajecten (voorheen "dieren") — categorie: wmo/participatie/jeugd/reintegratie/overig |
| `clienten` | Hulpvragers/deelnemers |
| `begeleidingen` | Koppeling dossier ↔ cliënt (voorheen "adopties") |
| `ai_rollen_config` | Welke AI-collega's een organisatie heeft geactiveerd + optionele custom system-prompt |
| `ai_content_queue` | Human-in-the-loop wachtrij — status altijd `pending` bij aanmaak, nooit automatisch `approved` |
| `ai_gebruik` | Token-/kostentracking per organisatie (`kosten_euro` is numeric/string, geen number!) |

Overige tabellen (matches, gesprekken, medische_records, welzijn_logs, vrijwilligers, donoren,
crm_*, blog_*, coupons) zijn ongewijzigd qua tabelnaam maar verwijzen nu naar `organisaties`/
`dossiers` in plaats van naar de oude `asielen`/`dieren`.

`helpdesk_tickets` (Sprint 6): contactformulieren/web-intakes per organisatie, verplicht
`organisatie_id`. `blog_posts.organisatie_id` (Sprint 6, nullable): leeg = platformblog
(`/management/blog`), gevuld = artikel van de organisatie zelf (`/admin/blog`).

## Rollen & routing (`src/middleware.ts`)

Twee actieve rollen, elk met een eigen thuisroute:

| Rol | Thuisroute | Portaal |
|---|---|---|
| `asiel` | `/admin` | Organisatie-portaal (dossiers, cliënten, wachtrij, AI Copilot) |
| `admin` | `/management` | Platformbeheer |

`adoptant` heeft geen eigen portaal meer; middleware stuurt deze rol terug naar `/`.

Bij wijzigingen aan navigatie: `src/components/admin/nav.ts` is de **enige bron van waarheid**
voor sidebar, breadcrumbs, statuskleuren en de command palette (getest in
`src/__tests__/admin-nav.test.ts`).

## AI-rollen-engine (`src/lib/ai/`)

Vijf actieve AI-collega's, per organisatie aan/uit te zetten via `ai_rollen_config`
(`/management/ai-rollen`):

| Rol-id | Naam | Titel | Modelklasse |
|---|---|---|---|
| `fundraising` | Sam | Fondsen & Subsidies | Sonnet |
| `rapportage` | Mila | Impact & Verantwoording | Sonnet |
| `social` | Conny | Communicatie & Storytelling | Sonnet |
| `vrijwilligers` | Bram | Werving & Vrijwilligers | Haiku |
| `chat` | Samen | 24/7 Eerstelijns Webassistent | Haiku |

De asiel-specifieke rollen `foto`/Finn, `medisch`/Dokter en `evenementen`/Eva zijn
gedeactiveerd (verwijderd uit `AI_ROLLEN`, enum-waarden blijven in de DB voor compat).

- `client.ts` — OpenRouter client. `meta: AiMeta` (met verplichte `organisatieId` + `actie`) is
  **verplicht** op elke `chatCompletion`/`chatStream`-call.
- `queue.ts` — `plaatsInQueue()`: de centrale helper die AI-output wegschrijft naar
  `ai_content_queue`. Status is hardcoded op `'pending'`, niet instelbaar door de aanroeper —
  dit is de veiligheidsregel "niets vertrekt autonoom" letterlijk in code afgedwongen.
  Sam/Mila/Conny's uitgaande content gaat hier altijd doorheen.
- `rollen/context.ts` — RAG-lite: bouwt databasecontext per rol op basis van `organisatieId`.
- `rollen/sideEffect.ts` — generieke factory (`maakSideEffectRoute`) voor rol-endpoints onder
  `/api/admin/rollen/<rol>/<actie>`; injecteert de organisatie-specifieke `system_prompt` uit
  `ai_rollen_config` dynamisch in de base-prompt.

**Nieuwe AI-calls altijd via `client.ts`**, nooit rechtstreeks fetchen — anders mis je de
kostenlogging.

## Portalen

### 1. Organisatie-portaal (`/admin`)
Dashboard (incl. AI-verbruikswidget t.o.v. het €35 inbegrepen maandbudget) · AI Copilot ·
Dossiers (lijst + detail: status bewerken, veldlogs, AI-acties) · Cliënten · Wachtrij
(`/admin/content-queue`, human-in-the-loop review, gegroepeerd per rol) ·
Agenda & Planning (`/admin/agenda`, afspraken gescoped op organisatie_id) ·
Helpdesk & Inbox (`/admin/helpdesk`, contactformulieren/web-intakes uit `helpdesk_tickets`
met een door 'Samen' klaargezet conceptantwoord in de content-queue) ·
CRM & Relaties (`/admin/crm`, contacten bij gemeenten/fondsenverstrekkers/zorgpartners,
`crm_contacten` gescoped op organisatie_id — niet te verwarren met het ongescopede
WeAreImpact-eigen verkoop-CRM op `/management/crm`) ·
Social Media & PR (`/admin/social`, leest Conny's `ai_content_queue`-items met rol `social`) ·
Blog Beheer (`/admin/blog`, `blog_posts.organisatie_id` gevuld — leeg = het platformblog dat
via `/management/blog` beheerd wordt) · AI Rollen & Copilot (`/admin/ai-rollen`) · Instellingen.

### 2. Management (`/management`)
Gebruikers · CRM · Organisaties werving (cold-outreach import, zie `src/lib/data/nl-asielen.ts`
— momenteel **leeg**, zie het bestand zelf voor uitleg) · Rapportage (per dossier-categorie) ·
Blog-CMS · Coupons · AI-rollen activeren.

### 3. Publieke marketingsite (`src/app/(marketing)/`)
Homepage, `/voor-organisaties` (+ `/start` voor zelfaanmelding), `/werkwijze`, `/tarieven`,
`/over-ons`, `/faq`, `/contact` (incl. Doorbraak Sprint-intake), `/kennisbank`, `/blog`.
`/ai-assistent`, `/demo-aanvragen` en `/voor-asielen` zijn permanente redirects (zie
`next.config.ts`) naar resp. `/#ai-collegas`, `/contact?onderwerp=demo` en `/voor-organisaties`.

### 4. Embeddable widget (`/widget`)
Minimalistische chat-widget voor "Samen", insluitbaar via `<iframe src="/widget?org=<slug>">`
op externe sites (WordPress/Wix). API: `/api/widget/chat` (CORS-open, publiek).

## Achtergrondprocessen (`vercel.json`)
| Route | Schedule |
|---|---|
| `/api/cron/digest` | ma 8:00 — wekelijkse digest |
| `/api/cron/asielen-import` | 1e van de maand 6:00 — leest `nl-asielen.ts` (nu leeg) |
| `/api/cron/management-dag` | dagelijks 7:00 |
| `/api/cron/management-maand` | 1e van de maand 7:00 |

Cron-routes authenticeren zich met `Authorization: Bearer $CRON_SECRET`.
E-mailtemplates staan in `src/emails/` (react-email); zonder `RESEND_API_KEY` worden mails alleen
gelogd, niet verzonden. Alle verzendingen komen in `mail_log`.

## Beveiliging
- `src/lib/beheer/guard.ts` — `vereisAdmin()` in elke management-route (server-side, niet alleen
  middleware)
- `src/lib/rate-limit.ts` — in-memory rate limiter (per Vercel-instantie; vervang door Upstash
  Redis bij schaal)
- `src/lib/security/escape.ts` — escaping voor gebruikersinvoer in e-mails/HTML

## Omgevingsvariabelen
Zie `.env.example` voor de volledige, actuele lijst. Kort: `DATABASE_URL` ·
`DATABASE_URL_UNPOOLED` · `NEXTAUTH_SECRET` · `NEXTAUTH_URL` · `OPENROUTER_API_KEY` ·
`BLOB_READ_WRITE_TOKEN` · `RESEND_API_KEY` · `CRON_SECRET` · `MANAGEMENT_EMAIL` ·
`NEXT_PUBLIC_APP_URL` · `NEXT_PUBLIC_APP_NAME` · `MAINTENANCE_MODE`.

## Commando's
```powershell
npm run dev                # development
npm run build               # productie-build
npm run lint
npm test                    # node --test over src/**/*.test.ts

npm run db:generate         # drizzle migraties genereren
npm run db:migrate
npm run db:studio
npm run db:seed             # demo-organisatie + dossiers/cliënten/wachtrij-items

vercel --prod               # deploy
```

## Code Conventies
- Alle UI-tekst in het Nederlands, ook foutmeldingen (gebruiksvriendelijk)
- TypeScript strict mode (geen `any`)
- Server Components waar mogelijk; Client Components alleen voor interactie
- API routes returnen `{ data, error }` of `{ fout }` (mix van beide bestaat nog)
- Datum/tijd in NL-locale
- Zod voor input-validatie op API-routes
- Navigatie/breadcrumbs alleen via `src/components/admin/nav.ts`
- AI-calls alleen via `src/lib/ai/client.ts`, elke call heeft een `organisatieId`

## Openstaande punten
- `src/lib/data/nl-asielen.ts` is leeg — voor de organisaties-werving-cron is nieuwe, legitieme
  brondata nodig voor de doelgroep welzijnsstichtingen/zorgkwartiermakers (zie het bestand voor
  waarom de oude dierenasiel-dataset is verwijderd i.p.v. "omgezet").
  - **Actie van jou (V. van Munster):** een geverifieerde leadlijst aanleveren (bijv. via een
    licensed dataprovider, handmatig onderzoek of een export vanuit een brancheorganisatie).
    Ik kan geen realistische organisatienamen/adressen/e-mails verzinnen voor een lijst die
    uiteindelijk automatisch koude e-mails verstuurt.
- Nieuwe blog-content voor het sociaal domein moet nog geschreven worden (zie `PROJECT.md`).
- `ADMIN-PRO-PLAN.md` beschrijft een lopend admin-design-system-traject (Calm-componenten,
  `AdminBottomNav`, e.d.) — dit wordt elders actief uitgevoerd; niet overschrijven zonder de
  voortgang daar te checken.
- Rate limiting naar Redis/Upstash bij groei.
