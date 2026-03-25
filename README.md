# 🐾 PootGelukkig — Setup Gids

> AI-gestuurde dieren-adoptie matching. Bedacht door Maya van Munster (13 jaar).  
> Gebouwd met Next.js 15, Neon PostgreSQL, Drizzle ORM, Anthropic Claude AI.

---

## ⚡ Snelle Start (PowerShell)

### Stap 1 — GitHub repo aanmaken
```powershell
# Maak nieuwe map en initialiseer git
New-Item -ItemType Directory -Path "pootgelukkig"
Set-Location pootgelukkig
git init
git remote add origin https://github.com/JOUW-USERNAME/pootgelukkig.git
```

### Stap 2 — Bestanden kopiëren
Kopieer alle bestanden uit dit pakket naar de `pootgelukkig` map.

### Stap 3 — Dependencies installeren
```powershell
npm install
```

### Stap 4 — Omgevingsvariabelen instellen
```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Vul in `.env.local`:
- `DATABASE_URL` — van neon.tech
- `ANTHROPIC_API_KEY` — van console.anthropic.com
- `NEXTAUTH_SECRET` — zelf genereren (zie hieronder)

**Genereer NEXTAUTH_SECRET:**
```powershell
# In PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Stap 5 — Database opzetten

**Neon account aanmaken:**
1. Ga naar [neon.tech](https://neon.tech)
2. Gratis account aanmaken
3. "New Project" → naam: `pootgelukkig`, regio: `eu-central-1`
4. Kopieer beide connection strings naar `.env.local`

**Database migreren:**
```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Stap 6 — Lokaal draaien
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🚀 Deployen naar Vercel

### Eerste deployment:
```powershell
# Vercel CLI installeren
npm install -g vercel

# Inloggen
vercel login

# Project koppelen en deployen
vercel

# Of direct naar productie:
vercel --prod
```

### Omgevingsvariabelen in Vercel:
1. Ga naar [vercel.com](https://vercel.com) → jouw project
2. Settings → Environment Variables
3. Voeg toe: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

### Auto-deploy instellen:
```powershell
# Push naar GitHub = automatisch deploy op Vercel
git add .
git commit -m "🐾 Initial PootGelukkig launch"
git push origin main
```

---

## 🗄️ Database Beheer

```powershell
# Database schema bekijken (web UI)
npm run db:studio

# Nieuwe migratie aanmaken na schema wijziging
npm run db:generate

# Migratie uitvoeren
npm run db:migrate

# Testdata opnieuw laden
npm run db:seed
```

---

## 📁 Project Structuur

```
pootgelukkig/
├── src/
│   ├── app/
│   │   ├── dashboard/          # 🏠 Hoofdscherm met AI matches
│   │   ├── intake/             # 💬 Stap-voor-stap intake gesprek
│   │   ├── animals/[id]/       # 🐾 Dierenprofiel + match analyse
│   │   ├── chat/[id]/          # 💌 Chat met asiel
│   │   ├── dossier/            # 📋 Documenten na adoptie
│   │   ├── nazorg/             # ❤️  Post-adoptie begeleiding
│   │   ├── medical/[id]/       # 🏥 Medische tijdlijn
│   │   └── api/                # 🔌 API routes
│   ├── components/
│   │   ├── layout/             # BottomNav, TopBar
│   │   └── animals/            # AnimalCard, AnimalProfile
│   └── lib/
│       ├── db/                 # Database schema + connectie + seed
│       └── ai/                 # Anthropic matching + intake logica
├── CLAUDE.md                   # 📖 Instructies voor Claude Code
├── .env.example                # 🔑 Voorbeeld env variabelen
└── README.md                   # 📚 Deze gids
```

---

## 🎨 Design Tokens

| Token | Waarde | Gebruik |
|-------|--------|---------|
| Primary | `#13ec13` | Accent, badges, actieve nav |
| Terracotta | `#E2725B` | CTA buttons, adopteer |
| Terracotta Dark | `#ee5b2b` | Chat accenten, licht thema |
| Bg Dark | `#102210` | App achtergrond (donker) |
| Bg Light | `#f0f4f0` | Chat, dossier, nazorg |
| Sage | `#9db99d` | Subtekst, voortgang |

---

## 🤖 AI Features

### Matching algoritme
Het algoritme werkt in lagen:
1. **Harde filters** — allergieën, diersoort
2. **Compatibiliteitsscore** (0-100) via Claude claude-sonnet-4-20250514
3. **Subscores** — woning, energie, gezin, ervaring

### Intake chatbot
- 7 stappen met foto-opties
- AI verwerkt antwoorden naar adopter profiel
- Genereert persoonlijke aanbeveling

### Na-adoptie begeleiding
- Dag-voor-dag tips (3-3-3 regel)
- AI genereert specifieke tips per dier

---

## 🔜 Volgende Stappen

Na de basis draait, voeg toe:
- [ ] **Auth** — NextAuth met email/wachtwoord
- [ ] **Foto upload** — Vercel Blob voor dierenfoto's
- [ ] **Asiel dashboard** — apart admin paneel
- [ ] **Push notificaties** — nieuwe matches
- [ ] **Echte DB queries** — verwijder mock data
- [ ] **Betalingen** — verzekering affiliate

---

## 📞 Contact

**Idee:** Maya van Munster  
**Uitvoering:** WeAreImpact BV  
**Directeur:** Vincent van Munster  
**Email:** v.munster@weareimpact.nl  
**Website:** pootgelukkig.nl *(in ontwikkeling)*
