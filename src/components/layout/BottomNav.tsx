'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'grid_view', label: 'Home', badge: 'matches' },
  { href: '/zoeken', icon: 'search', label: 'Zoeken', badge: null },
  { href: '/intake', icon: 'add', label: '', isPrimary: true, badge: null },
  { href: '/favorieten', icon: 'favorite', label: 'Bewaard', badge: 'favorieten' },
  { href: '/profiel', icon: 'person', label: 'Profiel', badge: null },
] as const

type BadgeKey = 'matches' | 'favorieten'

export default function BottomNav() {
  const pathname = usePathname()
  const [badges, setBadges] = useState<Record<BadgeKey, number>>({ matches: 0, favorieten: 0 })

  useEffect(() => {
    fetch('/api/me/badges')
      .then((r) => r.json())
      .then((data) => setBadges(data))
      .catch(() => {})
  }, [])

  return (
    <div className="bottom-nav px-5 py-3 pb-safe">
      <div className="flex justify-between items-center max-w-[430px] mx-auto">
        {NAV_ITEMS.map((item) => {
          if ('isPrimary' in item && item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 size-14 rounded-full bg-primary flex items-center justify-center text-bg-dark shadow-2xl shadow-primary/40 border-4 border-bg-dark active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-3xl font-bold">add</span>
              </Link>
            )
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const badgeCount = item.badge ? (badges[item.badge as BadgeKey] ?? 0) : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-colors relative ${
                isActive ? 'text-primary' : 'text-white/40'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-2xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                {badgeCount > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-bg-dark text-[9px] font-extrabold flex items-center justify-center leading-none">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              {item.label && (
                <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      <div className="ios-indicator" />
    </div>
  )
}
