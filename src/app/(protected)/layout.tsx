import { AppShell } from '@/components/layout/AppShell'
import { OnboardingGuard } from '@/components/onboarding/OnboardingGuard'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell>
      <OnboardingGuard>{children}</OnboardingGuard>
    </AppShell>
  )
}
