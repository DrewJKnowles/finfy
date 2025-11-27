import { AppLayout } from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'

export default async function AccountsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <AppLayout>{children}</AppLayout>
}

