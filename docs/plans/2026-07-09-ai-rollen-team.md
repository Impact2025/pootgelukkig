# AI-Rollen Team — Implementatieplan

> **For Hermes:** Gebruik de `subagent-driven-development` skill om dit plan taak-voor-taak uit te voeren.
> **Voor implementator:** Je kent het PootGelukkig-asielportaal. Alle UI-tekst is Nederlands, code-identifiers zijn Engels. Design-tokens: navy `#33335c`, accent `#f8aa25`, achtergrond `#f6f8f6`, font Plus Jakarta Sans, rounded 2xl/3xl, Material Symbols iconen.

**Goal:** Breid de bestaande Asiel Copilot (`/admin/copilot`) uit tot een "AI-team" van 8 gespecialiseerde, activeerbare rollen (Conny = social, Sam = fundraising, etc.) die asielmedewerkers helpen met communicatie, fondsenwerving, werving, events, medisch, content, rapportage en chat-support — centraal, met RAG-lite context-injectie, kostentracking per rol en Resend/Blob-integraties.

**Architectuur:** Geen zwaar multi-agent framework (geen LangGraph/CrewAI). We hergebruiken de bestaande `chatStream`/`chatCompletion` (OpenRouter) en voegen een **rol-registry** toe: elke rol = systeemprompt-builder + context-builder (RAG-lite: relevante DB-data → tekst) + optioneel side-effect acties (e-mail/storage/DB). De Copilot-UI krijgt een role-switcher. Nieuwe domein-tabellen vullen de gaten (vrijwilligers, donoren, evenementen, content-queue). Kostentracking loopt via de bestaande `ai_gebruik`-tabel met `module = 'rol-<id>'`.

**Tech Stack:** Next.js 15 (App Router), TypeScript strict, Drizzle ORM + Neon Postgres, OpenRouter (Claude), Resend, Vercel Blob. Bestaande patronen in `src/app/api/admin/copilot/*`, `src/lib/ai/client.ts`, `src/lib/email.ts`, `src/lib/db/schema.ts`.

**Belangrijke beslissingen:**
- Pragmatisch boven framework: function-calling is optioneel; V1 doet generatie via chat + aparte actie-endpoints. Geen nieuwe runtime-dependency.
- "RAG" = gestructureerde context-injectie uit de DB (zoals `bouwCopilotContext` al doet) + een lichte retrieve-functie over kennisbank/blog voor tekst-rollen. Geen vector-DB in V1.
- Social/events/publicatie = **concept-queue met menselijke goedkeuring** (ethiek + correctheid). AI plaatst niet autonoom op Instagram; het stelt voor en kopieert naar klembord / klaar-zet voor Resend.
- Foto-generatie ("voeg speelgoed toe") = V1 alleen compositie-suggesties + ideaal-foto-prompt (ethiek). Echte beeldgeneratie is V2 (FAL/FLUX), buiten scope.

---

## Situatie-analyse (wat bestaat / wat mist)

| Rol (uit brief) | Bestaande dekking | Nieuw nodig |
|---|---|---|
| Communicatie & Social (Conny) | `copilot` kan al posts/verhalen schrijven | Content-queue + planning + nieuwsbrief-verzending + engagement-veld |
| Fundraising & Sponsor (Sam) | CRM bestaat (`crmContacten`) | `donoren` + `fondsenwervingCampagnes` + segmentatie + appeal-generatie |
| Vrijwilligers & Werving | — | `vrijwilligers` + `sollicitaties` (basis-screening) + onboarding-gen |
| Event & Activiteiten | `afspraken` (kennismaking/thuischeck) | `evenementen` + `evenementShiften` + promo-gen |
| Medisch / Welzijn | `medischeRecords` (volgendeDatum), `welzijnLogs` | Herinneringen-cron + rapport-gen (context-builder) |
| Foto & Content Creator | `upload`-route (Blob) | Compositie-suggesties + prompt-gen (geen echte gen V1) |
| Rapportage & Insights | `rapportage`-route, `ai_gebruik` kosten | Maandrapport-gen + capaciteits-predictie (context-builder) |
| Chat Support bezoekers/vrijwilligers | `/api/assistent` (publiek) | Verbreding context (vrijwilligers-FAQ) + "vrijwilliger"-modus |
| *(Copilot zelf = orchestrator)* | Bestaat | Role-switcher + rol-config |

---

## Datamodel (Fase 0)

Voeg onderstaande toe aan `src/lib/db/schema.ts` (na de bestaande tabellen, vóór de RELATIONS-sectie). Houd dezelfde stijl: `pgEnum`, `json.$type<>`, `timestamp.defaultNow()`.

