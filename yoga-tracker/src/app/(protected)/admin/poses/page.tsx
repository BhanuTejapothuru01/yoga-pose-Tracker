import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminPosesClient } from '@/components/admin/AdminPosesClient'

export const dynamic = 'force-dynamic'

export default async function AdminPosesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return <AdminPosesClient />
}
