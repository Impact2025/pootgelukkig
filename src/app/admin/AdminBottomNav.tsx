'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cx } from '@/components/admin/ui'
import type { AdminCounts } from './AdminShell'

interface BottomItem {
  href: string
  icon: string
  label: string
  exact?: boolean
  badge?: keyof AdminCounts
}

const ITEMS: BottomItem[] = [
  { href: '/admin', icon: 'space_dashboard', label: 'Cockpit', exact: true },
  { href: '/admin/content-queue', icon: 'checklist', label: 'Wachtrij', badge: 'wachtrij' },
  { href: '/admin/dossiers', icon: 'folder_open', label: 'Dossiers' },
  { href: '/admin#ai-budget', icon: 'account_balance_wallet', label: 'Financiën' },
]

export default function AdminBottomNav({ counts }: { counts: AdminCounts }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-calm-outline-variant/40 bg-calm-surface-lowest/80 pb-safe backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-2xl items-stretch justify-between px-2">
        {ITEMS.map((item) => {
          const path = item.href.split('#')[0]
          const active = item.exact ? pathname === path : pathname.startsWith(path)
          const badgeValue = item.badge ? counts[item.badge] : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'relative flex flex-1 flex-col items-center gap-1 py-2.5 font-inter text-[10px] font-bold transition-colors',
                active ? 'text-calm-primary-container' : 'text-calm-on-surface-variant/60'
              )}
            >
              <span className="relative">
                <span
                  className="material-symbols-outlined text-[1.35rem]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {!!badgeValue && (
                  <span className="absolute -right-2 -top-1 flex min-w-[16px] items-center justify-center rounded-full bg-calm-primary-container px-1 text-[9px] font-extrabold text-calm-on-primary">
                    {badgeValue}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
