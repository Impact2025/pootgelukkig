'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopBar from './AdminTopBar'
import CommandPalette from './CommandPalette'
import { cx } from '@/components/admin/ui'
import { ToastProvider } from '@/components/admin/Toast'

export interface AdminCounts {
  openstaand: number
  ongelezen: number
  medisch: number
  wachtlijst: number
  afspraken: number
}

export interface AdminUser {
  naam: string
  email: string
  rol: string
}

export default function AdminShell({
  user,
  counts,
  children,
}: {
  user: AdminUser
  counts: AdminCounts
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Voorkeur voor ingeklapte sidebar onthouden.
  useEffect(() => {
    if (localStorage.getItem('admin-sidebar-collapsed') === '1') setCollapsed(true)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem('admin-sidebar-collapsed', next ? '1' : '0')
      return next
    })
  }, [])

  // ⌘K / Ctrl-K opent de command palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen((o) => !o)
    } else {
      toggleCollapsed()
    }
  }, [toggleCollapsed])

  return (
    <ToastProvider>
    <div className="min-h-screen bg-[#f6f8f6]">
      <AdminSidebar
        user={user}
        counts={counts}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={cx('transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <AdminTopBar
          user={user}
          counts={counts}
          onToggleSidebar={handleToggleSidebar}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <main className="min-w-0">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} isAdmin={user.rol === 'admin'} />
    </div>
    </ToastProvider>
  )
}
