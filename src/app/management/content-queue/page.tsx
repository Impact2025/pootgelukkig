export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/admin/ui'
import ContentQueueClient from './ContentQueueClient'

export default async function ContentQueuePage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }
  if (!session.user.asielId) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <PageHeader title="Content-queue" icon="inbox" />
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 text-sm">
          <p className="font-semibold mb-1">Geen asiel gekoppeld</p>
          <p>Jouw account is nog niet gekoppeld aan een asiel. Neem contact op met de beheerder.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Content-queue"
        icon="inbox"
        description="AI-gegenereerde concepten van je AI-team. Bekijk, bewerk en keur goed voordat je ze gebruikt."
      />
      <ContentQueueClient />
    </div>
  )
}
