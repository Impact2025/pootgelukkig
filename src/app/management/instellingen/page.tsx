export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader, Card } from '@/components/admin/ui'

export default async function ManagementInstellingenPage() {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'admin') {
    redirect('/auth/login')
  }

  const modules = [
    { href: '/management/gebruikers', icon: 'group', label: 'Gebruikers', sub: 'Accounts & rechten' },
    { href: '/admin/ai-rollen', icon: 'group_add', label: 'AI-rollen', sub: 'Activeer het AI-team' },
    { href: '/management/coupons', icon: 'sell', label: 'Coupons', sub: 'Marketingcodes' },
    { href: '/management/blog', icon: 'article', label: 'Blog', sub: 'AI-SEO artikelen' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Instellingen"
        icon="settings"
        description="Platformbred beheer van accounts, AI-team en content."
      />

      <div className="grid sm:grid-cols-2 gap-3">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="bg-white rounded-2xl border border-[#33335c]/8 p-5 hover:border-[#33335c]/15 hover:shadow-md transition-all group"
          >
            <span className="material-symbols-outlined text-[#33335c]/30 group-hover:text-[#f8aa25] transition-colors mb-2 block">
              {m.icon}
            </span>
            <p className="font-extrabold text-[#33335c] text-sm">{m.label}</p>
            <p className="text-[#33335c]/40 text-xs">{m.sub}</p>
          </Link>
        ))}
      </div>

      <Card>
        <p className="text-sm font-bold text-[#33335c] mb-2">Asiel-specifieke instellingen</p>
        <p className="text-[#33335c]/50 text-sm">
          Openingstijden, adoptieprocedure en contactgegevens van een asiel worden per asiel beheerd in het
          asiel-portaal. Open het relevante asiel om die instellingen aan te passen.
        </p>
      </Card>
    </div>
  )
}
