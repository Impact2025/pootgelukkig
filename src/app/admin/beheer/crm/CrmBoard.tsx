'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/admin/ui'
import type { StatusTone } from '@/components/admin/nav'

type Fase = 'nieuw' | 'contact' | 'onderhandeling' | 'gewonnen' | 'verloren'

interface Contact {
  id: number
  naam: string
  email: string | null
  telefoon: string | null
  bedrijf: string | null
  type: string
  stad: string | null
  bron: string
}

interface Deal {
  id: number
  contactId: number
  titel: string
  fase: Fase
  waarde: number | null
  contactNaam: string | null
}

const FASES: { key: Fase; label: string; kleur: string }[] = [
  { key: 'nieuw', label: 'Nieuw', kleur: 'border-t-gray-300' },
  { key: 'contact', label: 'Contact', kleur: 'border-t-blue-400' },
  { key: 'onderhandeling', label: 'Onderhandeling', kleur: 'border-t-amber-400' },
  { key: 'gewonnen', label: 'Gewonnen', kleur: 'border-t-emerald-500' },
  { key: 'verloren', label: 'Verloren', kleur: 'border-t-rose-400' },
]

const TYPE_TONE: Record<string, StatusTone> = {
  lead: 'neutral',
  asiel: 'warning',
  adoptant: 'success',
  partner: 'info',
  overig: 'neutral',
}

function euro(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function CrmBoard({ contacten, deals }: { contacten: Contact[]; deals: Deal[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'pijplijn' | 'contacten'>('pijplijn')
  const [lokaleDeals, setLokaleDeals] = useState<Deal[]>(deals)
  const [sleepId, setSleepId] = useState<number | null>(null)
  const [contactModal, setContactModal] = useState(false)
  const [dealModal, setDealModal] = useState(false)

  async function verplaatsDeal(dealId: number, naarFase: Fase) {
    setLokaleDeals((d) => d.map((x) => (x.id === dealId ? { ...x, fase: naarFase } : x)))
    await fetch(`/api/admin/beheer/crm/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fase: naarFase }),
    })
    router.refresh()
  }

  const totaalWaarde = lokaleDeals
    .filter((d) => d.fase !== 'verloren')
    .reduce((s, d) => s + (d.waarde ?? 0), 0)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#33335c]">CRM</h1>
          <p className="text-[#33335c]/40 mt-1 text-sm font-medium">
            {contacten.length} contacten · {lokaleDeals.length} deals · {euro(totaalWaarde)} in pijplijn
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setContactModal(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-[#33335c] font-bold px-4 py-2.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            Contact
          </button>
          <button
            onClick={() => setDealModal(true)}
            className="flex items-center gap-2 bg-[#33335c] text-white font-bold px-4 py-2.5 rounded-2xl hover:bg-[#33335c]/90 transition-colors text-sm shadow-lg shadow-[#33335c]/20"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Deal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {(['pijplijn', 'contacten'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${
              tab === t ? 'bg-white text-[#33335c] shadow-sm' : 'text-[#33335c]/50 hover:text-[#33335c]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'pijplijn' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FASES.map((fase) => {
            const faseDeals = lokaleDeals.filter((d) => d.fase === fase.key)
            const faseWaarde = faseDeals.reduce((s, d) => s + (d.waarde ?? 0), 0)
            return (
              <div
                key={fase.key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (sleepId != null) verplaatsDeal(sleepId, fase.key)
                  setSleepId(null)
                }}
                className={`bg-gray-50 rounded-2xl border-t-4 ${fase.kleur} p-2.5 min-h-[200px]`}
              >
                <div className="flex items-center justify-between px-1.5 mb-2">
                  <span className="text-xs font-bold text-[#33335c]">{fase.label}</span>
                  <span className="text-[10px] font-bold text-[#33335c]/40">{faseDeals.length}</span>
                </div>
                {faseWaarde > 0 && (
                  <p className="px-1.5 mb-2 text-[10px] font-semibold text-[#33335c]/40">{euro(faseWaarde)}</p>
                )}
                <div className="space-y-2">
                  {faseDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => setSleepId(deal.id)}
                      className="bg-white rounded-xl border border-[#33335c]/8 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <p className="font-bold text-[#33335c] text-sm leading-tight">{deal.titel}</p>
                      {deal.contactNaam && (
                        <Link
                          href={`/admin/beheer/crm/${deal.contactId}`}
                          className="text-[#33335c]/40 text-xs hover:text-[#33335c] transition-colors"
                        >
                          {deal.contactNaam}
                        </Link>
                      )}
                      {(deal.waarde ?? 0) > 0 && (
                        <p className="text-[#f8aa25] text-xs font-bold mt-1">{euro(deal.waarde ?? 0)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#33335c]/8 divide-y divide-gray-50">
          {contacten.length === 0 ? (
            <div className="p-12 text-center text-[#33335c]/40 text-sm">Nog geen contacten.</div>
          ) : (
            contacten.map((c) => (
              <Link
                key={c.id}
                href={`/admin/beheer/crm/${c.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors"
              >
                <div className="size-9 rounded-xl bg-[#33335c] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#f8aa25] font-bold text-sm">{c.naam.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#33335c] text-sm">{c.naam}</p>
                  <p className="text-[#33335c]/40 text-xs truncate">
                    {[c.email, c.telefoon, c.stad].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <Badge tone={TYPE_TONE[c.type] ?? 'neutral'}>{c.type}</Badge>
                <span className="material-symbols-outlined text-[#33335c]/30">chevron_right</span>
              </Link>
            ))
          )}
        </div>
      )}

      {contactModal && <ContactModal onClose={() => setContactModal(false)} onDone={() => router.refresh()} />}
      {dealModal && (
        <DealModal contacten={contacten} onClose={() => setDealModal(false)} onDone={() => router.refresh()} />
      )}
    </div>
  )
}

// ─── Contact modal ────────────────────────────────────────────────────────────

function ContactModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [bezig, setBezig] = useState(false)
  const [form, setForm] = useState({ naam: '', email: '', telefoon: '', bedrijf: '', stad: '', type: 'lead' })

  async function opslaan() {
    if (!form.naam.trim()) return
    setBezig(true)
    await fetch('/api/admin/beheer/crm/contacten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setBezig(false)
    onClose()
    onDone()
  }

  return (
    <Modal titel="Nieuw contact" onClose={onClose}>
      <div className="space-y-3">
        <Veld label="Naam *" value={form.naam} onChange={(v) => setForm({ ...form, naam: v })} />
        <Veld label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
        <Veld label="Telefoon" value={form.telefoon} onChange={(v) => setForm({ ...form, telefoon: v })} />
        <Veld label="Bedrijf / asiel" value={form.bedrijf} onChange={(v) => setForm({ ...form, bedrijf: v })} />
        <Veld label="Stad" value={form.stad} onChange={(v) => setForm({ ...form, stad: v })} />
        <div>
          <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]"
          >
            <option value="lead">Lead</option>
            <option value="asiel">Asiel</option>
            <option value="adoptant">Adoptant</option>
            <option value="partner">Partner</option>
            <option value="overig">Overig</option>
          </select>
        </div>
      </div>
      <ModalActies bezig={bezig} onClose={onClose} onOpslaan={opslaan} />
    </Modal>
  )
}

