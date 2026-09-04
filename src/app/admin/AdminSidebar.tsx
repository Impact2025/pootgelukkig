'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { asielNav, type NavItem } from '@/components/admin/nav'
import { cx } from '@/components/admin/ui'
import type { AdminCounts, AdminUser } from './AdminShell'

interface Props {
  user: AdminUser
  counts: AdminCounts
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

function badgeFor(item: NavItem, counts: AdminCounts): { value: number; tone: 'rood' | 'navy' } | null {
  switch (item.badge) {
    case 'wachtrij':
      return counts.wachtrij > 0 ? { value: counts.wachtrij, tone: 'navy' } : null
    default:
      return null
  }
}

export default function AdminSidebar({ user, counts, collapsed, mobileOpen, onCloseMobile }: Props) {
  const pathname = usePathname()

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href)
  }

  return (
    <>
      {/* Mobiel: backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Menu sluiten"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#1E293B]/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-100 bg-white transition-[width,transform] duration-200',
          'w-64',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-50 px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1E293B]">
            <span
              className="material-symbols-outlined text-[#1D4ED8]"
              style={{ fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}
            >
              hub
            </span>
          </div>
          <div className={cx(collapsed && 'lg:hidden')}>
            <p className="text-sm font-extrabold leading-tight text-[#1E293B]">ImpactOS</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E293B]/40">Digitaal Kantoor</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {asielNav.map((groep, gi) => {
            const items = groep.items
            if (items.length === 0) return null
            return (
              <div key={gi}>
                {gi > 0 && (
                  <div className="px-1 py-2">
                    <div className="h-px bg-gray-100" />
                  </div>
                )}
                {groep.titel && (
                  <div className={cx('px-3 pb-1.5 pt-2', collapsed && 'lg:hidden')}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#1E293B]/30">{groep.titel}</p>
                  </div>
                )}
                {items.map((item) => {
                  const active = isActive(item)
                  const badge = badgeFor(item, counts)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      onClick={onCloseMobile}
                      className={cx(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                        collapsed && 'lg:justify-center',
                        active
                          ? 'bg-[#1E293B] text-white shadow-md shadow-[#1E293B]/20'
                          : item.highlight
                            ? 'bg-[#1D4ED8]/10 text-[#1E293B] hover:bg-[#1D4ED8]/20'
                            : 'text-[#1E293B]/50 hover:bg-gray-50 hover:text-[#1E293B]'
                      )}
                    >
                      <span className="relative flex-shrink-0">
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{
                            fontVariationSettings: active || item.highlight ? "'FILL' 1" : "'FILL' 0",
                            color: !active && item.highlight ? '#1D4ED8' : undefined,
                          }}
                        >
                          {item.icon}
                        </span>
                        {/* Ingeklapt: kleine indicator i.p.v. teller */}
                        {badge && collapsed && (
                          <span className="absolute -right-1 -top-1 hidden size-2 rounded-full bg-red-500 lg:block" />
                        )}
                      </span>
                      <span className={cx('flex-1', collapsed && 'lg:hidden')}>{item.label}</span>
                      {badge && (
                        <span
                          className={cx(
                            'rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight min-w-[18px]',
                            collapsed && 'lg:hidden',
                            badge.tone === 'rood' ? 'bg-red-500 text-white' : 'bg-[#1E293B]/20 text-[#1E293B]'
                          )}
                        >
                          {badge.value}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Onderaan: naar management-portaal (voor hybride accounts) */}
        <div className="border-t border-gray-50 p-3">
          <Link
            href="/management"
            title={collapsed ? 'Management portaal' : undefined}
            className={cx(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1E293B]/40 transition-colors hover:bg-gray-50 hover:text-[#1E293B]',
              collapsed && 'lg:justify-center'
            )}
          >
            <span className="material-symbols-outlined text-xl">insights</span>
            <span className={cx(collapsed && 'lg:hidden')}>Management portaal</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
