'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader, Button, Badge, EmptyState } from '@/components/admin/ui'
import { useToast } from '@/components/admin/Toast'
import type { StatusTone } from '@/components/admin/nav'
import type { crmContacten } from '@/lib/db/schema'

type Contact = typeof crmContacten.$inferSelect

const TYPE_LABELS: Record<string, string> = {
  gemeente: 'Gemeente',
  fondsenverstrekker: 'Fondsenverstrekker',
  zorgpartner: 'Zorgpartner',
  partner: 'Partner',
  overig: 'Overig',
}

const TYPE_TONE: Record<string, StatusTone> = {
  gemeente: 'info',
  fondsenverstrekker: 'warning',
  zorgpartner: 'success',
  partner: 'neutral',
  overig: 'neutral',
}

const TYPE_OPTIES = ['gemeente', 'fondsenverstrekker', 'zorgpartner', 'partner', 'overig'] as const

export default function CrmClient({ contacten }: { contacten: Contact[] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [filter, setFilter] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [form, setForm] = useState({ naam: '', email: '', telefoon: '', bedrijf: '', stad: '', type: 'gemeente', notitie: '' })

  const gefilterd = filter ? contacten.filter((c) => c.type === filter) : contacten

  async function opslaan() {
    if (!form.naam.trim()) return
    setBezig(true)
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showToast('Contact toegevoegd', 'success')
      setModalOpen(false)
      setForm({ naam: '', email: '', telefoon: '', bedrijf: '', stad: '', type: 'gemeente', notitie: '' })
      router.refresh()
    } catch {
      showToast('Opslaan is mislukt', 'error')
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="CRM & Relaties"
        description={`${contacten.length} contacten bij gemeenten, fondsenverstrekkers en zorgpartners`}
        icon="contacts"
        actions={
          <Button icon="person_add" onClick={() => setModalOpen(true)}>
            Nieuw contact
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === '' ? 'bg-[#1E293B] text-white' : 'bg-white border border-[#1E293B]/15 text-[#1E293B]/60 hover:text-[#1E293B]'}`}
        >
          Alle
        </button>
        {TYPE_OPTIES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === t ? 'bg-[#1E293B] text-white' : 'bg-white border border-[#1E293B]/15 text-[#1E293B]/60 hover:text-[#1E293B]'}`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {gefilterd.length === 0 ? (
        <EmptyState icon="contacts" title="Geen contacten gevonden" description="Voeg een contact toe bij een gemeente, fondsenverstrekker of zorgpartner." />
      ) : (
        <div className="bg-white border border-[#1E293B]/8 rounded-2xl divide-y divide-gray-50">
          {gefilterd.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#1E293B]">
                <span className="text-[#1D4ED8] font-bold text-sm">{c.naam.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1E293B] text-sm">{c.naam}</p>
                <p className="text-[#1E293B]/45 text-xs truncate">
                  {[c.bedrijf, c.email, c.telefoon, c.stad].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <Badge tone={TYPE_TONE[c.type] ?? 'neutral'}>{TYPE_LABELS[c.type] ?? c.type}</Badge>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-extrabold text-[#1E293B] mb-4">Nieuw contact</h2>
            <div className="space-y-3">
              <Veld label="Naam *" value={form.naam} onChange={(v) => setForm({ ...form, naam: v })} />
              <Veld label="Organisatie/instantie" value={form.bedrijf} onChange={(v) => setForm({ ...form, bedrijf: v })} />
              <Veld label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              <Veld label="Telefoon" value={form.telefoon} onChange={(v) => setForm({ ...form, telefoon: v })} />
              <Veld label="Stad" value={form.stad} onChange={(v) => setForm({ ...form, stad: v })} />
              <div>
                <label className="block text-xs font-bold text-[#1E293B]/50 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#1E293B]"
                >
                  {TYPE_OPTIES.map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-[#1E293B] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50">
                Annuleren
              </button>
              <button
                onClick={opslaan}
                disabled={bezig}
                className="flex-1 bg-[#1E293B] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#1E293B]/90 disabled:opacity-50"
              >
                {bezig ? 'Opslaan…' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Veld({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1E293B]/50 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:outline-none focus:border-[#1E293B]"
      />
    </div>
  )
}
