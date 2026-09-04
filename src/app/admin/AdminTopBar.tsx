'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { deriveBreadcrumbs } from '@/components/admin/nav'
import { cx, Avatar } from '@/components/admin/ui'
import type { AdminCounts, AdminUser } from './AdminShell'

interface Props {
  user: AdminUser
  counts: AdminCounts
  onToggleSidebar: () => void
  onOpenPalette: () => void
}

interface Melding {
  label: string
  href: string
  icon: string
}

function meldingen(counts: AdminCounts, isAdmin: boolean): Melding[] {
  // Het management-portaal toont geen organisatie-operatie meldingen.
  if (isAdmin) return []
  const lijst: Melding[] = []
  if (counts.wachtrij > 0)
    lijst.push({ label: `${counts.wachtrij} AI-${counts.wachtrij === 1 ? 'concept wacht' : 'concepten wachten'} op goedkeuring`, href: '/admin/content-queue', icon: 'inbox' })
  return lijst
}

export default function AdminTopBar({ user, counts, onToggleSidebar, onOpenPalette }: Props) {
  const pathname = usePathname()
  const crumbs = deriveBreadcrumbs(pathname)
  const [meldingenOpen, setMeldingenOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const lijst = meldingen(counts, user.rol === 'admin')
  const totaal = lijst.length

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[#1E293B]/8 bg-[#f6f8f6]/85 px-4 backdrop-blur sm:px-6">
      {/* Links: toggle + breadcrumbs */}
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Menu in- of uitklappen"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#1E293B]/60 transition-colors hover:bg-white hover:text-[#1E293B]"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <nav aria-label="Kruimelpad" className="hidden min-w-0 items-center text-sm sm:flex">
          {crumbs.map((c) => (
            <span key={c.href} className="flex min-w-0 items-center">
              {c.isLast ? (
                <span className="truncate font-bold text-[#1E293B]">{c.label}</span>
              ) : (
                <>
                  <Link href={c.href} className="truncate font-semibold text-[#1E293B]/45 hover:text-[#1E293B]">
                    {c.label}
                  </Link>
                  <span className="px-1.5 text-[#1E293B]/25">/</span>
                </>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Rechts: zoeken, meldingen, gebruiker */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex items-center gap-2 rounded-xl border border-[#1E293B]/10 bg-white px-3 py-2 text-sm font-medium text-[#1E293B]/45 transition-colors hover:border-[#1E293B]/25"
        >
          <span className="material-symbols-outlined text-[1.2rem]">search</span>
          <span className="hidden sm:inline">Zoeken</span>
          <kbd className="hidden rounded border border-[#1E293B]/15 bg-[#f6f8f6] px-1.5 py-0.5 text-[10px] font-bold text-[#1E293B]/40 sm:inline">
            Ctrl K
          </kbd>
        </button>

        {/* Meldingen */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMeldingenOpen((o) => !o)}
            aria-label="Meldingen"
            className="relative flex size-9 items-center justify-center rounded-lg text-[#1E293B]/60 transition-colors hover:bg-white hover:text-[#1E293B]"
          >
            <span className="material-symbols-outlined">notifications</span>
            {totaal > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-red-500" />
            )}
          </button>
          {meldingenOpen && (
            <>
              <button type="button" aria-hidden className="fixed inset-0 z-40 cursor-default" onClick={() => setMeldingenOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-[#1E293B]/10 bg-white shadow-xl">
                <div className="border-b border-gray-50 px-4 py-3">
                  <p className="text-sm font-bold text-[#1E293B]">Meldingen</p>
                </div>
                {lijst.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-[#1E293B]/40">Geen openstaande meldingen</p>
                ) : (
                  <ul className="py-1">
                    {lijst.map((m) => (
                      <li key={m.href}>
                        <Link
                          href={m.href}
                          onClick={() => setMeldingenOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B]/80 hover:bg-gray-50"
                        >
                          <span className="material-symbols-outlined text-[1.2rem] text-[#1E293B]/45">{m.icon}</span>
                          <span className="flex-1">{m.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {/* Gebruiker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-white"
          >
            <Avatar naam={user.naam} className="size-8" />
            <span className="hidden max-w-[120px] truncate text-sm font-bold text-[#1E293B] md:inline">{user.naam}</span>
            <span className="material-symbols-outlined text-[1.1rem] text-[#1E293B]/40">expand_more</span>
          </button>
          {userOpen && (
            <>
              <button type="button" aria-hidden className="fixed inset-0 z-40 cursor-default" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-[#1E293B]/10 bg-white shadow-xl">
                <div className="border-b border-gray-50 px-4 py-3">
                  <p className="truncate text-sm font-bold text-[#1E293B]">{user.naam}</p>
                  <p className="truncate text-xs text-[#1E293B]/45">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href={user.rol === 'admin' ? '/management/instellingen' : '/admin/instellingen'}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1E293B]/80 hover:bg-gray-50"
                  >
                    <span className="material-symbols-outlined text-[1.2rem] text-[#1E293B]/45">settings</span>
                    Instellingen
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/auth/login' })}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-[1.2rem]">logout</span>
                    Uitloggen
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
