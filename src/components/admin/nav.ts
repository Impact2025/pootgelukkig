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
}

export interface NavGroup {
  titel?: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
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
      { href: '/admin/asielen-werving', icon: 'domain_add', label: 'Asielen werving' },
      { href: '/admin/rapportage', icon: 'bar_chart', label: 'Rapportage' },
      { href: '/admin/instellingen', icon: 'settings', label: 'Instellingen' },
    ],
  },
  {
    titel: 'Beheer',
    items: [
      { href: '/admin/beheer', icon: 'insights', label: 'Management', exact: true, adminOnly: true },
      { href: '/admin/beheer/gebruikers', icon: 'group', label: 'Gebruikers', adminOnly: true },
      { href: '/admin/beheer/crm', icon: 'contacts', label: 'CRM', adminOnly: true },
      { href: '/admin/beheer/blog', icon: 'article', label: 'Blog', adminOnly: true },
      { href: '/admin/beheer/coupons', icon: 'sell', label: 'Coupons', adminOnly: true },
    ],
  },
  {
    titel: 'AI-team',
    items: [
      { href: '/admin/instellingen/ai-rollen', icon: 'group_add', label: 'AI-rollen activeren' },
    ],
  },
]

// Vlakke lijst van alle navitems (handig voor palette + breadcrumbs).
export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

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
  { id: 'rapportage', label: 'Rapportage downloaden', icon: 'download', href: '/admin/rapportage', keywords: ['export', 'pdf', 'csv'] },
]

// Bouwt de volledige lijst commando's: navigatie + snelle acties (gefilterd op rol).
export function buildCommandItems(isAdmin: boolean): CommandItem[] {
  const navCommands: CommandItem[] = ALL_NAV_ITEMS.filter((i) => isAdmin || !i.adminOnly).map((i) => ({
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
