'use client'

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'bezig' | 'gelukt' | 'fout'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [fout, setFout] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'bezig') return
    setStatus('bezig')
    setFout(null)

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setFout(json.error ?? 'Er is iets misgegaan. Probeer het opnieuw.')
        setStatus('fout')
        return
      }
      form.reset()
      setStatus('gelukt')
    } catch {
      setFout('Er is iets misgegaan. Probeer het opnieuw.')
      setStatus('fout')
    }
  }

  if (status === 'gelukt') {
    return (
      <div className="rounded-[2rem] border border-[#33335c]/8 bg-white p-8 text-center shadow-[0_10px_40px_rgba(51,51,92,0.06)]">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f8aa25]/15 text-[#e39207]">
          <span className="material-symbols-outlined">check</span>
        </span>
        <h2 className="mt-4 text-lg font-bold text-[#33335c]">Bedankt voor je bericht</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">
          We hebben het ontvangen en reageren doorgaans binnen één werkdag.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm font-bold text-[#ee5b2b] hover:text-[#d94e22]"
        >
          Nog een bericht sturen
        </button>
      </div>
    )
  }

  const labelCls = 'block text-sm font-semibold text-[#33335c]'
  const inputCls =
    'mt-1.5 w-full rounded-xl border border-[#33335c]/12 bg-white px-4 py-2.5 text-sm text-[#33335c] transition-colors placeholder:text-[#33335c]/30 focus:border-[#33335c]/40 focus:outline-none focus:ring-2 focus:ring-[#f8aa25]/15'

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[2rem] border border-[#33335c]/8 bg-white p-8 shadow-[0_10px_40px_rgba(51,51,92,0.06)]"
      noValidate
    >
      <h2 className="text-lg font-bold text-[#33335c]">Een demo aanvragen</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">
        Laat je gegevens achter en vertel waar je tegenaan loopt. We nemen contact met je op.
      </p>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="naam" className={labelCls}>Naam</label>
            <input id="naam" name="naam" type="text" required autoComplete="name" className={inputCls} />
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>E-mail</label>
            <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="asiel" className={labelCls}>
            Asiel <span className="font-normal text-[#33335c]/40">(optioneel)</span>
          </label>
          <input id="asiel" name="asiel" type="text" autoComplete="organization" className={inputCls} />
        </div>
        <div>
          <label htmlFor="bericht" className={labelCls}>Bericht</label>
          <textarea id="bericht" name="bericht" required rows={5} className={`${inputCls} resize-y`} />
        </div>

        {/* Honeypot tegen spam: verborgen voor mensen */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Laat dit veld leeg</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {status === 'fout' && fout && (
        <p className="mt-4 rounded-xl bg-[#ee5b2b]/8 px-4 py-3 text-sm font-medium text-[#c2451d]">{fout}</p>
      )}

      <button
        type="submit"
        disabled={status === 'bezig'}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ee5b2b] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#d94e22] active:scale-[0.99] disabled:opacity-60"
      >
        {status === 'bezig' ? 'Bezig met versturen…' : 'Verstuur bericht'}
      </button>
    </form>
  )
}
