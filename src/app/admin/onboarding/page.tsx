export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import OnboardingChat from './OnboardingChat'

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'asiel' || !session.user.organisatieId) {
    redirect('/admin')
  }

  return <OnboardingChat />
}
