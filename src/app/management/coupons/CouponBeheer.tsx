'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge, EmptyState, PageHeader } from '@/components/admin/ui'
import { useToast } from '@/components/admin/Toast'
import type { StatusTone } from '@/components/admin/nav'

interface Coupon {
  id: number
  code: string
  omschrijving: string | null
  type: 'procent' | 'vast'
  waarde: number
  maxGebruik: number | null
  gebruiktAantal: number
  perKlantLimiet: number | null
  minBesteding: number | null
  campagne: string | null
  actief: boolean
  startOp: string | null
  vervalOp: string | null
  aangemaaktOp: string
}

function statusVan(c: Coupon): { label: string; tone: StatusTone } {
  const nu = Date.now()
  if (!c.actief) return { label: 'Inactief', tone: 'neutral' }
  if (c.vervalOp && new Date(c.vervalOp).getTime() < nu) return { label: 'Verlopen', tone: 'danger' }
  if (c.startOp && new Date(c.startOp).getTime() > nu) return { label: 'Gepland', tone: 'info' }
  if (c.maxGebruik != null && c.gebruiktAantal >= c.maxGebruik) return { label: 'Uitgeput', tone: 'warning' }
  return { label: 'Actief', tone: 'success' }
}

function waardeLabel(c: Coupon) {
  return c.type === 'procent' ? `${c.waarde}%` : `€ ${c.waarde}`
}