```ts
// =================== AI-ROLLEN CONFIG ===================
// Welke gespecialiseerde AI-rollen zijn geactiveerd per asiel
export const aiRolEnum = pgEnum('ai_rol', [
  'social', 'fundraising', 'vrijwilligers', 'evenementen',
  'medisch', 'foto', 'rapportage', 'chat',
])

export const aiRollenConfig = pgTable('ai_rollen_config', {
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  rol: aiRolEnum('rol').notNull(),
  actief: boolean('actief').default(true).notNull(),
  // Rol-specifieke instellingen (bv. standaard platform, donatie-doel, event-locatie)
  instellingen: json('instellingen').$type<Record<string, unknown>>().default({}),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.asielId, t.rol] }) }))

// =================== VRIJWILLIGERS ===================
export const vrijwilligerStatusEnum = pgEnum('vrijwilliger_status', ['kandidaat', 'actief', 'inactief'])
export const vrijwilligers = pgTable('vrijwilligers', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefoon: varchar('telefoon', { length: 30)),
  functie: varchar('functie', { length: 120 }).default('algemene ondersteuning'),
  status: vrijwilligerStatusEnum('status').default('kandidaat').notNull(),
  urenPerWeek: integer('uren_per_week').default(0),
  beschikbaarheid: json('beschikbaarheid').$type<Record<string, string[]>>().default({}), // { ma: ['ochtend'], ... }
  tags: json('tags').$type<string[]>().default([]),
  notities: text('notities'),
  aangemeldOp: timestamp('aangemeld_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// Sollicitaties (basis-screening door AI)
export const sollicitatieStatusEnum = pgEnum('sollicitatie_status', ['nieuw', 'gescreend', 'uitgenodigd', 'afgewezen'])
export const sollicitaties = pgTable('sollicitaties', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  telefoon: varchar('telefoon', { length: 30)),
  functie: varchar('functie', { length: 120 }),
  motivatie: text('motivatie'),
  ervaring: text('ervaring'),
  status: sollicitatieStatusEnum('status').default('nieuw').notNull(),
  aiScore: integer('ai_score'), // 0-100 basischeck
  aiScreenNotitie: text('ai_screen_notitie'),
  vrijwilligerId: integer('vrijwilliger_id').references(() => vrijwilligers.id, { onDelete: 'set null' }),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== FUNDRAISING & DONOREN ===================
export const donorTypeEnum = pgEnum('donor_type', ['eenmalig', 'structureel', 'bedrijf'])
export const donorSegmentEnum = pgEnum('donor_segment', ['nieuw', 'regulier', 'major', 'laps', 'actief'])
export const donoren = pgTable('donoren', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefoon: varchar('telefoon', { length: 30)),
  bedrijf: varchar('bedrijf', { length: 255 }),
  type: donorTypeEnum('type').default('eenmalig').notNull(),
  segment: donorSegmentEnum('segment').default('nieuw').notNull(),
  totaalGedoneerd: real('totaal_gedoneerd').default(0).notNull(),
  eersteDonatieOp: timestamp('eerste_donatie_op'),
  laatsteDonatieOp: timestamp('laatste_donatie_op'),
  tags: json('tags').$type<string[]>().default([]),
  notities: text('notities'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

export const campagneTypeEnum = pgEnum('campagne_type', ['donatie', 'grant', 'sponsor', 'evenement'])
export const campagneStatusEnum = pgEnum('campagne_status', ['concept', 'actief', 'afgerond', 'gepauzeerd'])
export const fondsenwervingCampagnes = pgTable('fondsenwerving_campagnes', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  type: campagneTypeEnum('type').default('donatie').notNull(),
  status: campagneStatusEnum('status').default('concept').notNull(),
  doelBedrag: real('doel_bedrag').default(0),
  opgehaaldBedrag: real('opgehaald_bedrag').default(0).notNull(),
  startOp: timestamp('start_op'),
  eindOp: timestamp('eind_op'),
  notities: text('notities'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== EEVENEMENTEN ===================
export const evenementTypeEnum = pgEnum('evenement_type', ['adoptiedag', 'opendag', 'fundraising', 'andere'])
export const evenementStatusEnum = pgEnum('evenement_status', ['concept', 'gepland', 'afgerond', 'geannuleerd'])
export const evenementen = pgTable('evenementen', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  titel: varchar('titel', { length: 255 }).notNull(),
  type: evenementTypeEnum('type').default('adoptiedag').notNull(),
  beschrijving: text('beschrijving'),
  locatie: varchar('locatie', { length: 255 }),
  startOp: timestamp('start_op').notNull(),
  eindOp: timestamp('eind_op'),
  capaciteit: integer('capaciteit'),
  status: evenementStatusEnum('status').default('concept').notNull(),
  promoConceptId: integer('promo_concept_id'), // optioneel → aiContentQueue.id
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

export const shiftStatusEnum = pgEnum('shift_status', ['open', 'ingevuld', 'geannuleerd'])
export const evenementShiften = pgTable('evenement_shiften', {
  id: serial('id').primaryKey(),
  evenementId: integer('evenement_id').notNull().references(() => evenementen.id, { onDelete: 'cascade' }),
  taak: varchar('taak', { length: 160 }).notNull(),
  startOp: timestamp('start_op').notNull(),
  eindOp: timestamp('eind_op'),
  vrijwilligerId: integer('vrijwilliger_id').references(() => vrijwilligers.id, { onDelete: 'set null' }),
  status: shiftStatusEnum('shift_status').default('open').notNull(),
  notities: text('notities'),
})

// =================== AI CONTENT QUEUE (social / nieuwsbrieven / verhalen) ===================
export const contentStatusEnum = pgEnum('content_status', ['concept', 'voorgesteld', 'gepland', 'gepubliceerd', 'afgewezen'])
export const aiContentQueue = pgTable('ai_content_queue', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  rol: aiRolEnum('rol').notNull(),
  type: varchar('type', { length: 40 }).notNull(), // 'social_post' | 'nieuwsbrief' | 'verhaal' | 'promo'
  platform: varchar('platform', { length: 40 }), // 'instagram' | 'facebook' | 'newsletter' | ...
  titel: varchar('titel', { length: 255 }),
  inhoud: text('inhoud').notNull(),
  status: contentStatusEnum('status').default('concept').notNull(),
  geplandVoor: timestamp('gepland_voor'),
  gepubliceerdOp: timestamp('gepubliceerd_op'),
  // Engagement-metingen (later handmatig/API invullen)
  engagement: json('engagement').$type<{ bereik?: number; likes?: number; deelActies?: number; klikken?: number }>().default({}),
  gemaaktDoor: varchar('gemaakt_door', { length: 60 }).default('ai'),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})
```

