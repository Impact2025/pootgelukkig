import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NieuwPleeggezinForm from '../NieuwPleeggezinForm'

export default async function NieuwPleeggezinPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/pleeggezinnen"
          className="text-[#33335c]/40 hover:text-[#33335c] transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#33335c]">Nieuw pleeggezin</h1>
          <p className="text-sm text-[#33335c]/50 mt-0.5">Voeg een nieuw pleeggezin toe</p>
        </div>
      </div>

      <NieuwPleeggezinForm />
    </div>
  )
}
