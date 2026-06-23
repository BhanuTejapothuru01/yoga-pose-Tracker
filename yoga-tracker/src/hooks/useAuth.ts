'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProfile, updateProfile as updateProfileService } from '@/services/userService'
import type { Profile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const profile = await getProfile(userId)
      setUser(profile)
      setError(null)
      return profile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await fetchProfile(session.user.id)
      }
      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, fetchProfile])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      if (data.user) {
        const profile = await fetchProfile(data.user.id)
        router.push(profile && profile.onboarding_completed !== true ? '/onboarding' : '/dashboard')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      await supabase.auth.signOut()

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const result = (await response.json()) as { error?: string; userId?: string }

      if (!response.ok) {
        throw new Error(result.error ?? 'Sign up failed')
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) throw authError
      if (data.user) {
        await fetchProfile(data.user.id)
        router.push('/onboarding')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const updated = await updateProfileService(user.id, data)
      setUser(updated)
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, error, signIn, signUp, signOut, updateProfile }
}
