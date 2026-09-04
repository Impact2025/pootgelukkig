/**
 * In-memory rate limiter.
 * Werkt per Vercel instantie — voldoende voor MVP.
 * Vervang door Redis (Upstash) bij schaalbare productie.
 */

interface Entry {
  hits: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Opschonen elke minuut — unref() zodat deze timer een proces (of testrun) nooit
// levend houdt puur om zichzelf.
const opschoonTimer = setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key)
    }
  },
  60_000
)
opschoonTimer.unref?.()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSec: number
}

export function checkRateLimit(
  key: string,
  maxHits: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { hits: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxHits - 1, retryAfterSec: 0 }
  }

  if (entry.hits >= maxHits) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    }
  }

  entry.hits++
  return { allowed: true, remaining: maxHits - entry.hits, retryAfterSec: 0 }
}

/**
 * Bepaal de rate-limit key: gebruiker-ID als ingelogd, anders IP-adres.
 */
export function getRateLimitKey(
  request: Request,
  userId?: string,
  prefix = 'rl'
): string {
  if (userId) return `${prefix}:user:${userId}`
  const forwarded = (request.headers as Headers).get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? 'unknown'
  return `${prefix}:ip:${ip}`
}