// ─── Deal modal ───────────────────────────────────────────────────────────────

function DealModal({
  contacten,
  onClose,
  onDone,
}: {
  contacten: Contact[]
  onClose: () => void
  onDone: () => void
}) {
  const [bezig, setBezig] = useState(false)
  const [form, setForm] = useState({ contactId: contacten[0]?.id ?? 0, titel: '', waarde: '' })

  async function opslaan() {
    if (!form.titel.trim() || !form.contactId) return
    setBezig(true)
    await fetch('/api/admin/beheer/crm/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: Number(form.contactId), titel: form.titel, waarde: Number(form.waarde) || 0 }),
    })
    setBezig(false)
    onClose()
    onDone()
  }

  return (
    <Modal titel="Nieuwe deal" onClose={onClose}>
      {contacten.length === 0 ? (
        <p className="text-sm text-[#33335c]/50">Maak eerst een contact aan.</p>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Contact</label>
            <select
              value={form.contactId}
              onChange={(e) => setForm({ ...form, contactId: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]"
            >
              {contacten.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.naam}
                </option>
              ))}
            </select>
          </div>
          <Veld label="Titel *" value={form.titel} onChange={(v) => setForm({ ...form, titel: v })} />
          <Veld label="Waarde (€)" value={form.waarde} onChange={(v) => setForm({ ...form, waarde: v })} type="number" />
        </div>
      )}
      <ModalActies bezig={bezig} onClose={onClose} onOpslaan={opslaan} />
    </Modal>
  )
}

// ─── Gedeelde UI ──────────────────────────────────────────────────────────────

function Modal({ titel, children, onClose }: { titel: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-extrabold text-[#33335c] mb-4">{titel}</h2>
        {children}
      </div>
    </div>
  )
}

function Veld({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#33335c]/50 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]"
      />
    </div>
  )
}

function ModalActies({ bezig, onClose, onOpslaan }: { bezig: boolean; onClose: () => void; onOpslaan: () => void }) {
  return (
    <div className="flex gap-2 mt-5">
      <button onClick={onClose} className="flex-1 border border-gray-200 text-[#33335c] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50">
        Annuleren
      </button>
      <button
        onClick={onOpslaan}
        disabled={bezig}
        className="flex-1 bg-[#33335c] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#33335c]/90 disabled:opacity-50"
      >
        {bezig ? 'Opslaan…' : 'Opslaan'}
      </button>
    </div>
  )
}
