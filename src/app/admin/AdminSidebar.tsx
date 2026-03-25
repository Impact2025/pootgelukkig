'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', icon: 'grid_view', label: 'Dashboard', exact: true },
  { href: '/admin/dieren', icon: 'pets', label: 'Dieren' },
  { href: '/admin/adopties', icon: 'favorite', label: 'Adoptie' },
  { href: '/admin/berichten', icon: 'chat', label: 'Berichten' },
]

const navItemsExtra = [
  { href: '/admin/medisch', icon: 'medical_services', label: 'Medisch' },
  { href: '/admin/wachtlijst', icon: 'format_list_bulleted', label: 'Wachtlijst' },
  { href: '/admin/pleeggezinnen', icon: 'house', label: 'Pleeggezinnen' },
  { href: '/admin/rapportage', icon: 'bar_chart', label: 'Rapportage' },
  { href: '/admin/instellingen', icon: 'settings', label: 'Instellingen' },
]

interface Props {
  userName: string
  userEmail: string
  openstaand: number
  ongelezen?: number
  medischAlert?: number
  wachtlijstAantal?: number
}

export default function AdminSidebar({
  userName,
  userEmail,
  openstaand,
  ongelezen = 0,
  medischAlert = 0,
  wachtlijstAantal = 0,
}: Props) {
  const pathname = usePathname()

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-100 fixed h-full flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#33335c] flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-[#f8aa25]"
              style={{ fontSize: '1.1rem', fontVariationSettings: "'FILL' 1" }}
            >
              pets
            </span>
          </div>
          <div>
            <p className="font-extrabold text-[#33335c] text-sm leading-tight">PootGelukkig</p>
            <p className="text-[10px] text-[#33335c]/40 font-semibold uppercase tracking-widest">
              Asiel Portaal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-[#33335c] text-white shadow-md shadow-[#33335c]/20'
                  : 'text-[#33335c]/50 hover:bg-gray-50 hover:text-[#33335c]'
              }`}
            >
              <span
                className="material-symbols-outlined text-xl flex-shrink-0"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.href === '/admin/adopties' && openstaand > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {openstaand}
                </span>
              )}
              {item.href === '/admin/berichten' && ongelezen > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {ongelezen}
                </span>
              )}
            </Link>
          )
        })}

        {/* Separator */}
        <div className="px-1 py-2">
          <div className="h-px bg-gray-100" />
        </div>

        {navItemsExtra.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-[#33335c] text-white shadow-md shadow-[#33335c]/20'
                  : 'text-[#33335c]/50 hover:bg-gray-50 hover:text-[#33335c]'
              }`}
            >
              <span
                className="material-symbols-outlined text-xl flex-shrink-0"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.href === '/admin/medisch' && medischAlert > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {medischAlert}
                </span>
              )}
              {item.href === '/admin/wachtlijst' && wachtlijstAantal > 0 && (
                <span className="bg-[#33335c]/20 text-[#33335c] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {wachtlijstAantal}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="px-4 mb-3">
        <div className="h-px bg-gray-100" />
      </div>

      {/* User */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
          <div className="size-8 rounded-lg bg-[#33335c] flex items-center justify-center flex-shrink-0">
            <span className="text-[#f8aa25] font-extrabold text-sm leading-none">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#33335c] text-xs font-bold truncate leading-tight">{userName}</p>
            <p className="text-[#33335c]/40 text-[10px] truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="text-[#33335c]/30 hover:text-[#33335c]/70 transition-colors flex-shrink-0"
            title="Uitloggen"
          >
            <span className="material-symbols-outlined text-base">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
