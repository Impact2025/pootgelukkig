'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Skeleton } from '@/components/admin/ui'

interface KenniskluisDocument {
  id: number
  bestandsnaam: string
  mimeType: string
  grootteBytes: number
  status: 'verwerkt' | 'mislukt'
  foutmelding: string | null
  aangemaaktOp: string
  blobUrl: string
}

function formatGrootte(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function KenniskluisUpload() {
  const [items, setItems] = useState<KenniskluisDocument[]>([])
  const [laden, setLaden] = useState(true)
  const [uploaden, setUploaden] = useState(false)
  const [verwijderenId, setVerwijderenId] = useState<number | null>(null)
  const [fout, setFout] = useState<string | null>(null)
  const [slepen, setSlepen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const laad = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/kenniskluis')
      const data = await res.json()
      setItems(data.items ?? [])
    } catch {
      setFout('Kon de kenniskluis niet laden.')
    } finally {
      setLaden(false)
    }
  }, [])

  useEffect(() => {
    laad()
  }, [laad])

  async function uploadBestand(bestand: File) {
    setUploaden(true)
    setFout(null)
    try {
      const fd = new FormData()
      fd.append('bestand', bestand)
      const res = await fetch('/api/admin/kenniskluis', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setFout(data.fout ?? 'Upload mislukt')
        return
      }
      setItems((prev) => [data.data, ...prev])
    } catch {
      setFout('Upload mislukt. Probeer opnieuw.')
    } finally {
      setUploaden(false)
    }
  }

  async function verwijder(id: number) {
    setVerwijderenId(id)
    try {
      const res = await fetch(`/api/admin/kenniskluis/${id}`, { method: 'DELETE' })
      if (res.ok) setItems((prev) => prev.filter((it) => it.id !== id))
    } finally {
      setVerwijderenId(null)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setSlepen(false)
    const bestand = e.dataTransfer.files?.[0]
    if (bestand) uploadBestand(bestand)
  }

  if (laden) return <Skeleton className="h-32 rounded-2xl" />

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setSlepen(true) }}
        onDragLeave={() => setSlepen(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
          slepen ? 'border-[#2563EB] bg-[#2563EB]/5' : 'border-[#1E293B]/15 hover:border-[#1E293B]/30'
        }`}
      >
        <span className="material-symbols-outlined text-3xl text-[#1E293B]/30">upload_file</span>
        <p className="text-sm font-semibold text-[#1E293B]">
          {uploaden ? 'Bezig met verwerken…' : 'Sleep een PDF hierheen, of klik om te kiezen'}
        </p>
        <p className="text-xs text-[#1E293B]/40">PDF, TXT of Markdown — max 15MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          className="hidden"
          disabled={uploaden}
          onChange={(e) => {
            const bestand = e.target.files?.[0]
            if (bestand) uploadBestand(bestand)
            e.target.value = ''
          }}
        />
      </div>

      {fout && <p className="text-sm font-semibold text-red-600">{fout}</p>}

      {items.length === 0 ? (
        <p className="text-sm text-[#1E293B]/40">Nog geen documenten geüpload.</p>
      ) : (
        <div className="space-y-2">
          {items.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-[#1E293B]/8 bg-gray-50 px-4 py-3">
              <span className="material-symbols-outlined text-[#1E293B]/40">
                {doc.status === 'verwerkt' ? 'description' : 'error'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E293B] truncate">{doc.bestandsnaam}</p>
                <p className="text-xs text-[#1E293B]/40">
                  {formatGrootte(doc.grootteBytes)} · {new Date(doc.aangemaaktOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {doc.status === 'mislukt' && (
                    <span className="text-red-600"> · {doc.foutmelding ?? 'Tekst-extractie mislukt'}</span>
                  )}
                  {doc.status === 'verwerkt' && <span className="text-emerald-600"> · Beschikbaar voor AI-context</span>}
                </p>
              </div>
              <button
                onClick={() => verwijder(doc.id)}
                disabled={verwijderenId === doc.id}
                title="Verwijderen"
                className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
