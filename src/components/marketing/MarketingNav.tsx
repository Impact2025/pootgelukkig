'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/werkwijze', label: 'Werkwijze' },
  { href: '/voor-asielen', label: 'Voor asiels' },
  { href: '/prijzen', label: 'Prijzen' },
  { href: '/ai-assistent', label: 'AI-assistent' },
  { href: '/kennisbank', label: 'Kennisbank' },
  { href: '/blog', label: 'Blog' },
]

export function MarketingNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        scrolled || open
          ? 'border-b border-[#33335c]/8 bg-[#f9fafb]/90 backdrop-blur-md'
          : 'border-b border-transparent bg-[#f9fafb]'
      }`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="PootGelukkig home">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#33335c] text-[#f8aa25]">
            <span className="material-symbols-outlined text-[1.25rem]">pets</span>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[#33335c]">PootGelukkig</span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`text-sm font-semibold transition-colors ${
                    active ? 'text-[#33335c]' : 'text-[#33335c]/55 hover:text-[#33335c]'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#ee5b2b] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#d94e22]"
            >
              Naar mijn dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-[#33335c]/70 transition-colors hover:text-[#33335c]"
              >
                Inloggen
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#ee5b2b] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#d94e22]"
              >
                Aan de slag
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-xl text-[#33335c] lg:hidden"
          aria-label={open ? 'Menu sluiten' : 'Menu openen'}
          aria-expanded={open}
        >
          <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-[#33335c]/8 lg:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2.5 text-base font-semibold text-[#33335c]/80 hover:bg-[#33335c]/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#ee5b2b] px-5 py-3 text-center text-sm font-bold text-white"
                >
                  Naar mijn dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-full border border-[#33335c]/15 px-5 py-3 text-center text-sm font-bold text-[#33335c]"
                  >
                    Inloggen
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-full bg-[#ee5b2b] px-5 py-3 text-center text-sm font-bold text-white"
                  >
                    Aan de slag
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
