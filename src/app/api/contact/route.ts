import { NextResponse } from 'next/server'
import { verstuurMail } from '@/lib/email'
import { contactSchema } from '@/lib/validation/contact'
import { escapeHtml } from '@/lib/security/escape'

export const dynamic = 'force-dynamic'

const MANAGEMENT_EMAIL = process.env.MANAGEMENT_EMAIL ?? 'v.munster@weareimpact.nl'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { naam, email, asiel, bericht, website } = parsed.data

    // Honeypot ingevuld: doe alsof het gelukt is, maar verstuur niets.
    if (website) {
      return NextResponse.json({ data: { ok: true } }, { status: 200 })
    }

    const html = `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:560px;margin:0 auto;color:#33335c">
        <h2 style="font-size:18px;margin:0 0 16px">Nieuw bericht via de website</h2>
        <table style="font-size:14px;line-height:1.6;border-collapse:collapse">
          <tr><td style="padding:4px 16px 4px 0;color:#9595a8">Naam</td><td style="font-weight:600">${escapeHtml(naam)}</td></tr>
          <tr><td style="padding:4px 16px 4px 0;color:#9595a8">E-mail</td><td style="font-weight:600">${escapeHtml(email)}</td></tr>
          ${asiel ? `<tr><td style="padding:4px 16px 4px 0;color:#9595a8">Asiel</td><td style="font-weight:600">${escapeHtml(asiel)}</td></tr>` : ''}
        </table>
        <p style="font-size:14px;line-height:1.7;margin:16px 0 0;white-space:pre-wrap">${escapeHtml(bericht)}</p>
      </div>`

    const result = await verstuurMail({
      naar: MANAGEMENT_EMAIL,
      onderwerp: `Contact via website${asiel ? ` — ${asiel}` : ''}: ${naam}`,
      html,
      antwoordNaar: email,
      meta: { template: 'contact-formulier' },
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: 'Je bericht kon niet worden verzonden. Mail ons gerust direct op info@pootgelukkig.nl.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ data: { ok: true } }, { status: 200 })
  } catch (err) {
    console.error('Contactformulier fout:', err)
    return NextResponse.json({ error: 'Er is iets misgegaan. Probeer het opnieuw.' }, { status: 500 })
  }
}
