# ImpactOS

> AI-gestuurd platform voor het sociaal domein: minder bureaucratie, meer maatschappelijke impact.
> Gebouwd met Next.js 15, Neon PostgreSQL, Drizzle ORM en OpenRouter (model-agnostisch, default Claude).
> Een initiatief van WeAreImpact.

---

## Wat is ImpactOS?

ImpactOS helpt sociaal ondernemers, welzijnsstichtingen en zorgkwartiermakers om dossiers,
cliënten en begeleidingen op één plek te structureren, en zet vijf AI-collega's in om het
voorbereidende werk te doen — subsidieaanvragen, Wmo-rapportages, communicatie, vrijwilligerswerving
en een 24/7 webassistent. Alles wat een AI-collega voorbereidt landt als concept in een
goedkeuringswachtrij: niets vertrekt zonder een menselijke klik ("human-in-the-loop").

### De vijf AI-collega's

| Naam | Rol | Doet |
|------|-----|------|
| **Sam** | Fondsen & Subsidies | Concept-subsidieaanvragen, projectbegrotingen, fondsverantwoordingen |
| **Mila** | Impact & Verantwoording | Wmo-/SROI-rapportages en beleidssamenvattingen |
| **Conny** | Communicatie & Storytelling | Geanonimiseerde LinkedIn-artikelen, nieuwsbrieven, persberichten |
| **Bram** | Werving & Vrijwilligers | Screening, onboarding-checklists, retentieberichten |
| **Samen** | 24/7 Eerstelijns Support | Beantwoordt veelgestelde vragen van bezoekers, ook als embeddable widget |

---

## Snelle start

```bash
npm install
cp .env.example .env.local
# Vul DATABASE_URL, OPENROUTER_API_KEY, NEXTAUTH_SECRET, RESEND_API_KEY in
npm run db:generate && npm run db:migrate && npm run db:seed
npm run dev
```

`npm run db:seed` vult de database met een demo-organisatie ("Stichting Welzijn & Toekomst"),
enkele dossiers/cliënten en twee voorbeelditems in de goedkeuringswachtrij.

---

## Portalen

| Portaal | Pad | Voor |
|---------|-----|------|
| Organisatie-portaal | `/admin` | Dagelijkse operatie: dossiers, cliënten, wachtrij, AI Copilot |
| Management-portaal | `/management` | Platformbeheer: gebruikers, CRM, blog, rapportage |
| Publieke marketingsite | `/` (marketing-routegroep) | Homepage, tarieven, kennisbank, contact |
| Embeddable widget | `/widget?org=<slug>` | 24/7 chat-widget ("Samen") voor externe sites |

### Belangrijkste marketingroutes

| Pad | Doel |
|-----|------|
| `/` | Homepage |
| `/voor-organisaties` (+ `/start`) | B2B-landing en gratis aanmelden |
| `/werkwijze` | De ImpactOS-methode in vier stappen |
| `/tarieven` | Pakketten en losse modules |
| `/over-ons` | WeAreImpact, visie |
| `/faq` | Veelgestelde vragen (AVG, human-in-the-loop, AI-tegoed, implementatie) |
| `/contact` | Contactformulier + Doorbraak Sprint-intake |
| `/kennisbank`, `/blog` | Kennisartikelen en blog |

---

## AI-laag

- `src/lib/ai/client.ts` — OpenRouter client (model-agnostisch), verplicht gekoppeld aan een
  `organisatieId` voor kostentracking.
- `src/lib/ai/rollen/` — de vijf AI-collega's: definities, RAG-lite databasecontext en
  dynamische system-prompts per organisatie (via `ai_rollen_config`).
- `src/lib/ai/queue.ts` — `plaatsInQueue()`, de centrale helper die elke AI-generatie met
  status `pending` in `ai_content_queue` zet.
- Modelroutering: Claude 3.5 Haiku voor triage/screening/chat, Claude 3.5 Sonnet voor
  complexe schrijf- en analysetaken.

---

## Database (`src/lib/db/schema.ts`)

Kernentiteiten: `organisaties` (tenants), `dossiers`, `clienten`, `begeleidingen`,
`ai_rollen_config`, `ai_content_queue`, `ai_gebruik` (kostentracking). Zie het schema-bestand
voor het volledige model, inclusief CRM-, blog- en vrijwilligerstabellen.

---

## Project structuur

```
pootgelukkig/
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Publieke marketingsite
│   │   ├── admin/             # Organisatie-portaal (dossiers, cliënten, wachtrij, copilot)
│   │   ├── management/        # Platformbeheer
│   │   ├── widget/            # Embeddable "Samen"-chatwidget
│   │   ├── intake/            # Cliëntintake (staff-facing)
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── admin/             # Admin-UI primitives + navigatie
│   │   └── marketing/         # Marketing-UI primitives
│   ├── lib/
│   │   ├── db/                 # Schema + connectie + seed
│   │   ├── ai/                 # AI-rollen-engine + OpenRouter client
│   │   ├── kennisbank/          # content.ts (kennisbank-artikelen)
│   │   └── beheer/             # Statistieken/rapportage-helpers
│   └── scripts/                # Onderhouds- en importscripts
├── next.config.ts
└── .env.example
```

---

## Commando's

```bash
npm run dev                 # development
npm run build                # productie-build
npm run lint
npm test                     # node --test over src/**/*.test.ts

npm run db:generate          # drizzle migraties genereren
npm run db:migrate
npm run db:studio
npm run db:seed              # demo-data

vercel --prod                # deploy
```

---

## Contact

**Initiatief van:** WeAreImpact
**Contact:** Vincent van Munster — v.munster@weareimpact.nl
**Website:** www.impactos.nl
