import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gesprekken, berichten, users, dieren } from '@/lib/db/schema'
import { eq, desc, count, and } from 'drizzle-orm'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const alleGesprekken = await db
      .select({
        id: gesprekken.id,
        dierId: gesprekken.dierId,
        userId: gesprekken.userId,
        asielId: gesprekken.asielId,
        laasteBerichtOp: gesprekken.laasteBerichtOp,
        afspraakDatum: gesprekken.afspraakDatum,
        afspraakBevestigd: gesprekken.afspraakBevestigd,
        aangemaaktOp: gesprekken.aangemaaktOp,
        adoptantNaam: users.naam,
        adoptantEmail: users.email,
        dierNaam: dieren.naam,
        dierFotoUrl: dieren.hoofdFotoUrl,
        dierSoort: dieren.soort,
      })
      .from(gesprekken)
      .innerJoin(users, eq(gesprekken.userId, users.id))
      .innerJoin(dieren, eq(gesprekken.dierId, dieren.id))
      .orderBy(desc(gesprekken.laasteBerichtOp))

    // Tel ongelezen berichten van adoptant per gesprek
    const ongelezen = await db
      .select({
        gesprekId: berichten.gesprekId,
        aantal: count(),
      })
      .from(berichten)
      .where(and(eq(berichten.verzenderType, 'adoptant'), eq(berichten.gelezen, false)))
      .groupBy(berichten.gesprekId)

    const onglezenMap = new Map(ongelezen.map((r) => [r.gesprekId, Number(r.aantal)]))

    const result = alleGesprekken.map((g) => ({
      ...g,
      ongelezen: onglezenMap.get(g.id) ?? 0,
    }))

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Admin gesprekken GET fout:', error)
    return NextResponse.json({ error: 'Kon gesprekken niet ophalen' }, { status: 500 })
  }
}