export default function CouponBeheer({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [modal, setModal] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const totaalInwisselingen = coupons.reduce((s, c) => s + c.gebruiktAantal, 0)
  const actief = coupons.filter((c) => statusVan(c).label === 'Actief').length

  async function toggleActief(c: Coupon) {
    await fetch(`/api/admin/beheer/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actief: !c.actief }),
    })
    showToast(c.actief ? `${c.code} gedeactiveerd` : `${c.code} geactiveerd`, 'info')
    router.refresh()
  }

  async function verwijder(c: Coupon) {
    await fetch(`/api/admin/beheer/coupons/${c.id}`, { method: 'DELETE' })
    showToast(`${c.code} verwijderd`, 'info')
    setConfirmId(null)
    router.refresh()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Coupons"
        description={`${coupons.length} codes · ${actief} actief · ${totaalInwisselingen} inwisselingen`}
        icon="sell"
        actions={
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-[#33335c] text-white font-bold px-4 py-2.5 rounded-2xl hover:bg-[#33335c]/90 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Nieuwe coupon
          </button>
        }
      />

      {coupons.length === 0 ? (
        <EmptyState
          icon="sell"
          title="Nog geen couponcodes"
          description="Maak je eerste marketingcode aan."
          action={
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-2 bg-[#33335c] text-white font-bold px-4 py-2.5 rounded-2xl text-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nieuwe coupon
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#33335c]/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#33335c]/8 text-left">
                  <th className="px-5 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider">Korting</th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider">Gebruik</th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider">Vervalt</th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const st = statusVan(c)
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-mono font-bold text-[#33335c]">{c.code}</p>
                        {(c.omschrijving || c.campagne) && (
                          <p className="text-[#33335c]/40 text-xs">{c.omschrijving ?? c.campagne}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#f8aa25]">{waardeLabel(c)}</td>
                      <td className="px-4 py-3 text-[#33335c]/70">
                        {c.gebruiktAantal}
                        {c.maxGebruik != null ? ` / ${c.maxGebruik}` : ''}
                      </td>
                      <td className="px-4 py-3 text-[#33335c]/50 text-xs">
                        {c.vervalOp ? new Date(c.vervalOp).toLocaleDateString('nl-NL') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {confirmId === c.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-xs text-[#33335c]/60 font-semibold">Zeker?</span>
                            <button onClick={() => verwijder(c)} className="text-xs font-bold text-rose-600 hover:text-rose-800">Ja</button>
                            <button onClick={() => setConfirmId(null)} className="text-xs font-bold text-[#33335c]/40 hover:text-[#33335c]">Nee</button>
                          </span>
                        ) : (
                          <>
                            <button onClick={() => toggleActief(c)} className="text-[#33335c]/40 hover:text-[#33335c] mr-2" title={c.actief ? 'Deactiveren' : 'Activeren'}>
                              <span className="material-symbols-outlined text-lg">{c.actief ? 'toggle_on' : 'toggle_off'}</span>
                            </button>
                            <button onClick={() => setConfirmId(c.id)} className="text-rose-400 hover:text-rose-600" title="Verwijderen">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && <CouponModal onClose={() => setModal(false)} onDone={() => router.refresh()} />}
    </div>
  )
}

function CouponModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { showToast } = useToast()
  const [bezig, setBezig] = useState(false)
  const [form, setForm] = useState({
    code: '',
    omschrijving: '',
    type: 'procent' as 'procent' | 'vast',
    waarde: '10',
    maxGebruik: '',
    perKlantLimiet: '',
    minBesteding: '',
    vervalOp: '',
    aantal: '1',
    prefix: '',
  })

  async function opslaan() {
    setBezig(true)
    const res = await fetch('/api/admin/beheer/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code || undefined,
        omschrijving: form.omschrijving || undefined,
        type: form.type,
        waarde: Number(form.waarde),
        maxGebruik: form.maxGebruik ? Number(form.maxGebruik) : null,
        perKlantLimiet: form.perKlantLimiet ? Number(form.perKlantLimiet) : null,
        minBesteding: form.minBesteding ? Number(form.minBesteding) : null,
        vervalOp: form.vervalOp || null,
        aantal: Number(form.aantal) || 1,
        prefix: form.prefix || undefined,
      }),
    })
    const json = await res.json()
    setBezig(false)
    if (res.ok) {
      showToast('Coupon aangemaakt', 'success')
      onClose()
      onDone()
    } else {
      showToast(json.error ?? 'Aanmaken mislukt', 'error')
    }
  }

  const bulk = Number(form.aantal) > 1

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => !bezig && onClose()}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-extrabold text-[#33335c] mb-4">Nieuwe coupon</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Omschrijving</label>
            <input value={form.omschrijving} onChange={(e) => setForm({ ...form, omschrijving: e.target.value })} placeholder="bijv. Zomercampagne 2026" className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'procent' | 'vast' })} className="admin-input">
              <option value="procent">Procent (%)</option>
              <option value="vast">Vast bedrag (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Waarde</label>
            <input type="number" value={form.waarde} onChange={(e) => setForm({ ...form, waarde: e.target.value })} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Max. gebruik (totaal)</label>
            <input type="number" value={form.maxGebruik} onChange={(e) => setForm({ ...form, maxGebruik: e.target.value })} placeholder="onbeperkt" className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Limiet per klant</label>
            <input type="number" value={form.perKlantLimiet} onChange={(e) => setForm({ ...form, perKlantLimiet: e.target.value })} placeholder="onbeperkt" className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Min. besteding (€)</label>
            <input type="number" value={form.minBesteding} onChange={(e) => setForm({ ...form, minBesteding: e.target.value })} placeholder="geen" className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Vervaldatum</label>
            <input type="date" value={form.vervalOp} onChange={(e) => setForm({ ...form, vervalOp: e.target.value })} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Aantal codes</label>
            <input type="number" value={form.aantal} onChange={(e) => setForm({ ...form, aantal: e.target.value })} className="admin-input" />
          </div>
          {bulk ? (
            <div>
              <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Prefix (optioneel)</label>
              <input value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} placeholder="ZOMER" className="admin-input" />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Code (leeg = automatisch)</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ZOMER10" className="admin-input font-mono" />
            </div>
          )}
        </div>

        {bulk && <p className="text-xs text-[#33335c]/40 mt-3">Er worden {form.aantal} willekeurige codes gegenereerd{form.prefix ? ` met prefix ${form.prefix.toUpperCase()}-` : ''}.</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} disabled={bezig} className="flex-1 border border-gray-200 text-[#33335c] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">
            Annuleren
          </button>
          <button onClick={opslaan} disabled={bezig} className="flex-1 bg-[#33335c] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#33335c]/90 disabled:opacity-50">
            {bezig ? 'Aanmaken…' : 'Aanmaken'}
          </button>
        </div>
      </div>
    </div>
  )
}
