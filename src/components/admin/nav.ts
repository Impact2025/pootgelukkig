// Eén bron van waarheid voor admin-navigatie, breadcrumbs, statuskleuren en de
// command palette. Framewerk-onafhankelijk en puur, zodat alles testbaar is.

export interface NavItem {
  href: string
  icon: string
  label: string
  exact?: boolean
  highlight?: boolean
  badge?: 'wachtrij'
  adminOnly?: boolean
  asielOnly?: boolean
}

export interface NavGroup {
  titel?: string
  items: NavItem[]
}

// Organisatie-portaal: dagelijkse operatie van één organisatie.
export const asielNav: NavGroup[] = [
  {
    items: [
      { href: '/admin', icon: 'grid_view', label: 'Dashboard', exact: true },
      { href: '/admin/content-queue', icon: 'inbox', label: 'Wachtrij', badge: 'wachtrij' },
    ],
  },
  {
    titel: 'Dossiers & Cliënten',
    items: [
      { href: '/admin/dossiers', icon: 'folder', label: 'Dossiers & Cliënten' },
      { href: '/admin/agenda', icon: 'calendar_month', label: 'Agenda & Planning' },
      { href: '/admin/helpdesk', icon: 'support_agent', label: 'Helpdesk & Inbox' },
    ],
  },
  {
    titel: 'Relaties & Content',
    items: [
      { href: '/admin/crm', icon: 'contacts', label: 'CRM & Relaties' },
      { href: '/admin/social', icon: 'campaign', label: 'Social Media & PR' },
      { href: '/admin/blog', icon: 'article', label: 'Blog Beheer' },
    ],
  },
  {
    titel: 'Beheer',
    items: [
      { href: '/admin/copilot', icon: 'auto_awesome', label: 'AI Copilot', highlight: true },
      { href: '/admin/ai-rollen', icon: 'group_add', label: 'AI Rollen & Copilot' },
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
      { href: '/management/asielen-werving', icon: 'domain_add', label: 'Organisaties werving' },
      { href: '/management/rapportage', icon: 'bar_chart', label: 'Rapportage' },
      { href: '/admin/content-queue', icon: 'inbox', label: 'Wachtrij' },
    ],
  },
  {
    titel: 'Content',
    items: [
      { href: '/management/blog', icon: 'article', label: 'Blog' },
      { href: '/management/coupons', icon: 'sell', label: 'Coupons' },
      { href: '/admin/ai-rollen', icon: 'group_add', label: 'AI-rollen activeren' },
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
  dossiers: 'Dossiers',
  clienten: 'Cliënten',
  nieuw: 'Nieuw',
  bewerken: 'Bewerken',
  'asielen-werving': 'Organisaties werving',
  rapportage: 'Rapportage',
  instellingen: 'Instellingen',
  copilot: 'AI Copilot',
  agenda: 'Agenda & Planning',
  helpdesk: 'Helpdesk & Inbox',
  social: 'Social Media & PR',
  beheer: 'Management',
  gebruikers: 'Gebruikers',
  crm: 'CRM',
  blog: 'Blog',
  coupons: 'Coupons',
  'ai-rollen': 'AI-rollen',
  'content-queue': 'Wachtrij',
  management: 'Management',
}

export interface Crumb {
  label: string
  href: string
  isLast: boolean
}

// Leidt een breadcrumb-pad af van een URL-pad. Numerieke/uuid id-segmenten worden
// als "Detail" getoond. Het eerste segment (admin) linkt naar het dashboard.
export function deriveBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: Crumb[] = []
  let href = ''
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    href += `/${seg}`
    const isId = /^[0-9a-f-]{8,}$|^\d+$/i.test(seg)
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
  // dossiers
  intake: 'info',
  actief: 'success',
  in_behandeling: 'warning',
  afgerond: 'success',
  // organisaties
  proef: 'warning',
  gearchiveerd: 'neutral',
  // clienten
  aangemeld: 'info',
  gematcht: 'success',
  // begeleidingen
  gepland: 'info',
  gestopt: 'danger',
  // ai_content_queue
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  // blog
  concept: 'warning',
  gepubliceerd: 'success',
  // afspraken (agenda)
  aangevraagd: 'warning',
  bevestigd: 'success',
  geannuleerd: 'danger',
  // helpdesk
  open: 'warning',
  concept_klaar: 'info',
  beantwoord: 'success',
}

const STATUS_LABELS: Record<string, string> = {
  intake: 'Intake',
  actief: 'Actief',
  in_behandeling: 'In behandeling',
  afgerond: 'Afgerond',
  proef: 'Proef',
  gearchiveerd: 'Gearchiveerd',
  aangemeld: 'Aangemeld',
  gematcht: 'Gematcht',
  gepland: 'Gepland',
  gestopt: 'Gestopt',
  pending: 'In afwachting',
  approved: 'Goedgekeurd',
  rejected: 'Afgewezen',
  concept: 'Concept',
  gepubliceerd: 'Gepubliceerd',
  aangevraagd: 'Aangevraagd',
  bevestigd: 'Bevestigd',
  geannuleerd: 'Geannuleerd',
  open: 'Open',
  concept_klaar: 'Concept klaar',
  beantwoord: 'Beantwoord',
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
  { id: 'nieuw-dossier', label: 'Nieuw dossier aanmaken', icon: 'add_circle', href: '/admin/dossiers/nieuw', keywords: ['toevoegen', 'aanmaken', 'dossier'] },
  { id: 'nieuwe-client', label: 'Nieuwe cliënt aanmaken', icon: 'person_add', href: '/intake', keywords: ['client', 'toevoegen', 'aanmaken'] },
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