Voeg aan de RELATIONS-sectie toe (onder `asielenRelations`):
```ts
vrijwilligers: many(vrijwilligers),
donoren: many(donoren),
campagnes: many(fondsenwervingCampagnes),
evenementen: many(evenementen),
content: many(aiContentQueue),
rollen: many(aiRollenConfig),
```

Importeer `primaryKey` bovenaan bij de pg-core import: `primaryKey`.

### Fase 0 — Taak: Migratie genereren & draaien

**Step 1:** Voeg bovenstaande tabellen toe aan `src/lib/db/schema.ts` (patch mode: voeg toe vóór `// =================== RELATIONS ===================`).

**Step 2:** Genereer migratie:
Run: `cd D:/APPS/pootgelukkig/pootgelukkig && npm run db:generate`
Expected: nieuwe `drizzle/00XX_*.sql` met de nieuwe tabellen.

**Step 3:** Draai migratie op Neon:
Run: `npm run db:migrate`
Expected: exit 0, tabellen bestaan.

**Step 4:** Typecheck:
Run: `npx tsc --noEmit`
Expected: geen fouten over nieuwe tabellen.

**Step 5:** Commit:
```bash
git add src/lib/db/schema.ts drizzle/
git commit -m "feat(db): nieuwe tabellen voor AI-rollen (vrijwilligers, donoren, evenementen, content-queue, rol-config)"
```

---

## Fase 1 — Rollen-framework (registry + context + route)

### Fase 1 Taak A: Types & registry (`src/lib/ai/rollen/types.ts`)

Maak `src/lib/ai/rollen/types.ts`:
```ts
import type { aiRolEnum } from '@/lib/db/schema'

export type AiRolId = (typeof aiRolEnum.enumValues)[number]

export interface AiRolActie {
  id: string
  label: string
  icoon: string
  // Voorbeeld-prompt die de UI als user-bericht stuurt (of actie-endpoint triggert)
  prompt: string
  // als true → roept side-effect endpoint aan i.p.v. chat (zie per-rol routes)
  sideEffect?: boolean
  endpoint?: string
}

export interface AiRol {
  id: AiRolId
  naam: string // "Conny"
  titel: string
  icoon: string
  kleur: string
  beschrijving: string
  // RAG-lite: bouw relevante context-tekst uit de DB voor dit asiel
  bouwContext: (asielId: number) => Promise<string>
  // Extra system-prompt-instructies specifiek voor deze rol
  systeemInstructie: string
  acties: AiRolActie[]
}
```

### Fase 1 Taak B: Context-helper (RAG-lite) `src/lib/ai/rollen/context.ts`

Maak `src/lib/ai/rollen/context.ts` met herbruikbare builders + een lichte retrieve over kennisbank/blog:
```ts
import { db } from '@/lib/db'
import { dieren, medischeRecords, welzijnLogs, adopties, afspraken } from '@/lib/db/schema'
import { and, eq, ne, lt, gte, desc, sql } from 'drizzle-orm'

export async function haalDierenSamenvatting(asielId: number, limiet = 30): Promise<string> {
  const rijen = await db.select({
    naam: dieren.naam, soort: dieren.soort, status: dieren.status,
    binnen: dieren.binnengekomentOp,
  }).from(dieren)
    .where(and(eq(dieren.asielId, asielId), ne(dieren.status, 'geadopteerd')))
    .orderBy(desc(dieren.binnengekomentOp)).limit(limiet)
  return rijen.map((d) => `- ${d.naam} (${d.soort}) — ${d.status}`).join('\n') || '  Geen dieren in opvang'
}

export async function haalMedischOpen(asielId: number): Promise<string> {
  // medische records van dieren van dit asiel, achterstallig/aankomend
  const rijen = await db.select({
    titel: medischeRecords.titel, dierId: medischeRecords.dierId,
    volgende: medischeRecords.volgendeDatum, status: medischeRecords.status,
  }).from(medischeRecords)
    .innerJoin(dieren, eq(medischeRecords.dierId, dieren.id))
    .where(and(eq(dieren.asielId, asielId), lt(medischeRecords.volgendeDatum, new Date())))
    .limit(15)
  return rijen.map((r) => `- ${r.titel} (${r.status})`).join('\n') || '  Geen openstaande medische acties'
}

// Lichte retrieve over bestaande kennisbank/blog (keyword match) voor tekst-rollen
export async function retrieveKennisbank(query: string, asielId?: number, max = 5): Promise<string> {
  // herbruik src/lib/kennisbank/content.ts zoekfunctie indien aanwezig;
  // anders: selecteer blogPosts waar inhoud ilike query
  const term = `%${query.replace(/\s+/g, '%')}%`
  const rijen = await db.execute(sql`SELECT titel, slug FROM blog_posts
    WHERE status='gepubliceerd' AND inhoud_md ILIKE ${term} LIMIT ${max}`)
  return (rijen as any).rows?.map((r: any) => `- ${r.titel} (/blog/${r.slug})`).join('\n') ?? ''
}
```

