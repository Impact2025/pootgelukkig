import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import NieuwDierForm from './NieuwDierForm'

export default async function NieuwDierPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const asielId = session.user.asielId
  if (!asielId) redirect('/admin')

  return <NieuwDierForm asielId={asielId} />
}
