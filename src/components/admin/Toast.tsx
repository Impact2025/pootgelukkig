'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from './ui'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastCtx {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx | null>(null)

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast: geen ToastProvider gevonden')
  return ctx
}

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-[#1a2e1a] border-emerald-700/60 text-white',
  error:   'bg-[#2e1a1a] border-red-700/60 text-white',
  info:    'bg-[#1e1e38] border-[#33335c]/60 text-white',
  warning: 'bg-[#2e2410] border-amber-700/60 text-white',
}

const ICON_COLORS: Record<ToastType, string> = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  info:    'text-[#f8aa25]',
  warning: 'text-amber-400',
}

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = String(++counter.current)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Portal: fixed bottom-right, stacks upward */}
      <div
        aria-live="polite"
        aria-label="Meldingen"
        className="fixed bottom-5 right-5 z-[300] flex flex-col-reverse gap-2.5 items-end pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cx(
              'flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl border shadow-2xl',
              'text-sm font-semibold pointer-events-auto',
              'animate-slide-up',
              TOAST_STYLES[toast.type]
            )}
          >
            <span
              className={cx('material-symbols-outlined text-lg flex-shrink-0', ICON_COLORS[toast.type])}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {ICONS[toast.type]}
            </span>
            <span className="max-w-[280px]">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Sluit melding"
              className="ml-1 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
