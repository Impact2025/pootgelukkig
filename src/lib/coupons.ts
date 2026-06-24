import { db } from '@/lib/db'
import { coupons, couponInwisselingen } from '@/lib/db/schema'
import { eq, and, count, sql } from 'drizzle-orm'

export interface ValidatieContext {
  bedrag?: number // bestedingsbedrag in euro (voor min-besteding + procentkorting)
  email?: string
  userId?: number
}

export interface ValidatieResultaat {
  geldig: boolean
  reden?: string
  korting?: number // berekend kortingsbedrag in euro
  coupon?: {
    id: number
    code: string
    type: 'procent' | 'vast'
    waarde: number
    omschrijving: string | null
  }
}

/**
 * Valideert een couponcode tegen alle regels (actief, geldigheidsperiode,
 * gebruikslimieten, minimale besteding) en berekent het kortingsbedrag.
 * Registreert niets — gebruik registreerInwisseling() bij daadwerkelijk gebruik.
 */
export async function valideerCoupon(code: string, ctx: ValidatieContext = {}): Promise<ValidatieResultaat> {
  const genormaliseerd = code.trim().toUpperCase()
  if (!genormaliseerd) return { geldig: false, reden: 'Geen code opgegeven' }

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(sql`upper(${coupons.code}) = ${genormaliseerd}`)
    .limit(1)

  if (!coupon) return { geldig: false, reden: 'Code bestaat niet' }
  if (!coupon.actief) return { geldig: false, reden: 'Code is gedeactiveerd' }

  const nu = new Date()
  if (coupon.startOp && nu < coupon.startOp) return { geldig: false, reden: 'Code is nog niet geldig' }
  if (coupon.vervalOp && nu > coupon.vervalOp) return { geldig: false, reden: 'Code is verlopen' }

  if (coupon.maxGebruik != null && coupon.gebruiktAantal >= coupon.maxGebruik) {
    return { geldig: false, reden: 'Code is volledig gebruikt' }
  }

  if (coupon.minBesteding != null && (ctx.bedrag ?? 0) < coupon.minBesteding) {
    return { geldig: false, reden: `Minimale besteding van € ${coupon.minBesteding} niet gehaald` }
  }

  // Limiet per klant
  if (coupon.perKlantLimiet != null && (ctx.email || ctx.userId)) {
    const voorwaarden = [eq(couponInwisselingen.couponId, coupon.id)]
    if (ctx.userId) voorwaarden.push(eq(couponInwisselingen.userId, ctx.userId))
    else if (ctx.email) voorwaarden.push(eq(couponInwisselingen.email, ctx.email.trim().toLowerCase()))
    const [klantGebruik] = await db
      .select({ aantal: count() })
      .from(couponInwisselingen)
      .where(and(...voorwaarden))
    if (Number(klantGebruik?.aantal ?? 0) >= coupon.perKlantLimiet) {
      return { geldig: false, reden: 'Je hebt deze code al gebruikt' }
    }
  }

  const korting = berekenKorting(coupon.type, coupon.waarde, ctx.bedrag)

  return {
    geldig: true,
    korting,
    coupon: { id: coupon.id, code: coupon.code, type: coupon.type, waarde: coupon.waarde, omschrijving: coupon.omschrijving },
  }
}

export function berekenKorting(type: 'procent' | 'vast', waarde: number, bedrag?: number): number {
  if (type === 'procent') {
    if (bedrag == null) return 0
    return Math.round(((bedrag * waarde) / 100) * 100) / 100
  }
  // vast bedrag — nooit meer dan het bestedingsbedrag
  return bedrag != null ? Math.min(waarde, bedrag) : waarde
}

/**
 * Registreert het daadwerkelijke gebruik van een coupon en verhoogt de teller.
 */
export async function registreerInwisseling(
  couponId: number,
  data: { userId?: number; email?: string; bedragKorting: number }
): Promise<void> {
  await db.insert(couponInwisselingen).values({
    couponId,
    userId: data.userId ?? null,
    email: data.email?.trim().toLowerCase() ?? null,
    bedragKorting: data.bedragKorting,
  })
  await db
    .update(coupons)
    .set({ gebruiktAantal: sql`${coupons.gebruiktAantal} + 1` })
    .where(eq(coupons.id, couponId))
}
