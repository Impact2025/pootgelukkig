export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { wachtlijst } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import WachtlijstActies from './WachtlijstActies'

const soortEmoji: Record<string, string> = {
  hond: '🐕',
  kat: '🐈',
  vogel: '🦜',
  konijn: '🐇',
  cavia: '🐹',
  hamster: '🐹',
  overig: '🐾',
}

const soortLabel: Record<string, string> = {
  hond: 'Hond',
  kat: 'Kat',
  vogel: 'Vogel',
  konijn: 'Konijn',
  cavia: 'Cavia',
  hamster: 'Hamster',
  overig: 'Overig',
}

export default async function WachtlijstPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const entries = await db
    .select()
    .from(wachtlijst)
    .where(eq(wachtlijst.actief, true))
    .orderBy(desc(wachtlijst.aangemeldOp))

  // Tellingen per soort
  const telPerSoort = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.soort] = (acc[e.soort] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#33335c]">Wachtlijst</h1>
          <p className="text-sm text-[#33335c]/50 mt-1">
            {entries.length} actieve {entries.length === 1 ? 'aanmelding' : 'aanmeldingen'}
          </p>
        </div>
      </div>

      {/* Soort badges */}
      {entries.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {Object.entries(telPerSoort).map(([soort, aantal]) => (
            <div
              key={soort}
              className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-1.5 text-sm font-semibold text-[#33335c]"
            >
              <span>{soortEmoji[soort] ?? '🐾'}</span>
              <span>{soortLabel[soort] ?? soort}</span>
              <span className="bg-[#33335c] text-[#f8aa25] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {aantal}
              </span>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <span
            className="material-symbols-outlined text-5xl text-gray-200 mb-3 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            format_list_bulleted
          </span>
          <p className="text-[#33335c]/40 font-semibold">Wachtlijst is leeg</p>
          <p className="text-[#33335c]/30 text-sm mt-1">
            Mensen kunnen zich aanmelden via de website.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Naam
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Diersoort
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Ras
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Leeftijdswens
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Aangemeld
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`${
                    i < entries.length - 1 ? 'border-b border-gray-50' : ''
                  } hover:bg-gray-50/50 transition-colors`}
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#33335c] text-sm">{entry.naam}</p>
                    {entry.notities && (
                      <p className="text-[#33335c]/40 text-xs mt-0.5 truncate max-w-[180px]">
                        {entry.notities}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`mailto:${entry.email}`}
                      className="text-sm text-[#33335c]/70 hover:text-[#33335c] transition-colors"
                    >
                      {entry.email}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-[#33335c]">
                      <span>{soortEmoji[entry.soort] ?? '🐾'}</span>
                      {soortLabel[entry.soort] ?? entry.soort}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#33335c]/60">
                    {entry.ras ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#33335c]/60">
                    {entry.leeftijdVoorkeur ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#33335c]/40">
                    {new Date(entry.aangemeldOp).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <WachtlijstActies id={entry.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
