'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const iconMap: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  }

  const styleMap: Record<ToastType, string> = {
    success: 'bg-[#33335c] border-[#f8aa25]/30 text-white',
    error: 'bg-red-950 border-red-500/30 text-white',
    info: 'bg-gray-900 border-white/20 text-white',
  }

  const iconColorMap: Record<ToastType, string> = {
    success: 'text-[#f8aa25]',
    error: 'text-red-400',
    info: 'text-white/60',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md pointer-events-auto animate-toast ${styleMap[t.type]}`}
          >
            <span
              className={`material-symbols-outlined text-lg flex-shrink-0 ${iconColorMap[t.type]}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {iconMap[t.type]}
            </span>
            <p className="text-sm font-semibold">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
