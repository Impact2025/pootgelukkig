'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/werkwijze', label: 'Werkwijze' },
  { href: '/voor-organisaties', label: 'Voor organisaties' },
  { href: '/tarieven', label: 'Tarieven' },
  { href: '/#ai-collegas', label: 'AI-collega\'s' },
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
          ? 'border-b border-[#1E293B]/8 bg-[#f9fafb]/90 backdrop-blur-md'
          : 'border-b border-transparent bg-[#f9fafb]'
      }`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="ImpactOS home">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#1E293B] text-[#3B82F6]">
            <span className="material-symbols-outlined text-[1.25rem]">bolt</span>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[#1E293B]">ImpactOS</span>
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
                    active ? 'text-[#1E293B]' : 'text-[#1E293B]/55 hover:text-[#1E293B]'
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
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              Naar mijn portaal
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-[#1E293B]/70 transition-colors hover:text-[#1E293B]"
              >
                Inloggen
              </Link>
              <Link
                href="/contact?onderwerp=demo"
                className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                <span className="material-symbols-outlined text-[1.05rem]">calendar_month</span>
                Plan een demo
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-xl text-[#1E293B] lg:hidden"
          aria-label={open ? 'Menu sluiten' : 'Menu openen'}
          aria-expanded={open}
        >
          <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
        </button>
      </nav>

      {open && (
        <div className="border-t border-[#1E293B]/8 lg:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8">
            <Link
              href="/contact?onderwerp=demo"
              className="mb-1 flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-center text-sm font-bold text-white"
            >
              <span className="material-symbols-outlined text-[1.05rem]">calendar_month</span>
              Plan een demo
            </Link>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2.5 text-base font-semibold text-[#1E293B]/80 hover:bg-[#1E293B]/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isLoggedIn ? (
                <Link
                  href="/admin"
                  className="rounded-full bg-[#2563EB] px-5 py-3 text-center text-sm font-bold text-white"
                >
                  Naar mijn portaal
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-full border border-[#1E293B]/15 px-5 py-3 text-center text-sm font-bold text-[#1E293B]"
                  >
                    Inloggen
                  </Link>
                  <Link
                    href="/voor-organisaties/start"
                    className="rounded-full bg-[#2563EB] px-5 py-3 text-center text-sm font-bold text-white"
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
