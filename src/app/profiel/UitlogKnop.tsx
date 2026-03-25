'use client'

import { signOut } from 'next-auth/react'

export default function UitlogKnop() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/auth/login' })}
      className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-semibold text-sm hover:bg-red-500/15 transition-colors"
    >
      <span className="material-symbols-outlined text-base">logout</span>
      Uitloggen
    </button>
  )
}
