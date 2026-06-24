import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { crmContacten, crmActiviteiten } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'
import { verstuurMail } from '@/lib/email'

export const dynamic = 'force-dynamic'

function brandedHtml(tekst: string): string {
  const veilig = tekst
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
  return `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ebebf0">
      <div style="background:linear-gradient(135deg,#33335c,#1a1a3e);padding:24px 32px">
        <p style="margin:0;font-size:18px;font-weight:800;color:#fff">🐾 PootGelukkig</p>
      </div>
      <div style="padding:32px;color:#33335c;font-size:14px;line-height:1.7">${veilig}</div>
    </div>`
}

export async function POST(req: NextRequest) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = (await req.json()) as {
    contactId?: number
    onderwerp?: string
    bericht?: string
  }

  if (!body.contactId || !body.onderwerp?.trim() || !body.bericht?.trim()) {
    return NextResponse.json({ error: 'Contact, onderwerp en bericht zijn verplicht' }, { status: 400 })
  }

  const [contact] = await db.select().from(crmContacten).where(eq(crmContacten.id, body.contactId)).limit(1)
  if (!contact) return NextResponse.json({ error: 'Contact niet gevonden' }, { status: 404 })
  if (!contact.email) return NextResponse.json({ error: 'Contact heeft geen e-mailadres' }, { status: 400 })

  const result = await verstuurMail({
    naar: contact.email,
    onderwerp: body.onderwerp.trim(),
    html: brandedHtml(body.bericht.trim()),
    meta: { template: 'crm-handmatig', contactId: contact.id, userId: contact.userId, asielId: contact.asielId },
  })

  // Leg de verzonden mail vast als activiteit op het contact
  await db.insert(crmActiviteiten).values({
    contactId: contact.id,
    type: 'mail',
    inhoud: `📧 ${body.onderwerp.trim()}\n\n${body.bericht.trim()}`,
    auteur: admin.naam,
  })

  return NextResponse.json({ ok: result.ok })
}