### Fase 1 Taak C: Per-rol definities `src/lib/ai/rollen/index.ts`

Maak `src/lib/ai/rollen/index.ts` waarin alle 8 rollen geregistreerd zijn. Voorbeeld (social + fundraising volledig; de rest analoog — zie Fase 3 voor specifics):

```ts
import type { AiRol } from './types'
import { haalDierenSamenvatting, haalMedischOpen } from './context'
import { db } from '@/lib/db'
import { vrijwilligers, donoren, fondsenwervingCampagnes } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const social: AiRol = {
  id: 'social',
  naam: 'Conny',
  titel: 'Communicatie & Social Media Manager',
  icoon: 'campaign',
  kleur: '#f8aa25',
  beschrijving: 'Genereert social posts, nieuwsbrieven en adoptieverhalen. Stelt voor en analyseert engagement.',
  systeemInstructie: `Je bent Conny, de Communicatie & Social Media Manager van het asiel.
Je schrijft wervende, warme Nederlandse posts voor Instagram/Facebook, nieuwsbrieven en adoptieverhalen.
Je houdt rekening met het karakter van het dier en de tone-of-voice van het asiel.
Je stelt een postings-schema voor en geeft aan wat goed scoort (korte verhalen, foto's, call-to-action).`,
  bouwContext: async (asielId) => {
    const dieren = await haalDierenSamenvatting(asielId)
    return `DIEREN BESCHIKBAAR:\n${dieren}`
  },
  acties: [
    { id: 'post', label: 'Social post', icoon: 'campaign', prompt: 'Schrijf een wervende Instagram-post voor een dier dat lang in het asiel zit.' },
    { id: 'nieuwsbrief', label: 'Nieuwsbrief', icoon: 'mail', prompt: 'Stel een maandelijkse nieuwsbrief samen met 3 adoptieverhalen en een oproep.', sideEffect: true, endpoint: '/api/admin/rollen/social/nieuwsbrief' },
    { id: 'verhaal', label: 'Adoptieverhaal', icoon: 'auto_stories', prompt: 'Kies een beschikbaar dier en schrijf een warm adoptieverhaal.' },
    { id: 'schema', label: 'Postingsschema', icoon: 'calendar_month', prompt: 'Stel een wekelijks postingsschema voor (3 posts, 1 nieuwsbrief).' },
    { id: 'analyse', label: 'Engagement-analyse', icoon: 'insights', prompt: 'Analyseer welke recente posts goed scoorden en geef 3 tips.' },
  ],
}

const fundraising: AiRol = {
  id: 'fundraising',
  naam: 'Sam',
  titel: 'Fundraising & Sponsor Manager',
  icoon: 'volunteer_activism',
  kleur: '#10b981',
  beschrijving: 'Schrijft donatie-appeals, grant-aanvragen en sponsorvoorstellen. Segmenteert donoren.',
  systeemInstructie: `Je bent Sam, de Fundraising & Sponsor Manager.
Je schrijft overtuigende, respectvolle Nederlandse donatie-appeals, grant-aanvragen en sponsorvoorstellen.
Je denkt in segmenten (eenmalig/structureel/bedrijf) en stelt gepersonaliseerde mails voor.
Je komt met campagne-ideeën (Giving Tuesday, eindejaarscampagne).`,
  bouwContext: async (asielId) => {
    const d = await db.select({ id: donoren.id, naam: donoren.naam, segment: donoren.segment, totaal: donoren.totaalGedoneerd })
      .from(donoren).where(eq(donoren.asielId, asielId)).orderBy(desc(donoren.totaalGedoneerd)).limit(20)
    const c = await db.select({ id: fondsenwervingCampagnes.id, naam: fondsenwervingCampagnes.naam, opgehaald: fondsenwervingCampagnes.opgehaaldBedrag, doel: fondsenwervingCampagnes.doelBedrag })
      .from(fondsenwervingCampagnes).where(eq(fondsenwervingCampagnes.asielId, asielId)).limit(10)
    return `DONOREN (top 20):\n${d.map((x) => `- ${x.naam} (${x.segment}) — €${x.totaal ?? 0}`).join('\n') || '  Geen donoren'}\n\nCAMPAGNES:\n${c.map((x) => `- ${x.naam}: €${x.opgehaald ?? 0}/€${x.doel ?? 0}`).join('\n') || '  Geen campagnes'}`
  },
  acties: [
    { id: 'appeal', label: 'Donatie-appeal', icoon: 'volunteer_activism', prompt: 'Schrijf een warme donatie-appeal voor onze lopende campagne.' },
    { id: 'segment', label: 'Gesegmenteerde mail', icoon: 'group', prompt: 'Stel een gepersonaliseerde mail voor voor onze "major"-donoren.', sideEffect: true, endpoint: '/api/admin/rollen/fundraising/mail' },
    { id: 'grant', label: 'Grant-aanvraag', icoon: 'description', prompt: 'Schrijf een korte grant-aanvraag voor een nieuw opvangverblijf.' },
    { id: 'sponsor', label: 'Sponsorvoorstel', icoon: 'handshake', prompt: 'Maak een sponsorvoorstel voor een lokaal bedrijf (tegenprestatie: naamsvermelding).' },
    { id: 'campagne', label: 'Campagne-idee', icoon: 'lightbulb', prompt: 'Geef 3 campagne-ideeën voor de komende maanden (bv. Giving Tuesday).' },
  ],
}

