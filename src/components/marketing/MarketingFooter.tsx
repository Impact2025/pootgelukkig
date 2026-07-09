import Link from 'next/link'

const COLS = [
  {
    title: 'Product',
    links: [
      { href: '/werkwijze', label: 'Werkwijze' },
      { href: '/ai-assistent', label: 'AI-assistent' },
      { href: '/voor-asielen', label: 'Voor asiels' },
      { href: '/demo-aanvragen', label: 'Demo aanvragen' },
      { href: '/prijzen', label: 'Prijzen' },
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
    <footer className="border-t border-[#33335c]/8 bg-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label="PootGelukkig home">
              <span className="flex size-8 items-center justify-center rounded-xl bg-[#33335c] text-[#f8aa25]">
                <span className="material-symbols-outlined text-[1.25rem]">pets</span>
              </span>
              <span className="text-lg font-extrabold tracking-tight text-[#33335c]">PootGelukkig</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#33335c]/55">
              Slimme matching die asiels helpt om sneller en beter de juiste adoptant bij het juiste dier te vinden.
              Een initiatief van WeAreImpact.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#33335c]/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[#33335c]/65 transition-colors hover:text-[#33335c]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#33335c]/8 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-[#33335c]/45">
            &copy; {new Date().getFullYear()} PootGelukkig &middot; WeAreImpact
          </p>
          <div className="flex gap-6 text-sm text-[#33335c]/45">
            <Link href="/privacy" className="hover:text-[#33335c]">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-[#33335c]">Voorwaarden</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
