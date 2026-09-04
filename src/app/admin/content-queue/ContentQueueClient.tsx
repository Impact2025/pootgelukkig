'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { EmptyState, Skeleton } from '@/components/admin/ui'
import { CalmCard, CalmIcon, CalmPill, CalmMetricChip } from '@/components/admin/calm'

interface QueueItem {
  id: number
  rol: string
  type: string
  titel: string | null
  content: string
  status: 'pending' | 'approved' | 'rejected'
  metadata: Record<string, unknown> | null
  aangemaaktOp: string
  bijgewerktOp: string
  beoordeeldOp: string | null
  beoordeeldDoor: string | null
}

const ROL_NAAM: Record<string, string> = {
  fundraising: 'Sam',
  rapportage: 'Mila',
  social: 'Conny',
  vrijwilligers: 'Bram',
  chat: 'Samen',
}

const TYPE_LABEL: Record<string, string> = {
  briefing: 'Briefing',
  bericht: 'Bericht',
  post: 'Social post',
  rapport: 'Rapport',
}

function metaString(metadata: Record<string, unknown> | null, key: string): string | null {
  const v = metadata?.[key]
  return typeof v === 'string' || typeof v === 'number' ? String(v) : null
}

export default function ContentQueueClient() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [laden, setLaden] = useState(true)
  const [fout, setFout] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [index, setIndex] = useState(0)

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

  const wachtrij = useMemo(() => items.filter((it) => it.status === 'pending'), [items])
  const huidige = wachtrij[Math.min(index, Math.max(wachtrij.length - 1, 0))]

  async function beslis(id: number, status: 'approved' | 'rejected') {
    setBezig(true)
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
      setBezig(false)
    }
  }

  if (laden) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-3xl" />
        ))}
      </div>
    )
  }

  if (fout) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-800">
        Kon de wachtrij niet laden. Ververs de pagina om het opnieuw te proberen.
      </div>
    )
  }

  if (wachtrij.length === 0) {
    return (
      <EmptyState
        icon="task_alt"
        title="Niets te beoordelen"
        description="Alle AI-concepten zijn beoordeeld. Zodra een assistent iets nieuws voorstelt, verschijnt het hier."
      />
    )
  }

  const totaal = wachtrij.length
  const huidigNummer = Math.min(index, totaal - 1) + 1
  const bedrag = metaString(huidige.metadata, 'bedrag')
  const looptijd = metaString(huidige.metadata, 'looptijd')
  const doelgroep = metaString(huidige.metadata, 'doelgroep')
  const model = metaString(huidige.metadata, 'model')
  const bestandUrl = metaString(huidige.metadata, 'bestandUrl')

  function volgende() {
    setIndex((i) => Math.min(i, totaal - 2 < 0 ? 0 : totaal - 2))
  }

  return (
    <div className="space-y-5">
      {/* Zen bar */}
      <div className="flex items-center justify-between rounded-2xl bg-calm-surface-low px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-calm-primary-container" />
          <p className="font-inter text-sm font-bold text-calm-on-surface">
            Besluit {huidigNummer} van {totaal}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-calm-on-surface-variant/70">
          <CalmIcon name="spa" className="text-[1rem]" />
          <p className="font-inter text-xs font-semibold">Rustige modus · Neem de tijd</p>
        </div>
      </div>

      {/* Centrale review kaart */}
      <CalmCard className="overflow-hidden">
        <div className="border-b border-calm-outline-variant/30 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CalmPill tone="primary" icon="auto_awesome">
              {ROL_NAAM[huidige.rol] ?? huidige.rol} · {TYPE_LABEL[huidige.type] ?? huidige.type}
            </CalmPill>
            <p className="font-inter text-xs font-semibold text-calm-on-surface-variant/60">
              {new Date(huidige.aangemaaktOp).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <h2 className="font-jakarta text-xl font-extrabold leading-tight text-calm-on-surface">
            {huidige.titel ?? TYPE_LABEL[huidige.type] ?? huidige.type}
          </h2>

          {(bedrag || looptijd || doelgroep) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {bedrag && <CalmMetricChip label="Aangevraagd bedrag" value={bedrag} />}
              {looptijd && <CalmMetricChip label="Looptijd" value={looptijd} />}
              {doelgroep && <CalmMetricChip label="Doelgroep" value={doelgroep} />}
            </div>
          )}

          <div className="mt-5 whitespace-pre-wrap font-inter text-[15px] leading-relaxed text-calm-on-surface-variant">
            {huidige.content}
          </div>

          {/* Review score box */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-calm-secondary-fixed/30 px-4 py-3.5">
            <CalmIcon name="verified" className="mt-0.5 shrink-0 text-calm-secondary" fill />
            <div>
              <p className="font-inter text-sm font-bold text-calm-on-secondary-fixed">Voldoet aan de contentrichtlijnen</p>
              <p className="mt-0.5 font-inter text-xs text-calm-on-secondary-fixed/70">
                Automatisch gecontroleerd op toon en volledigheid{model ? ` · gegenereerd met ${model}` : ''}.
              </p>
            </div>
          </div>

          {bestandUrl && (
            <a
              href={bestandUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-calm-outline-variant bg-calm-surface-low px-3.5 py-2 font-inter text-xs font-bold text-calm-on-surface hover:bg-calm-surface-container"
            >
              <CalmIcon name="attach_file" className="text-[1rem]" />
              Bijlage · Inzien
            </a>
          )}
        </div>

        {/* Zen decision bar */}
        <div className="flex items-center gap-3 border-t border-calm-outline-variant/30 bg-calm-surface-low px-6 py-4">
          <button
            type="button"
            disabled={bezig}
            onClick={() => {
              beslis(huidige.id, 'rejected')
              volgende()
            }}
            className="flex-1 rounded-2xl border border-calm-outline-variant px-4 py-3 font-inter text-sm font-bold text-calm-on-surface-variant transition-colors hover:bg-calm-surface-container disabled:opacity-50"
          >
            Aanpassen / Afwijzen
          </button>
          <button
            type="button"
            disabled={bezig}
            onClick={() => {
              beslis(huidige.id, 'approved')
              volgende()
            }}
            className="flex-[2] rounded-2xl bg-calm-primary-container px-4 py-3 font-inter text-sm font-bold text-calm-on-primary shadow-[0_8px_20px_-8px_rgba(29,78,216,0.5)] transition-colors hover:bg-calm-primary disabled:opacity-50"
          >
            Goedkeuren &amp; Opslaan
          </button>
        </div>
      </CalmCard>

      <p className="flex items-center justify-center gap-1.5 text-center font-inter text-xs text-calm-on-surface-variant/50">
        <CalmIcon name="verified_user" className="text-[0.95rem]" />
        Besluiten worden beveiligd vastgelegd in het bestuursregister
      </p>
    </div>
  )
}