// vrijwilligers, evenementen, medisch, foto, rapportage, chat — analoog (zie Fase 3)
export const AI_ROLLEN: Record<string, AiRol> = { social, fundraising /*, ... */ }
export const AI_ROLLEN_LIJST = Object.values(AI_ROLLEN)
export function haalRol(id: string): AiRol | undefined { return AI_ROLLEN[id] }
```

### Fase 1 Taak D: Unit-test registry `src/lib/ai/rollen/rollen.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AI_ROLLEN, AI_ROLLEN_LIJST, haalRol } from './index'

test('registry bevat 8 rollen', () => {
  assert.equal(AI_ROLLEN_LIJST.length, 8)
})

test('elke rol heeft naam, titel en minstens 1 actie', () => {
  for (const r of AI_ROLLEN_LIJST) {
    assert.ok(r.naam, `rol ${r.id} mist naam`)
    assert.ok(r.titel, `rol ${r.id} mist titel`)
    assert.ok(r.acties.length >= 1, `rol ${r.id} heeft geen acties`)
  }
})

test('haalRol retourneert onbekende rol als undefined', () => {
  assert.equal(haalRol('bestaat-niet'), undefined)
})
```

Run: `npm test -- src/lib/ai/rollen/rollen.test.ts`
Expected: 3 passed.

### Fase 1 Taak E: Uitbreiden Copilot-route met `rol`

Pas `src/app/api/admin/copilot/route.ts` aan: in `POST`, lees `rol` uit body. Als `rol` gezet en geldig → bouw systeemprompt via `haalRol(rol)` (rol.systeemInstructie + await rol.bouwContext(asielId)), anders bestaande copilot-prompt. Voeg `rol` toe aan `meta.module` zodat kosten onder `rol-<id>` landen.

Concreet: na `const systemPrompt = ...` (bestaand) voeg toe:
```ts
let systemPrompt: string
const rolId = (body as any).rol as string | undefined
const rol = rolId ? haalRol(rolId) : undefined
if (rol) {
  const ctx = await rol.bouwContext(asielId ?? 0)
  systemPrompt = `${rol.systeemInstructie}\n\nASIEL CONTEXT:\n${ctx}\n\nStijl: warm, Nederlands, concreet. Gebruik **bold** voor highlights.`
} else {
  systemPrompt = `...bestaande copilot-prompt...`
}
```
En in de `chatStream`-call: `meta: { module: rol ? \`rol-${rol.id}\` : 'copilot', userId: session.user.id, asielId }`.

### Fase 1 Taak F: Nieuwe route `GET /api/admin/copilot/rollen`

Maak `src/app/api/admin/copilot/rollen/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { aiRollenConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AI_ROLLEN_LIJST, haalRol } from '@/lib/ai/rollen'

export const dynamic = 'force-dynamic'
export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol))
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  const asielId = session.user.asielId
  const actief = asielId
    ? await db.select({ rol: aiRollenConfig.rol, actief: aiRollenConfig.actief })
        .from(aiRollenConfig).where(eq(aiRollenConfig.asielId, asielId))
    : []
  const actiefMap = new Map(actief.map((a) => [a.rol, a.actief]))
  const rollen = AI_ROLLEN_LIJST.map((r) => ({
    id: r.id, naam: r.naam, titel: r.titel, icoon: r.icoon, kleur: r.kleur,
    beschrijving: r.beschrijving,
    actief: actiefMap.get(r.id) ?? false,
    acties: r.acties,
  }))
  return NextResponse.json({ rollen })
}
```

**Step (verificatie Fase 1):** `npx tsc --noEmit` + `npm test -- src/lib/ai/rollen/rollen.test.ts`. Commit:
```bash
git add src/lib/ai/rollen src/app/api/admin/copilot
git commit -m "feat(ai): rol-registry, RAG-lite context en rol-bewuste copilot-route"
```

---

## Fase 2 — UI: Role-switcher + instellingen

### Fase 2 Taak A: Role-switcher in CopilotClient

In `src/app/admin/copilot/CopilotClient.tsx`:
1. Voeg state `const [rollen, setRollen] = useState<RolDef[]>([])` en `const [actieveRol, setActieveRol] = useState<string | null>(null)`.
2. Laad bij mount vanuit `/api/admin/copilot/rollen` (naast briefing). Filter op `actief === true` voor de zichtbare switcher; toon alleen geactiveerde rollen.
3. Voeg boven het linker paneel een horizontale rij "team-avatars" (ronde knoppen met `rol.icoon` + `rol.kleur`), één ervan actief. Klikken zet `actieveRol` en ververst de "Snelle acties" lijst naar `rol.acties`.
4. Bij `verstuurBericht` wordt `actieveRol` meegestuurd in de payload: `body: { berichten: [...], rol: actieveRol }`.
5. Vervang de statische `SNELLE_ACTIES` door `rollen.find(r => r.id === actieveRol)?.acties ?? []` (met fallback naar een algemene lijst).

Definieer type `RolDef` in het bestand (of importeer uit de rollen-route types).

### Fase 2 Taak B: Nav + SEGMENT_LABELS

In `src/components/admin/nav.ts`: voeg toe aan `SEGMENT_LABELS`: `rollen: 'AI-team'`, `vrijwilligers: 'Vrijwilligers'`, `donoren: 'Donoren'`, `evenementen: 'Evenementen'`, `instellingen: 'Instellingen'`. (Geen nieuwe nav-items nodig — rollen blijven onder /admin/copilot; vrijwilligers/donoren/evenementen krijgen eigen admin-pagina's in Fase 3.)

### Fase 2 Taak C: Activatie-tab in instellingen

Maak `src/app/admin/instellingen/AITeamTab.tsx` (client) + laad in `src/app/admin/instellingen/page.tsx` als tab. Toont de 8 rollen als toggle-kaarten (naam, beschrijving, icoon). Bij toggle → `POST /api/admin/instellingen/ai-rollen` (nieuw) die `aiRollenConfig` upsert (`actief`). Toon per rol de maandkosten (optelsom `ai_gebruik` waar `module = 'rol-<id>'` en `asielId` = huidig, laatste 30 dagen) — herbruik een kleine query.

Route `src/app/api/admin/instellingen/ai-rollen/route.ts`:
- `GET`: retourneert actieve rollen (herbruik logica uit Fase 1F).
- `POST`: body `{ rol, actief }` → `db.insert(aiRollenConfig).values({asielId, rol, actief}).onConflictDoUpdate({ target: [asielId, rol], set: { actief, bijgewerktOp: new Date() } })`.

**Verificatie Fase 2:** `npm run dev`, log in als asiel, open `/admin/copilot`: zie team-avatars, switch naar "Conny", snelle acties veranderen, stuur bericht → respons komt terug én in DB staat een `ai_gebruik`-rij met `module='rol-social'`. Toggle een rol in instellingen → switcher toont 'm niet meer. Commit.

---

## Fase 3 — Per-rol implementatie

Elke rol hieronder = een taakgroep. Gemeenschappelijk patroon voor side-effect acties:
- Maak `src/app/api/admin/rollen/<rol>/<actie>/route.ts` (POST).
- Auth: `['asiel','admin']` + `asielId`.
- Roep `chatCompletion` aan met rol-context + specifieke instructie, sla resultaat op in de juiste tabel (of verstuur mail via `src/lib/email.ts`), log met `meta: { module: 'rol-<rol>', asielId }`.
- Return JSON `{ ok, data }`.

### Rol 1 — Communicatie & Social (Conny) [VOLLEDIG VOORBEELD]

Bestaande context-builder + acties staan in Fase 1C. Extra:

**Route `src/app/api/admin/rollen/social/nieuwsbrief/route.ts`** (side-effect: verstuur via Resend naar CRM-contacten/donoren als nieuwsbriefsegment):
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { crmContacten, donoren } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { chatCompletion } from '@/lib/ai/client'
import { verstuurMail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.asielId) return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  const asielId = session.user.asielId
  // 1) Genereer nieuwsbrief-inhoud via AI
  const prompt = `Schrijf een warme maandelijkse nieuwsbrief (Nederlands, HTML-veilige platte tekst met **bold**) met: 3 adoptieverhalen, 1 oproep aan vrijwilligers, 1 donateurs-bedankje. Max 600 woorden.`
  const inhoud = await chatCompletion([{ role: 'user', content: prompt }], { maxTokens: 1500, meta: { module: 'rol-social', asielId } })
  // 2) Verstuur naar donoren + crm-contacten met email
  const ontvangers = (await db.select({ email: donoren.email }).from(donoren).where(eq(donoren.asielId, asielId)))
    .map((d) => d.email).filter(Boolean) as string[]
  let verzonden = 0
  for (const email of ontvangers.slice(0, 200)) {
    const r = await verstuurMail({ naar: email, onderwerp: '🐾 Nieuwsbrief PootGelukkig', html: `<div style="font-family:sans-serif">${inhoud.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</div>` }, { template: 'rol-social-nieuwsbrief', asielId })
    if (r.ok) verzonden++
  }
  // 3) Bewaar in content-queue als archief
  await db.insert(aiContentQueue).values({ asielId, rol: 'social', type: 'nieuwsbrief', inhoud, status: 'gepubliceerd', gepubliceerdOp: new Date(), gemaaktDoor: 'ai' })
  return NextResponse.json({ ok: true, verzonden, inhoud })
}
```

**Content-queue UI** `src/app/admin/copilot/ContentQueue.tsx` (client): lijst concepten/geplande posts uit `aiContentQueue` (route `GET /api/admin/rollen/social/queue`), met "Kopieer", "Markeer gepland", "Markeer gepubliceerd". Geen autonome publicatie naar sociale netwerken.

Route `src/app/api/admin/rollen/social/queue/route.ts` (GET/POST): GET lijst per asiel; POST voegt concept toe (vanuit chat-actie "post" kan de UI het gegenereerde antwoord hierin opslaan via een "Opslaan als concept"-knop).

### Rol 2 — Fundraising & Sponsor (Sam)
- Context-builder: donoren + campagnes (Fase 1C).
- Route `/api/admin/rollen/fundraising/mail` (POST): genereer gepersonaliseerde mail voor segment, verstuur naar donoren in dat segment via Resend (zoals nieuwsbrief).
- Route `/api/admin/rollen/fundraising/appeal` (POST): genereer appeal-tekst, sla op in `aiContentQueue` (type 'verhaal'/appeal) of retourneer direct.
- UI: `/admin/beheer/crm` uitbreiden met "Donoren"-subtab (tabel `donoren`) + "Campagnes"-subtab (`fondsenwervingCampagnes`). Maak `src/app/admin/beheer/crm/DonorenTab.tsx` en `CampagnesTab.tsx` + bijbehorende GET/POST routes onder `/api/admin/rollen/fundraising/*`.

### Rol 3 — Vrijwilligers & Werving Coach
- Tabellen `vrijwilligers`, `sollicitaties`.
- Routes:
  - `GET/POST /api/admin/vrijwilligers` — CRUD.
  - `POST /api/admin/rollen/vrijwilligers/vacature` — genereer vacaturetekst uit functie + asiel-context.
  - `POST /api/admin/rollen/vrijwilligers/screen` — body `{ sollicitatieId }`: laad sollicitatie, laat AI een basischeck doen tegen minimale criteria (beschikbaarheid, motivatie-lengte, relevante ervaring), schrijf `aiScore` + `aiScreenNotitie`, zet status 'gescreend'.
  - `POST /api/admin/rollen/vrijwilligers/onboarding` — genereer onboarding-materiaal + trainingsschema voor een vrijwilliger.
- UI: `src/app/admin/vrijwilligers/page.tsx` + `VrijwilligersClient.tsx` (lijst + "Nieuwe vacature" knop die AI aanroept + sollicitatie-rij met "Screen" knop).

### Rol 4 — Event & Activiteiten Organisator
- Tabellen `evenementen`, `evenementShiften`.
- Routes:
  - `GET/POST /api/admin/evenementen` — CRUD evenement.
  - `POST /api/admin/evenementen/[id]/shiften` — beheer shifts.
  - `POST /api/admin/rollen/evenementen/plan` — body `{ type, datum, locatie }`: laat AI een draaiboek + shift-rooster-voorstel genereren en (optioneel) direct invoegen in `evenementShiften`.
  - `POST /api/admin/rollen/evenementen/promo` — genereer promo-post, sla op in `aiContentQueue` (type 'promo', platform 'facebook'/'instagram') + koppel aan `evenementen.promoConceptId`.
- UI: `src/app/admin/evenementen/page.tsx` + `EvenementenClient.tsx` (kalender-lijst + "Plan event met AI" + shift-rooster).

### Rol 5 — Medisch / Welzijn Assistant
- Geen nieuwe tabel; gebruikt `medischeRecords` + `welzijnLogs`.
- Context-builder: `haalMedischOpen(asielId)` + laatste welzijn-logs.
- Route `/api/admin/rollen/medisch/rapport` (POST): genereer eenvoudig medisch rapport per dier of asiel (vaccinatiestatus, achterstallige behandelingen, verwijzing dierenarts).
- Automatisering: koppel aan bestaande cron `/api/cron/afspraken` of nieuwe `/api/cron/medisch-herinnering` die openstaande `volgendeDatum < vandaag` per e-mail herinnert (herbruik `stuurAfspraakHerinnering`-patroon of nieuwe `stuurMedischeHerinnering` in `email.ts`).
- UI: verschijnt als rol in Copilot; geen aparte pagina nodig (medisch heeft al `/admin/medisch`).

### Rol 6 — Foto & Content Creator
- Geen nieuwe tabel.
- Route `/api/admin/rollen/foto/suggesties` (POST): body `{ dierId }` → laad dier + huidige foto's, laat AI compositie-suggesties genereren (belichting, hoofdhoogte, achtergrond, "vang het karakter") + een "ideaal foto-prompt" (tekst, GEEN echte generatie in V1 — ethiek-notitie in antwoord).
- Optioneel V2: echte beeldgeneratie via FAL/FLUX (aparte skill). In V1: alleen suggesties + prompt.
- UI: knop op dier-detailpagina (`/admin/dieren/[id]`) "AI fototips".

### Rol 7 — Rapportage & Insights Manager
- Route `/api/admin/rollen/rapportage/maand` (POST): bouw context uit bestaande `rapportage`-route-data + `vrijwilligers.urenPerWeek` (som) + `ai_gebruik` kosten per module + adopties/duren. Laat AI een maandrapport genereren (adopties, vrijwilligersuren, kosten, match-successrate) + voorspelling: dieren >60 dagen in opvang (capaciteitsprobleem) en patronen.
- Herbouw bestaande `/admin/rapportage` om deze rol te tonen als "AI-inzichten" sectie, of voeg toe aan Copilot als rol.
- UI: knop "Genereer maandrapport" in `/admin/rapportage`.

### Rol 8 — Chat Support voor Bezoekers/Vrijwilligers
- Breid `src/app/api/assistent/route.ts` (publiek) uit: voeg `mode: 'bezoeker' | 'vrijwilliger'` toe aan body. Bij 'vrijwilliger' → laad vrijwilligers-FAQ-context (basis: hoe word ik vrijwilliger, taken, rooster) in de systeemprompt. Bestaande publieke widget (`src/components/AIAssistentWidget.tsx`) krijgt een toggle "Ik ben vrijwilliger".
- Geen nieuwe tabel. Wel context-builder voor vrijwilligers-info per asiel.

**Verificatie Fase 3:** per rol: route returns JSON, side-effect (mail/DB) landt, kosten onder juiste `module`, UI-actie werkt in dev. Commit per rol-groep.

---

## Fase 4 — Automatisering, kosten & afronding

### Fase 4 Taak A: Kosten-dashboard per rol
Breid `src/app/admin/instellingen/AITeamTab.tsx` (Fase 2C) uit met een maand-overzicht: query `ai_gebruik` gegroepeerd op `module` waar `module LIKE 'rol-%'` en `asielId` = huidig, sommeer `kostenEuro`. Toon per rol een balkje. Bestaande `stuurManagementRapport` (email.ts) toont al AI-kosten per module — dat dekt de management-view.

### Fase 4 Taak B: Dagelijkse rol-tips (cron)
Optioneel: breid `/api/cron/management-dag` uit zodat per geactiveerde rol één korte tip/voorstel in de bestaande digest komt (bv. Conny: "2 dieren wachten >60 dagen — post idee"). Houd simpel: loop actieve rollen, roep `rol.bouwContext` + korte prompt, voeg toe aan digest.

### Fase 4 Taak C: Eindverificatie
Run:
```
npx tsc --noEmit
npm test
npm run build
```
Verwacht: typecheck schoon, tests groen, productie-build slaagt.
Handmatig in dev: als asiel inloggen → /admin/copilot → 8 avatars (na activatie) → elke rol doet minstens één actie → DB `ai_gebruik` toont `rol-*` modules → instellingen toont kosten per rol.

Commit:
```bash
git add -A
git commit -m "feat: AI-rollen team (Conny/Sam/...) geïntegreerd in Copilot met RAG-lite, kostentracking en Resend/Blob"
```

---

## Aanbevolen volgorde (MVP-eerst)

1. Fase 0 (schema + migratie) — blokkerend voor alles.
2. Fase 1 (framework + route + test) — de helft van de waarde zit in de switcher.
3. Fase 2 (UI switcher + activatie) — zichtbaar product.
4. Rol 1 (Social/Conny) volledig — bewijst het side-effect-patroon (queue + mail).
5. Rol 2 (Fundraising/Sam) — bewijst segmentatie + mail.
6. Rol 5 (Medisch) + Rol 7 (Rapportage) — puur context/rapport, weinig nieuwe UI.
7. Rol 3 (Vrijwilligers) + Rol 4 (Evenementen) — nieuwe CRUD-pagina's.
8. Rol 6 (Foto) + Rol 8 (Chat) — lichtgewicht.
9. Fase 4 (kosten + cron).

## Risico's / aandachtspunten
- **Ethiek fotogeneratie:** géén misleidende "verbeterde" dierenfoto's publiceren. V1 = alleen suggesties + prompt. Echte generatie = expliciete V2 met goedkeuring.
- **Autonome publicatie:** AI plaatst niet direct op sociale netwerken (geen API-toegang, ethiek). Altijd concept → menselijke goedkeuring.
- **Kosten:** elke rol-call logt via `meta.module='rol-<id>'` — niet overslaan, anders kosten-onzichtbaar.
- **RAG-lite limiet:** context is gestructureerde DB-data, geen vector-search over documenten. Voor grote kennisbank → later echte embedding-retrieval.
- **Donor/mail compliance:** AVG — alleen mailen naar donoren met toestemming; Resend open/click-tracking staat al aan.
