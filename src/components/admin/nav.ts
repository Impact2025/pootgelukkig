// Eén bron van waarheid voor admin-navigatie, breadcrumbs, statuskleuren en de
// command palette. Framewerk-onafhankelijk en puur, zodat alles testbaar is.

export interface NavItem {
  href: string
  icon: string
  label: string
  exact?: boolean
  highlight?: boolean
  badge?: 'openstaand' | 'afspraken' | 'ongelezen' | 'medisch' | 'wachtlijst'
  adminOnly?: boolean
  asielOnly?: boolean
}

export interface NavGroup {
  titel?: string
  items: NavItem[]
}

// Asiel-portaal: dagelijkse operatie van één asiel.
export const asielNav: NavGroup[] = [
  {
    items: [
      { href: '/admin', icon: 'grid_view', label: 'Dashboard', exact: true },
      { href: '/admin/copilot', icon: 'auto_awesome', label: 'AI Copilot', highlight: true },
      { href: '/admin/dieren', icon: 'pets', label: 'Dieren' },
      { href: '/admin/adopties', icon: 'favorite', label: 'Adoptie', badge: 'openstaand' },
      { href: '/admin/afspraken', icon: 'calendar_month', label: 'Afspraken', badge: 'afspraken' },
      { href: '/admin/berichten', icon: 'chat', label: 'Berichten', badge: 'ongelezen' },
    ],
  },
  {
    items: [
      { href: '/admin/medisch', icon: 'medical_services', label: 'Medisch', badge: 'medisch' },
      { href: '/admin/wachtlijst', icon: 'format_list_bulleted', label: 'Wachtlijst', badge: 'wachtlijst' },
      { href: '/admin/pleeggezinnen', icon: 'house', label: 'Pleeggezinnen' },
      { href: '/admin/instellingen', icon: 'settings', label: 'Instellingen' },
    ],
  },
]

// Management-portaal: platform-overzicht voor de beheerder(s).
export const managementNav: NavGroup[] = [
  {
    items: [
      { href: '/management', icon: 'insights', label: 'Management', exact: true },
      { href: '/management/gebruikers', icon: 'group', label: 'Gebruikers' },
      { href: '/management/crm', icon: 'contacts', label: 'CRM' },
      { href: '/management/asielen-werving', icon: 'domain_add', label: 'Asielen werving' },
      { href: '/management/rapportage', icon: 'bar_chart', label: 'Rapportage' },
      { href: '/management/content-queue', icon: 'inbox', label: 'Content-queue' },
    ],
  },
  {
    titel: 'Content',
    items: [
      { href: '/management/blog', icon: 'article', label: 'Blog' },
      { href: '/management/coupons', icon: 'sell', label: 'Coupons' },
      { href: '/management/ai-rollen', icon: 'group_add', label: 'AI-rollen activeren' },
      { href: '/management/instellingen', icon: 'settings', label: 'Instellingen' },
    ],
  },
]

// Vlakke lijst van alle navitems (handig voor palette + breadcrumbs).
export const ALL_NAV_ITEMS: NavItem[] = [
  ...asielNav.flatMap((g) => g.items),
  ...managementNav.flatMap((g) => g.items),
]

// Labels voor padsegmenten die geen eigen navitem hebben.
export const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Admin',
  dieren: 'Dieren',
  nieuw: 'Nieuw',
  bewerken: 'Bewerken',
  adopties: 'Adoptie',
  afspraken: 'Afspraken',
  berichten: 'Berichten',
  medisch: 'Medisch',
  welzijn: 'Welzijn',
  wachtlijst: 'Wachtlijst',
  pleeggezinnen: 'Pleeggezinnen',
  'asielen-werving': 'Asielen werving',
  rapportage: 'Rapportage',
  instellingen: 'Instellingen',
  copilot: 'AI Copilot',
  beheer: 'Management',
  gebruikers: 'Gebruikers',
  crm: 'CRM',
  blog: 'Blog',
  coupons: 'Coupons',
  'ai-rollen': 'AI-rollen',
  'content-queue': 'Content-queue',
  management: 'Management',
}

export interface Crumb {
  label: string
  href: string
  isLast: boolean
}

