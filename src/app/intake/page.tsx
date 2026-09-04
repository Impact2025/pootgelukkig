export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import IntakeForm from './IntakeForm'

export default async function IntakePage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1E293B]">Nieuwe cliëntintake</h1>
          <p className="text-[#1E293B]/50 text-sm mt-1">
            Leg de hulpvraag van een nieuwe cliënt vast. Er wordt direct een cliënt en een dossier
            (status &ldquo;intake&rdquo;) aangemaakt.
          </p>
        </div>
        <IntakeForm />
      </div>
    </div>
  )
}
