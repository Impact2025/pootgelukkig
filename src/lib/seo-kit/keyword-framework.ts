// ─────────────────────────────────────────────────────────────────────────
// seo-kit — keyword "sweet spot" framework (Surfer 2026)
// Demand / Fit / Intent / Difficulty -> geautomatiseerde prioriteringsscore.
// Herbruikbaar in content-planning scripts en de Agent OS content pipeline.
// ─────────────────────────────────────────────────────────────────────────

export type IntentType =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'navigational'

export interface KeywordCandidate {
  term: string
  /** Demand: maandelijkse zoekvolume (0 = onbekend) */
  monthlySearches: number
  /** Fit met funnel/aanbod: 0=geen, 3=perfect */
  fit: 0 | 1 | 2 | 3
  intent: IntentType
  /** Kunnen wij precies bieden wat de zoeker wil? */
  ourIntentMatch: boolean
  /** Difficulty t.o.v. huidige autoriteit: 0=makkelijk, 3=zeer lastig */
  difficulty: 0 | 1 | 2 | 3
  notes?: string
}

export interface SweetSpotScore {
  term: string
  demand: number
  fit: number
  intent: number
  difficulty: number
  score: number // 0-100
  verdict: 'do-now' | 'cluster' | 'skip' | 'too-hard'
}

export function scoreKeyword(k: KeywordCandidate): SweetSpotScore {
  // Demand op log-schaal (0..100) — voorkomt dat 100k-volume alles domineert
  const demand = Math.min(
    100,
    Math.round((Math.log10(k.monthlySearches + 1) / Math.log10(100001)) * 100),
  )
  const fit = (k.fit / 3) * 100
  const intent = (k.ourIntentMatch ? 1 : 0) * 100
  const difficulty = (1 - k.difficulty / 3) * 100

  // Weighted: demand+fit zwaarder, intent harde voorwaarde, difficulty remt
  const score = Math.round(0.3 * demand + 0.3 * fit + 0.2 * intent + 0.2 * difficulty)

  let verdict: SweetSpotScore['verdict'] = 'cluster'
  if (!k.ourIntentMatch) verdict = 'skip'
  else if (score >= 70) verdict = 'do-now'
  else if (difficulty < 34) verdict = 'too-hard'

  return {
    term: k.term,
    demand,
    fit: Math.round(fit),
    intent: Math.round(intent),
    difficulty: Math.round(difficulty),
    score,
    verdict,
  }
}

/** Bottom-up prioriteringsvolgorde voor een content-cluster. */
export function prioritizeCluster(candidates: KeywordCandidate[]): SweetSpotScore[] {
  return candidates
    .map(scoreKeyword)
    .sort((a, b) => {
      // do-now eerst, daarna op score
      const rank = (v: string) => ({ 'do-now': 0, cluster: 1, 'too-hard': 2, skip: 3 }[v] ?? 9)
      return rank(a.verdict) - rank(b.verdict) || b.score - a.score
    })
}
