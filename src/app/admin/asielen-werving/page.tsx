export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { asielen } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import WervingClient from './WervingClient'

export default async function AsielenWervingPage() {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'admin') {
    redirect('/admin')
  }

  const nieuweAsielen = await db
    .select()
    .from(asielen)
    .where(eq(asielen.wervingStatus, 'nieuw'))
    .orderBy(asielen.regio, asielen.naam)

  const [uitgenodigd] = await db
    .select({ aantal: count() })
    .from(asielen)
    .where(eq(asielen.wervingStatus, 'uitgenodigd'))

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#33335c]">Asielen werving</h1>
          <p className="text-sm text-[#33335c]/50 mt-1">
            Nieuw gevonden asielen. Controleer het e-mailadres en stuur een uitnodiging
            in de huisstijl.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
          <span
            className="material-symbols-outlined text-[#f8aa25] text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
          <div>
            <p className="text-lg font-extrabold text-[#33335c] leading-none">
              {uitgenodigd?.aantal ?? 0}
            </p>
            <p className="text-[10px] text-[#33335c]/40 font-semibold uppercase tracking-wider">
              Uitgenodigd
            </p>
          </div>
        </div>
      </div>

      <WervingClient asielen={nieuweAsielen} />
    </div>
  )
}
