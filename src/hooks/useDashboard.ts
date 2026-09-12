'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSessionStats, getUserSessions } from '@/services/sessionService'
import type { DashboardStats, Session } from '@/types'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function useDashboard(userId: string | undefined) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [weeklySessions, setWeeklySessions] = useState<
    { day: string; sessions: number }[]
  >([])
  const [accuracyByPose, setAccuracyByPose] = useState<
    { pose: string; accuracy: number }[]
  >([])
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsData, sessions] = await Promise.all([
          getSessionStats(userId),
          getUserSessions(userId, 30),
        ])

        setStats(statsData)
        setRecentSessions(sessions.slice(0, 10))

        const weekStart = getWeekStart(new Date())
        const weekly = DAYS.map((day, index) => {
          const date = new Date(weekStart)
          date.setDate(date.getDate() + index)
          const dateStr = date.toISOString().split('T')[0]
          const count = sessions.filter((s) =>
            s.created_at.startsWith(dateStr)
          ).length
          return { day, sessions: count }
        })
        setWeeklySessions(weekly)

        const last14 = sessions.slice(0, 14).reverse()
        setAccuracyByPose(
          last14.map((s, i) => ({
            pose: `#${i + 1}`,
            accuracy: s.accuracy,
          }))
        )
      } catch {
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  return { stats, weeklySessions, accuracyByPose, recentSessions, loading }
}

export function useProgressData(userId: string | undefined, days: number | null) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [streak, setStreak] = useState({ current: 0, best: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const supabase = createClient()
        const allSessions = await getUserSessions(userId)

        let filtered = allSessions
        if (days !== null) {
          const cutoff = new Date()
          cutoff.setDate(cutoff.getDate() - days)
          filtered = allSessions.filter(
            (s) => new Date(s.created_at) >= cutoff
          )
        }

        setSessions(filtered)

        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('current_streak, best_streak')
          .eq('user_id', userId)
          .single()

        setStreak({
          current: streakData?.current_streak ?? 0,
          best: streakData?.best_streak ?? 0,
        })
      } catch {
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, days])

  return { sessions, streak, loading }
}
