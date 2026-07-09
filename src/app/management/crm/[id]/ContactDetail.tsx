'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/admin/Toast'

interface Contact {
  id: number
  naam: string
  email: string | null
  telefoon: string | null
  bedrijf: string | null
  type: string
  bron: string
  stad: string | null
  notitie: string | null
}
interface Deal {
  id: number
  titel: string
  fase: string
  waarde: number | null
}
interface Activiteit {
  id: number
  type: string
  inhoud: string
  auteur: string | null
  voltooid: boolean
  aangemaaktOp: string | Date
}

const activiteitIcon: Record<string, string> = {
  notitie: 'sticky_note_2',
  mail: 'mail',
  bel: 'call',
  taak: 'task_alt',
  afspraak: 'event',
}

export default function ContactDetail({
  contact,
  deals,
  activiteiten,
}: {
  contact: Contact
  deals: Deal[]
  activiteiten: Activiteit[]
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [tab, setTab] = useState<'notitie' | 'mail'>('notitie')
  const [notitie, setNotitie] = useState('')
  const [mail, setMail] = useState({ onderwerp: '', bericht: '' })
  const [bezig, setBezig] = useState(false)

  async function voegNotitieToe() {
    if (!notitie.trim()) return
    setBezig(true)
    const res = await fetch('/api/admin/beheer/crm/activiteiten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: contact.id, type: 'notitie', inhoud: notitie }),
    })
    setBezig(false)
    if (res.ok) {
      setNotitie('')
      showToast('Notitie opgeslagen', 'success')
      router.refresh()
    } else {
      showToast('Opslaan mislukt', 'error')
    }
  }

  async function verstuurMail() {
    if (!mail.onderwerp.trim() || !mail.bericht.trim()) return
    if (!contact.email) {
      showToast('Dit contact heeft geen e-mailadres.', 'warning')
      return
    }
    setBezig(true)
    const res = await fetch('/api/admin/beheer/crm/mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: contact.id, onderwerp: mail.onderwerp, bericht: mail.bericht }),
    })
    const json = await res.json()
    setBezig(false)
    showToast(
      json.ok ? 'E-mail verzonden' : 'Verzenden mislukt (controleer RESEND_API_KEY)',
      json.ok ? 'success' : 'error'
    )
    if (json.ok) {
      setMail({ onderwerp: '', bericht: '' })
      router.refresh()
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/management/crm" className="inline-flex items-center gap-1 text-[#33335c]/40 hover:text-[#33335c] text-sm font-semibold mb-4 transition-colors">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Terug naar CRM
      </Link>

      {/* Contactkaart */}
      <div className="bg-white rounded-2xl border border-[#33335c]/8 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-2xl bg-[#33335c] flex items-center justify-center flex-shrink-0">
            <span className="text-[#f8aa25] font-extrabold text-xl">{contact.naam.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-[#33335c]">{contact.naam}</h1>
            <p className="text-[#33335c]/40 text-sm">
              {[contact.bedrijf, contact.stad].filter(Boolean).join(' · ') || contact.type}
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-[#33335c]/60 hover:text-[#33335c]">
                  <span className="material-symbols-outlined text-base">mail</span>
                  {contact.email}
                </a>
              )}
              {contact.telefoon && (
                <span className="flex items-center gap-1 text-[#33335c]/60">
                  <span className="material-symbols-outlined text-base">call</span>
                  {contact.telefoon}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deals */}
      {deals.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#33335c]/8 p-5 mb-4">
          <p className="text-sm font-bold text-[#33335c] mb-3">Deals</p>
          <div className="space-y-2">
            {deals.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-[#33335c]/70">{d.titel}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-[#33335c]/60 capitalize">
                    {d.fase}
                  </span>
                  {(d.waarde ?? 0) > 0 && <span className="font-bold text-[#f8aa25]">€{d.waarde}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="bg-white rounded-2xl border border-[#33335c]/8 p-5 mb-4">
        <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-xl w-fit">
          {(['notitie', 'mail'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${
                tab === t ? 'bg-white text-[#33335c] shadow-sm' : 'text-[#33335c]/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'notitie' ? (
          <div>
            <textarea
              value={notitie}
              onChange={(e) => setNotitie(e.target.value)}
              placeholder="Notitie toevoegen…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c] resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={voegNotitieToe}
                disabled={bezig}
                className="bg-[#33335c] text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#33335c]/90 disabled:opacity-50"
              >
                Notitie opslaan
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              value={mail.onderwerp}
              onChange={(e) => setMail({ ...mail, onderwerp: e.target.value })}
              placeholder="Onderwerp"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]"
            />
            <textarea
              value={mail.bericht}
              onChange={(e) => setMail({ ...mail, bericht: e.target.value })}
              placeholder={`Bericht aan ${contact.email ?? 'contact'}…`}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c] resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={verstuurMail}
                disabled={bezig || !contact.email}
                className="bg-[#33335c] text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#33335c]/90 disabled:opacity-50"
              >
                {bezig ? 'Verzenden…' : 'Verstuur e-mail'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tijdlijn */}
      <div className="bg-white rounded-2xl border border-[#33335c]/8 p-5">
        <p className="text-sm font-bold text-[#33335c] mb-4">Tijdlijn</p>
        {activiteiten.length === 0 ? (
          <p className="text-[#33335c]/40 text-sm">Nog geen activiteiten.</p>
        ) : (
          <div className="space-y-4">
            {activiteiten.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-base text-[#33335c]/50">
                    {activiteitIcon[a.type] ?? 'circle'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#33335c] whitespace-pre-wrap">{a.inhoud}</p>
                  <p className="text-[10px] text-[#33335c]/40 mt-0.5">
                    {a.auteur ? `${a.auteur} · ` : ''}
                    {new Date(a.aangemaaktOp).toLocaleString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
