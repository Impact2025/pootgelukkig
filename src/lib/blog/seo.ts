// SEO-analyse voor blogartikelen — geeft een score (0-100) + concrete verbeterpunten.

export interface SeoInput {
  titel: string
  inhoudMd: string
  metaTitle?: string | null
  metaDescription?: string | null
  focusKeyword?: string | null
  interneLinks?: { tekst: string; url: string }[] | null
  externeLinks?: { tekst: string; url: string }[] | null
}

export interface SeoPunt {
  ok: boolean
  gewicht: number
  tekst: string
}

export interface SeoResultaat {
  score: number
  punten: SeoPunt[]
}

function woorden(tekst: string): string[] {
  return tekst
    .replace(/[#>*_`\[\]()!-]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

export function berekenSeoScore(input: SeoInput): SeoResultaat {
  const kw = (input.focusKeyword ?? '').trim().toLowerCase()
  const inhoud = input.inhoudMd ?? ''
  const inhoudLc = inhoud.toLowerCase()
  const alleWoorden = woorden(inhoud)
  const aantalWoorden = alleWoorden.length
  const metaTitle = input.metaTitle ?? ''
  const metaDesc = input.metaDescription ?? ''
  const h2s = (inhoud.match(/^##\s+/gm) ?? []).length
  const subkoppen = inhoud.match(/^#{2,3}\s+(.*)$/gm) ?? []
  const interne = input.interneLinks?.length ?? 0
  const externe = input.externeLinks?.length ?? 0

  // Keyworddichtheid
  let kwCount = 0
  if (kw) {
    const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    kwCount = (inhoudLc.match(re) ?? []).length
  }
  const dichtheid = aantalWoorden > 0 ? (kwCount / aantalWoorden) * 100 : 0

  const punten: SeoPunt[] = [
    {
      ok: !!kw && input.titel.toLowerCase().includes(kw),
      gewicht: 15,
      tekst: 'Focuskeyword staat in de titel',
    },
    {
      ok: !!kw && inhoudLc.slice(0, Math.max(300, inhoud.length * 0.1)).includes(kw),
      gewicht: 10,
      tekst: 'Focuskeyword in de eerste alinea',
    },
    {
      ok: !!kw && subkoppen.some((h) => h.toLowerCase().includes(kw)),
      gewicht: 10,
      tekst: 'Focuskeyword in minstens één subkop',
    },
    {
      ok: dichtheid >= 0.4 && dichtheid <= 2.8,
      gewicht: 10,
      tekst: `Keyworddichtheid gezond (nu ${dichtheid.toFixed(1)}%, ideaal 0.5–2.5%)`,
    },
    {
      ok: aantalWoorden >= 600,
      gewicht: 15,
      tekst: `Voldoende lengte (nu ${aantalWoorden} woorden, streef ≥ 600)`,
    },
    {
      ok: h2s >= 2,
      gewicht: 10,
      tekst: `Minstens 2 H2-koppen (nu ${h2s})`,
    },
    {
      ok: metaTitle.length >= 30 && metaTitle.length <= 60,
      gewicht: 10,
      tekst: `Meta-titel 30–60 tekens (nu ${metaTitle.length})`,
    },
    {
      ok: metaDesc.length >= 70 && metaDesc.length <= 160,
      gewicht: 10,
      tekst: `Meta-omschrijving 70–160 tekens (nu ${metaDesc.length})`,
    },
    {
      ok: interne >= 1,
      gewicht: 5,
      tekst: `Minstens 1 interne link (nu ${interne})`,
    },
    {
      ok: externe >= 1,
      gewicht: 5,
      tekst: `Minstens 1 externe link naar gezaghebbende bron (nu ${externe})`,
    },
  ]

  const totaalGewicht = punten.reduce((s, p) => s + p.gewicht, 0)
  const behaald = punten.filter((p) => p.ok).reduce((s, p) => s + p.gewicht, 0)
  const score = Math.round((behaald / totaalGewicht) * 100)

  return { score, punten }
}

// Genereer een URL-veilige slug uit een titel
export function slugify(tekst: string): string {
  return tekst
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}