// Leidt een breadcrumb-pad af van een URL-pad. Numerieke id-segmenten worden
// als "Detail" getoond. Het eerste segment (admin) linkt naar het dashboard.
export function deriveBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: Crumb[] = []
  let href = ''
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    href += `/${seg}`
    const isId = /^\d+$/.test(seg)
    const label = isId ? 'Detail' : SEGMENT_LABELS[seg] ?? capitalize(seg)
    crumbs.push({ label, href, isLast: i === segments.length - 1 })
  }
  return crumbs
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')
}

// ─── Statuskleuren ───────────────────────────────────────────────────────────

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const STATUS_TONE: Record<string, StatusTone> = {
  // positief / afgerond
  beschikbaar: 'success',
  goedgekeurd: 'success',
  afgerond: 'success',
  voltooid: 'success',
  bevestigd: 'success',
  geadopteerd: 'info',
  // in behandeling / aankomend
  aangevraagd: 'warning',
  in_behandeling: 'warning',
  aankomend: 'warning',
  // negatief
  afgewezen: 'danger',
  gemist: 'danger',
  niet_beschikbaar: 'danger',
  // neutraal
  geannuleerd: 'neutral',
  gearchiveerd: 'neutral',
  // blog
  concept: 'warning',
  gepubliceerd: 'success',
}

const STATUS_LABELS: Record<string, string> = {
  beschikbaar: 'Beschikbaar',
  in_behandeling: 'In behandeling',
  geadopteerd: 'Geadopteerd',
  niet_beschikbaar: 'Niet beschikbaar',
  aangevraagd: 'Aangevraagd',
  goedgekeurd: 'Goedgekeurd',
  afgerond: 'Afgerond',
  afgewezen: 'Afgewezen',
  geannuleerd: 'Geannuleerd',
  aankomend: 'Aankomend',
  voltooid: 'Voltooid',
  gemist: 'Gemist',
  bevestigd: 'Bevestigd',
  concept: 'Concept',
  gepubliceerd: 'Gepubliceerd',
  gearchiveerd: 'Gearchiveerd',
}

export function statusTone(status: string): StatusTone {
  return STATUS_TONE[status] ?? 'neutral'
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? capitalize(status)
}

// ─── Command palette ─────────────────────────────────────────────────────────

export interface CommandItem {
  id: string
  label: string
  hint?: string
  icon: string
  href: string
  keywords?: string[]
}

export const QUICK_ACTIONS: CommandItem[] = [
  { id: 'nieuw-dier', label: 'Nieuw dier toevoegen', icon: 'add_circle', href: '/admin/dieren/nieuw', keywords: ['toevoegen', 'aanmaken', 'dier'] },
  { id: 'nieuw-pleeggezin', label: 'Nieuw pleeggezin', icon: 'add_home', href: '/admin/pleeggezinnen/nieuw', keywords: ['pleeg', 'gezin', 'toevoegen'] },
  { id: 'rapportage', label: 'Rapportage downloaden', icon: 'download', href: '/management/rapportage', keywords: ['export', 'pdf', 'csv'] },
]

// Bouwt de volledige lijst commando's: navigatie + snelle acties (gefilterd op rol).
// isAdmin krijgt het management-portaal, asiel het asiel-portaal.
export function buildCommandItems(isAdmin: boolean): CommandItem[] {
  const items = isAdmin ? managementNav : asielNav
  const navCommands: CommandItem[] = items.flatMap((g) => g.items).map((i) => ({
    id: `nav:${i.href}`,
    label: `Ga naar ${i.label}`,
    hint: 'Navigatie',
    icon: i.icon,
    href: i.href,
    keywords: [i.label.toLowerCase()],
  }))
  return [...QUICK_ACTIONS, ...navCommands]
}

// Eenvoudige, voorspelbare fuzzy-filter: alle woorden uit de query moeten
// voorkomen in label, hint of keywords. Lege query geeft alles terug.
export function filterCommandItems(query: string, items: CommandItem[]): CommandItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  const woorden = q.split(/\s+/)
  return items.filter((item) => {
    const haystack = [item.label, item.hint ?? '', ...(item.keywords ?? [])].join(' ').toLowerCase()
    return woorden.every((w) => haystack.includes(w))
  })
}
