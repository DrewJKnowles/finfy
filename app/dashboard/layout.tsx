import { AppLayout } from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <AppLayout>{children}</AppLayout>
}

