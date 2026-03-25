# PootGelukkig — Claude Code Instructies

## Wat is dit project?
PootGelukkig is een AI-gestuurde matching-webapp die asieldieren koppelt aan adoptiegezinnen in Nederland. Bedacht door Maya van Munster (13 jaar), gebouwd door WeAreImpact. De app werkt als een lifestyle-matching platform: adoptanten beantwoorden vragen over hun leefstijl, en de AI koppelt hen aan het meest passende dier.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + custom design tokens
- **Database**: Neon (PostgreSQL) via Drizzle ORM
- **Auth**: NextAuth.js v5 (credentials + magic link)
- **AI**: Anthropic Claude API (matching + intake chatbot)
- **File storage**: Vercel Blob
- **Deployment**: Vercel
- **Version control**: GitHub

## Design System (EXACT overnemen uit mockups)

### Kleuren
```
Primary (neon groen): #13ec13
Background dark:      #102210
Background light:     #f6f8f6
Terracotta accent:    #E2725B / #ee5b2b
Sage groen:           #9db99d
Tekst donker:         #102210
```

### Typografie
- Font: **Plus Jakarta Sans** (Google Fonts)
- Weights: 400, 500, 600, 700, 800

### UI Regels
- Dark mode is standaard voor adopters
- Light mode voor asiel-dashboard
- Rounded corners: 2xl/3xl overal
- Glass cards: `backdrop-blur-md bg-white/5`
- Bottom navigation: iOS-stijl, fixed bottom
- Mobile-first: max-width 430px voor adoptant-view
- Alle tekst in het NEDERLANDS

## Project Structuur
```
src/
├── app/
│   ├── layout.tsx           # Root layout (font, providers)
│   ├── page.tsx             # Landing / redirect
│   ├── globals.css          # Design tokens + base styles
│   ├── dashboard/           # Adoptant home - match cards
│   ├── intake/              # AI intake gesprek (stap-voor-stap)
│   ├── animals/[id]/        # Dierprofielpagina met match-analyse
│   ├── chat/[id]/           # Chat met asiel over specifiek dier
│   ├── dossier/             # Documenten na adoptie
│   ├── nazorg/              # Post-adoptie begeleiding (3-3-3 regel)
│   ├── auth/                # Login / registratie
│   ├── admin/               # Asiel dashboard (apart design)
│   └── api/                 # API routes
│       ├── animals/         # CRUD dieren
│       ├── matches/         # Match berekening
│       ├── intake/          # AI intake verwerking
│       ├── chat/            # Berichten opslaan
│       └── medical/         # Medische tijdlijn
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx    # iOS-stijl navigatie
│   │   └── TopBar.tsx       # App header
│   ├── animals/
│   │   ├── AnimalCard.tsx   # Match kaart (dashboard)
│   │   └── AnimalProfile.tsx # Volledig dierenprofiel
│   ├── intake/
│   │   └── IntakeChat.tsx   # Stap-voor-stap vragenlijst
│   ├── dashboard/
│   │   └── MatchStats.tsx   # Match profiel widget
│   ├── chat/
│   │   └── MessageBubble.tsx
│   └── ui/
│       ├── MatchBadge.tsx   # "94% Match" badge
│       ├── PersonalityTag.tsx
│       └── MedicalItem.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts         # Neon/Drizzle connectie
│   │   └── schema.ts        # Database schema
│   ├── ai/
│   │   ├── matching.ts      # Claude matching logica
│   │   └── intake.ts        # AI intake verwerking
│   └── utils.ts             # Helpers
└── types/
    └── index.ts             # TypeScript types
```

## Database Schema (Drizzle + Neon PostgreSQL)

De volgende tabellen zijn aangemaakt via `src/lib/db/schema.ts`:

- **users** — adoptanten (id, naam, email, wachtwoord_hash, stad, profiel_voltooid)
- **adopter_profiles** — leefstijlprofiel na intake (woning_type, tuin, activiteit_niveau, kinderen, andere_dieren, werkuren, ervaring)
- **shelters** — asielen (id, naam, stad, regio, contactpersoon, email)
- **animals** — dieren (id, naam, soort, ras, leeftijd, geslacht, foto_url, beschrijving, gedragsprofiel JSON, medisch_paspoort JSON, asiel_id, status)
- **matches** — berekende matches (user_id, animal_id, score, analyse_tekst, created_at)
- **conversations** — chat threads (user_id, animal_id, shelter_id)
- **messages** — chatberichten (conversation_id, verzender_type, inhoud, created_at)
- **adoptions** — vastgelegde adopties (user_id, animal_id, datum, status)
- **medical_records** — medische tijdlijn per dier (animal_id, type, datum, beschrijving, status)
- **aftercare_days** — nazorg dagboek (adoption_id, dag_nummer, tips, checklist)

