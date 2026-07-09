'use client'

import { useEffect, useState, useCallback } from 'react'
import { Badge, EmptyState, Skeleton } from '@/components/admin/ui'
import { statusLabel, statusTone } from '@/components/admin/nav'

interface QueueItem {
  id: number
  rol: string
  type: string
  platform: string | null
  titel: string | null
  inhoud: string
  status: string
  bijgewerktOp: string
}

const ROL_NAAM: Record<string, string> = {
  social: 'Conny · Social',
  fundraising: 'Sam · Fundraising',
  vrijwilligers: 'Bram · Vrijwilligers',
  evenementen: 'Eva · Evenementen',
  medisch: 'Medisch',
  foto: 'Finn · Foto',
  rapportage: 'Mila · Rapportage',
  chat: 'Samen · Chat',
}

export default function ContentQueueClient() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [laden, setLaden] = useState(true)
  const [fout, setFout] = useState(false)
  const [bezig, setBezig] = useState<number | null>(null)
  const [open, setOpen] = useState<number | null>(null)

  const laad = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content-queue')
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { items: QueueItem[] }
      setItems(data.items)
    } catch {
      setFout(true)
    } finally {
      setLaden(false)
    }
  }, [])

  useEffect(() => {
    laad()
  }, [laad])

  async function wijzigStatus(id: number, status: string) {
    setBezig(id)
    try {
      const res = await fetch('/api/admin/content-queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)))
      }
    } finally {
      setBezig(null)
    }
  }

  async function verwijder(id: number) {
    setBezig(id)
    try {
      const res = await fetch(`/api/admin/content-queue?id=${id}`, { method: 'DELETE' })
      if (res.ok) setItems((prev) => prev.filter((it) => it.id !== id))
    } finally {
      setBezig(null)
    }
  }

  if (laden) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (fout) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-red-800 text-sm">
        Kon de content-queue niet laden. Ververs de pagina om het opnieuw te proberen.
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="Nog geen concepten"
        description="Zodra een AI-teamlid content genereert (bijv. een nieuwsbrief of vacature), verschijnt die hier ter goedkeuring."
      />
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = open === item.id
        const rolNaam = ROL_NAAM[item.rol] ?? item.rol
        return (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-bold text-[#33335c] text-sm leading-tight">{item.titel ?? item.type}</p>
                  <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                </div>
                <p className="text-[#33335c]/50 text-xs">
                  {rolNaam} · {item.type}
                  {item.platform ? ` · ${item.platform}` : ''} ·{' '}
                  {new Date(item.bijgewerktOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {!isOpen && (
                  <p className="text-[#33335c]/70 text-sm mt-2 line-clamp-2 whitespace-pre-wrap">{item.inhoud}</p>
                )}
                {isOpen && (
                  <div className="text-[#33335c]/80 text-sm mt-2 whitespace-pre-wrap leading-relaxed border-t border-gray-100 pt-3">
                    {item.inhoud}
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-2.5 bg-gray-50/70 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="text-xs font-bold text-[#33335c]/70 hover:text-[#33335c] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">{isOpen ? 'expand_less' : 'expand_more'}</span>
                {isOpen ? 'Inklappen' : 'Bekijk volledig'}
              </button>

              <button
                onClick={() => navigator.clipboard?.writeText(item.inhoud)}
                className="text-xs font-bold text-[#33335c]/70 hover:text-[#33335c] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                Kopieer
              </button>

              <div className="ml-auto flex items-center gap-2">
                {item.status !== 'gepubliceerd' && (
                  <button
                    disabled={bezig === item.id}
                    onClick={() => wijzigStatus(item.id, 'gepubliceerd')}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    Markeer als gebruikt
                  </button>
                )}
                {item.status !== 'afgewezen' && (
                  <button
                    disabled={bezig === item.id}
                    onClick={() => wijzigStatus(item.id, 'afgewezen')}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[#33335c]/70 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Afwijzen
                  </button>
                )}
                <button
                  disabled={bezig === item.id}
                  onClick={() => verwijder(item.id)}
                  title="Verwijderen"
                  className="text-xs font-bold p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
