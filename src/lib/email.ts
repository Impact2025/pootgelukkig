import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const VAN = 'PootGelukkig <no-reply@pootgelukkig.nl>'

export async function stuurEmail({
  naar,
  onderwerp,
  html,
}: {
  naar: string
  onderwerp: string
  html: string
}) {
  if (!resend) {
    console.log(`[Email] ${onderwerp} → ${naar} (RESEND_API_KEY niet geconfigureerd)`)
    return
  }
  try {
    await resend.emails.send({ from: VAN, to: naar, subject: onderwerp, html })
  } catch (err) {
    console.error('[Email] Versturen mislukt:', err)
  }
}

export function adoptieAangevraagdHtml(dierNaam: string, userName: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#33335c">Nieuw adoptieverzoek voor ${dierNaam}</h2>
      <p>${userName} heeft een adoptieverzoek ingediend.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/adopties"
         style="background:#33335c;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
        Bekijk verzoek
      </a></p>
    </div>`
}

export function adoptieStatusHtml(dierNaam: string, status: string, userName: string) {
  const isGoedgekeurd = status === 'goedgekeurd' || status === 'afgerond'
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#33335c">Update over jouw adoptie van ${dierNaam}</h2>
      <p>Hallo ${userName},</p>
      <p>${
        isGoedgekeurd
          ? `Goed nieuws! Je adoptie van <strong>${dierNaam}</strong> is <strong>goedgekeurd</strong>. Het asiel neemt snel contact met je op voor de overdracht.`
          : `Je adoptie van <strong>${dierNaam}</strong> is helaas niet doorgegaan. Neem contact op met het asiel voor meer informatie.`
      }</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dossier"
         style="background:#f8aa25;color:#33335c;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">
        Bekijk je dossier
      </a></p>
    </div>`
}

export function nieuwBerichtHtml(dierNaam: string, bericht: string, userName: string) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#33335c">Nieuw bericht over ${dierNaam}</h2>
      <p>Hallo ${userName},</p>
      <p>Je hebt een nieuw bericht ontvangen:</p>
      <blockquote style="border-left:3px solid #f8aa25;padding-left:12px;color:#555">
        ${bericht}
      </blockquote>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="background:#E2725B;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
        Open chat
      </a></p>
    </div>`
}