## Belangrijke API Routes

### POST /api/intake
- Ontvangt antwoorden van de intake stap-voor-stap chat
- Gebruikt Claude API om gedragsprofiel te analyseren
- Slaat adopter_profile op in database
- Geeft eerste matches terug

### POST /api/matches/calculate
- Input: adopter_profile + lijst van animals
- Gebruikt Claude API om compatibiliteitsscore te berekenen per dier
- Returnt gesorteerde lijst met score + motivatie tekst

### GET /api/animals/[id]/match-analysis
- Geeft gedetailleerde match-analyse voor één dier t.o.v. ingelogde gebruiker
- Genereert AI-tekst over waarom het een match is

### POST /api/chat/[conversationId]/messages
- Slaat berichten op
- Stuurt notificatie naar asiel

### GET /api/nazorg/[adoptionId]/day/[dag]
- Haalt dagelijkse tips op voor specifieke dag na adoptie
- Genereert AI-tips op basis van het specifieke dier

## AI Matching Logica (src/lib/ai/matching.ts)

Het matching algoritme werkt in 3 lagen:

**Laag 1: Harde filters** (score = 0 als niet voldaan)
- Allergie-vereisten
- Diersoort voorkeur
- Verbod op grote honden in appartement zonder tuin

**Laag 2: Compatibiliteitsscore (0-100)** via Claude prompt:
```
Geef een compatibiliteitsscore (0-100) voor:
Adopter: [profiel data]
Dier: [gedragsprofiel]
Geef ook een Nederlandse motivatietekst van 2 zinnen.
Returneer ALLEEN JSON: {"score": 94, "analyse": "..."}
```

**Laag 3: Lerende gedragslaag** (later)
- Leert van succesvolle adopties

## Intake Vragen (10 stappen)

1. Woningtype: Appartement / Huis met tuin / Boerderij
2. Gezinssamenstelling: Alleenwonend / Stel / Gezin met kinderen
3. Activiteitsniveau: Couch potato / Matig actief / Heel actief
4. Werkuren thuis: Altijd thuis / Deels / Weinig thuis
5. Andere dieren: Geen / Honden / Katten / Meerdere
6. Ervaring met dieren: Geen / Beetje / Veel
7. Budget voor dierenarts: Beperkt / Normaal / Ruim
8. Allergiën: Nee / Ja (hond) / Ja (kat) / Ja (beide)
9. Diersoort voorkeur: Hond / Kat / Vogel / Klein dier / Maakt niet uit
10. Leeftijdsvoorkeur dier: Pup/Kitten / Jong / Volwassen / Senior

## Omgevingsvariabelen (.env.local)

```env
# Database
DATABASE_URL="postgresql://..."          # Neon connection string
DATABASE_URL_UNPOOLED="postgresql://..."  # Voor migraties

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Vercel Blob (foto uploads)
BLOB_READ_WRITE_TOKEN="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Setup Instructies

### 1. Dependencies installeren
```powershell
cd pootgelukkig
npm install
```

### 2. Database opzetten (Neon)
- Maak gratis account op neon.tech
- Maak nieuwe database aan: "pootgelukkig"
- Kopieer connection string naar .env.local

### 3. Database migreren
```powershell
npm run db:generate
npm run db:migrate
npm run db:seed    # Vult test-dieren in
```

### 4. Development starten
```powershell
npm run dev
```

### 5. Deployen naar Vercel
```powershell
vercel --prod
```

## Code Conventies

- Alle UI-tekst in het Nederlands
- TypeScript strict mode (geen `any`)
- Server Components waar mogelijk, Client Components alleen voor interactie
- API routes returnen altijd `{ data, error }` structuur
- Datum/tijd in Nederland formaat (NL-nl locale)
- Foutmeldingen zijn gebruiksvriendelijk in het Nederlands

## Huidige Status

✅ Project structuur opgezet
✅ Design tokens gedefinieerd
✅ Database schema aangemaakt
✅ Basis layouts en navigatie
✅ Dashboard pagina met mock data
✅ Dierenprofiel pagina
✅ Intake chat component
✅ Chat met asiel pagina
🔄 AI matching integratie (Anthropic)
🔄 Authenticatie (NextAuth)
🔄 Echte database queries
⬜ Asiel admin dashboard
⬜ Foto upload (Vercel Blob)
⬜ Nazorg module
⬜ Medische tijdlijn
⬜ Push notificaties
