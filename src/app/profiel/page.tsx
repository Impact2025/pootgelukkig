export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users, adopterProfielen, matches, favorieten } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import PostcodeForm from './PostcodeForm'
import UitlogKnop from './UitlogKnop'

export default async function ProfielPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = parseInt(session.user.id)

  const [user] = await db
    .select({ naam: users.naam, email: users.email, aangemeldOp: users.aangemeldOp, postcode: users.postcode, stad: users.stad })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const [profiel] = await db
    .select()
    .from(adopterProfielen)
    .where(eq(adopterProfielen.userId, userId))
    .limit(1)

  const [matchTelling] = await db
    .select({ aantal: count() })
    .from(matches)
    .where(eq(matches.userId, userId))

  const [favorietTelling] = await db
    .select({ aantal: count() })
    .from(favorieten)
    .where(eq(favorieten.userId, userId))

  const aantalMatches = matchTelling?.aantal ?? 0
  const aantalFavorieten = favorietTelling?.aantal ?? 0

  const woningLabel: Record<string, string> = {
    appartement: 'Appartement',
    huis_zonder_tuin: 'Huis zonder tuin',
    huis_met_tuin: 'Huis met tuin',
    boerderij: 'Boerderij',
  }

  const activiteitLabel: Record<string, string> = {
    laag: 'Rustig aan',
    normaal: 'Normaal actief',
    hoog: 'Actief',
    zeer_hoog: 'Heel actief',
  }

  return (
    <div className="mobile-container bg-bg-dark">
      {/* Header */}
      <header className="px-4 pt-14 pb-6 text-center relative">
        {/* Avatar */}
        <div className="size-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">{user?.naam}</h1>
        <p className="text-white/40 text-sm mt-1">{user?.email}</p>
        {user?.aangemeldOp && (
          <p className="text-white/25 text-xs mt-1">
            Lid sinds{' '}
            {new Date(user.aangemeldOp).toLocaleDateString('nl-NL', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </header>

      {/* Stats */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">{aantalMatches}</p>
            <p className="text-white/50 text-[11px] font-medium mt-1">Matches</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-white">{aantalFavorieten}</p>
            <p className="text-white/50 text-[11px] font-medium mt-1">Bewaard</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-extrabold text-white">
              {profiel ? (
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              ) : '—'}
            </p>
            <p className="text-white/50 text-[11px] font-medium mt-1">
              {profiel ? 'Intake klaar' : 'Intake open'}
            </p>
          </div>
        </div>
      </div>

      {/* Profiel details */}
      {profiel ? (
        <section className="px-4 mb-6">
          <h2 className="text-white font-bold text-base mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">manage_accounts</span>
            Jouw leefstijl profiel
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <ProfielRij
              label="Woning"
              waarde={woningLabel[profiel.woningType ?? ''] ?? profiel.woningType ?? '—'}
            />
            <ProfielRij
              label="Activiteit"
              waarde={
                activiteitLabel[profiel.activiteitNiveau ?? ''] ?? profiel.activiteitNiveau ?? '—'
              }
            />
            <ProfielRij
              label="Kinderen"
              waarde={
                profiel.aantalKinderen && profiel.aantalKinderen > 0
                  ? `${profiel.aantalKinderen} kind(eren)`
                  : 'Geen kinderen'
              }
            />
            <ProfielRij
              label="Ervaring"
              waarde={profiel.ervaringNiveau ?? '—'}
              isLast
            />
          </div>
        </section>
      ) : (
        <div className="px-4 mb-6">
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 text-center">
            <p className="text-white/60 text-sm mb-3">
              Je hebt de intake nog niet gedaan. Start nu voor je matches!
            </p>
            <Link href="/intake">
              <button className="btn-primary">
                <span className="material-symbols-outlined">quiz</span>
                Start de intake
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Locatie */}
      <PostcodeForm huidigePostcode={user?.postcode ?? null} huidigeStad={user?.stad ?? null} />

      {/* Menu opties */}
      <div className="px-4 space-y-3 mb-8">
        <Link href="/intake">
          <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/8 rounded-2xl hover:bg-white/8 transition-colors">
            <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/60">refresh</span>
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Intake opnieuw doen</p>
              <p className="text-white/40 text-xs">Herbereken je matches</p>
            </div>
            <span className="material-symbols-outlined text-white/20 ml-auto">
              arrow_forward_ios
            </span>
          </div>
        </Link>

        <Link href="/dossier">
          <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/8 rounded-2xl hover:bg-white/8 transition-colors">
            <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/60">folder</span>
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Mijn dossier</p>
              <p className="text-white/40 text-xs">Documenten en adoptieoverzicht</p>
            </div>
            <span className="material-symbols-outlined text-white/20 ml-auto">
              arrow_forward_ios
            </span>
          </div>
        </Link>
      </div>

      {/* Uitloggen */}
      <div className="px-4 pb-32">
        <UitlogKnop />
      </div>

      <BottomNav />
    </div>
  )
}

function ProfielRij({
  label,
  waarde,
  isLast = false,
}: {
  label: string
  waarde: string
  isLast?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${!isLast ? 'border-b border-white/5' : ''}`}
    >
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white text-sm font-medium capitalize">{waarde}</span>
    </div>
  )
}
