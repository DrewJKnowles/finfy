import { AppLayout } from '@/components/layout/AppLayout'
import { requireAuth } from '@/lib/auth'

export default async function StatementsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  return <AppLayout>{children}</AppLayout>
}

