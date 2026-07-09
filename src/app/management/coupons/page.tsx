export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import CouponBeheer from './CouponBeheer'

export default async function CouponsPage() {
  const lijst = await db.select().from(coupons).orderBy(desc(coupons.aangemaaktOp))
  // Datums serialiseren naar ISO-strings voor de client component
  const data = lijst.map((c) => ({
    ...c,
    startOp: c.startOp ? c.startOp.toISOString() : null,
    vervalOp: c.vervalOp ? c.vervalOp.toISOString() : null,
    aangemaaktOp: c.aangemaaktOp.toISOString(),
  }))
  return <CouponBeheer coupons={data} />
}
