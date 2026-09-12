'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const ONBOARDING_PATH = '/onboarding'
const BYPASS = [ONBOARDING_PATH, '/login', '/signup']

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading || !user) return
    if (pathname.startsWith(ONBOARDING_PATH) && user.onboarding_completed === true) {
      router.replace('/dashboard')
      return
    }
    if (BYPASS.some((p) => pathname.startsWith(p))) return

    if (user.onboarding_completed !== true) {
      router.replace(ONBOARDING_PATH)
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-text-muted">
        Loading…
      </div>
    )
  }

  return children
}
