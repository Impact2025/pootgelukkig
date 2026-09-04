export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ManagementShell from '@/components/admin/ManagementShell'

export default async function ManagementLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login')
  }
  // Het management-portaal is uitsluitend voor admins.
  if (session.user.rol !== 'admin') {
    redirect('/admin')
  }

  return (
    <ManagementShell
      user={{
        naam: session.user.name ?? 'Beheerder',
        email: session.user.email ?? '',
        rol: session.user.rol,
      }}
      counts={{ wachtrij: 0 }}
    >
      {children}
    </ManagementShell>
  )
}
