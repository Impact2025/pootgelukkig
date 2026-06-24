import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NieuwPleeggezinForm from '../NieuwPleeggezinForm'
import { PageHeader } from '@/components/admin/ui'

export default async function NieuwPleeggezinPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <Link
        href="/admin/pleeggezinnen"
        className="inline-flex items-center gap-1 text-[#33335c]/40 hover:text-[#33335c] text-sm font-semibold transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Pleeggezinnen
      </Link>
      <PageHeader
        title="Nieuw pleeggezin"
        description="Voeg een nieuw pleeggezin toe aan het systeem"
        icon="house"
      />
      <NieuwPleeggezinForm />
    </div>
  )
}
