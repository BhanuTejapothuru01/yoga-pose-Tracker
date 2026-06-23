import { createClient } from '@/lib/supabase/client'
import type { PlatformStats, Profile } from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export async function getAllUsers(): Promise<
  (Profile & { sessions_count: number })[]
> {
  try {
    const supabase = createClient()
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    handleError(error, 'Failed to fetch users')

    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('user_id')

    handleError(sessionsError, 'Failed to fetch session counts')

    const countMap = (sessions ?? []).reduce<Record<string, number>>(
      (acc, s) => {
        acc[s.user_id] = (acc[s.user_id] ?? 0) + 1
        return acc
      },
      {}
    )

    return (profiles ?? []).map((p) => ({
      ...(p as Profile),
      sessions_count: countMap[p.id] ?? 0,
    }))
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const supabase = createClient()

    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    handleError(usersError, 'Failed to fetch user count')

    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('accuracy, pose_name, user_id, created_at')

    handleError(sessionsError, 'Failed to fetch sessions')

    const rows = sessions ?? []
    const totalSessions = rows.length
    const avgAccuracy =
      totalSessions > 0
        ? Math.round(
            (rows.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions) * 10
          ) / 10
        : 0

    const poseCounts = rows.reduce<Record<string, number>>((acc, s) => {
      acc[s.pose_name] = (acc[s.pose_name] ?? 0) + 1
      return acc
    }, {})

    const mostPracticed =
      Object.entries(poseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

    const today = new Date().toISOString().split('T')[0]
    const activeToday = new Set(
      rows
        .filter((s) => s.created_at.startsWith(today))
        .map((s) => s.user_id)
    ).size

    return {
      total_users: totalUsers ?? 0,
      total_sessions: totalSessions,
      avg_accuracy: avgAccuracy,
      most_practiced_pose: mostPracticed,
      active_users_today: activeToday,
    }
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<void> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)

    handleError(error, 'Failed to update user role')
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}
