import Link from 'next/link'

const COLS = [
  {
    title: 'Product',
    links: [
      { href: '/werkwijze', label: 'Werkwijze' },
      { href: '/#ai-collegas', label: 'AI-collega\'s' },
      { href: '/voor-organisaties', label: 'Voor organisaties' },
      { href: '/contact?onderwerp=demo', label: 'Demo aanvragen' },
      { href: '/tarieven', label: 'Tarieven' },
    ],
  },
  {
    title: 'Kennis',
    links: [
      { href: '/kennisbank', label: 'Kennisbank' },
      { href: '/blog', label: 'Blog' },
      { href: '/faq', label: 'Veelgestelde vragen' },
    ],
  },
  {
    title: 'Organisatie',
    links: [
      { href: '/over-ons', label: 'Over ons' },
      { href: '/contact', label: 'Contact' },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#1E293B]/8 bg-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label="ImpactOS home">
              <span className="flex size-8 items-center justify-center rounded-xl bg-[#1E293B] text-[#3B82F6]">
                <span className="material-symbols-outlined text-[1.25rem]">bolt</span>
              </span>
              <span className="text-lg font-extrabold tracking-tight text-[#1E293B]">ImpactOS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#1E293B]/55">
              Het AI-gestuurde platform voor sociaal ondernemers en zorgkwartiermakers. Minder
              bureaucratie, meer maatschappelijke impact. Een initiatief van WeAreImpact.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#1E293B]/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[#1E293B]/65 transition-colors hover:text-[#1E293B]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#1E293B]/8 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-[#1E293B]/45">
            &copy; {new Date().getFullYear()} ImpactOS &middot; WeAreImpact
          </p>
          <div className="flex gap-6 text-sm text-[#1E293B]/45">
            <Link href="/privacy" className="hover:text-[#1E293B]">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-[#1E293B]">Voorwaarden</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
