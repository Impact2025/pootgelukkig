# Admin Pro — Plan voor een wereldklasse asiel-admin

Doel: van de bestaande, functionele admin een coherente, snelle, toegankelijke en
verzorgde pro-tool maken — zonder de werkende datalaag te breken. Licht thema, navy
`#33335c` + amber `#f8aa25`, Plus Jakarta Sans, Material Symbols.

## Audit (feitelijk)
- Sterke datalaag en ~3.500 regels werkende pagina's, maar **geen gedeelde componenten**
  (`src/components/ui` bevat alleen `Toaster`). Elke pagina herbouwt kaarten/tabellen/badges
  inline → inconsistentie.
- Sidebar is `fixed ml-64`, **niet responsive of inklapbaar**, geen mobiel.
- **Geen topbar**: geen globale zoek/command palette, geen breadcrumbs, geen notificatie-menu.
- a11y-gaten (geen `aria-current`, geen focus-management voor drawer/palette).

## Workstreams

### A. Admin design system — `src/components/admin/`
Getypte, herbruikbare primitives: `PageHeader`, `Card`, `StatCard` (KPI + delta + sparkline),
`Button` (primary/secondary/ghost/danger, loading), `Badge` + `StatusBadge` (status→kleur),
`DataTable` (kolomdefs, empty/skeleton), `Toolbar`, `EmptyState`, `Skeleton`, `Avatar`,
`DescriptionList`, `Tabs`. Eén bron voor statuskleuren.

### B. App shell — `AdminShell`
- **Inklapbare sidebar** (icon-only, voorkeur bewaard in localStorage) + **off-canvas drawer**
  op mobiel met hamburger.
- **TopBar**: breadcrumbs (afgeleid van pad), globale zoekknop (opent ⌘K), notificatie-dropdown
  (hergebruikt bestaande tellers), gebruikersmenu.
- `aria-current`, focus-trap voor drawer/palette, toetsenbordvriendelijk.

### C. Command palette (⌘K / Ctrl-K)
Client-component met fuzzy zoeken over navigatie + snelle acties ("Nieuw dier toevoegen",
"Ga naar adopties", …). Toetsenbordgedreven — een kenmerk van topklasse-admins.

### D. Pagina-upgrades (systeem toepassen)
Dashboard met `StatCard`-KPI's + actiewachtrij + trend; daarna Dieren/Adopties/Afspraken/
Berichten/Wachtlijst/Medisch via `PageHeader` + `DataTable` + `StatusBadge` + `EmptyState`.

### E. Polish & kwaliteit
`loading.tsx`-skeletons per route, consistente lege/laad-states, a11y-pass, tests voor pure
logica (status→badge, breadcrumb-afleiding, command-filter). Typecheck + tests + build groen.

## Fasering
1. Design system + gedeelde nav/labels + pure-logic tests.
2. App shell (responsive sidebar + topbar + breadcrumbs).
3. Command palette.
4. Dashboard herbouwd op het systeem.
5. Migratie overige datapagina's + loading skeletons.
6. Verificatie: typecheck + tests + build groen.

Uitvoering is autonoom en incrementeel; de bestaande nav, badges en datacalls blijven intact.
