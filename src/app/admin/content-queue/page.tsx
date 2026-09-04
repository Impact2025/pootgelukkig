export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ContentQueueClient from './ContentQueueClient'

export default async function ContentQueuePage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }
  if (!session.user.organisatieId) {
    return (
      <div className="min-h-screen bg-calm-surface p-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="mb-1 font-jakarta font-bold">Geen organisatie gekoppeld</p>
          <p className="font-inter">Jouw account is nog niet gekoppeld aan een organisatie. Neem contact op met de beheerder.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-calm-surface px-5 py-6 pb-28 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <ContentQueueClient />
      </div>
    </div>
  )
}
