import { createClient } from '@/lib/supabase/client'
import { classifyForm } from '@/lib/posture/postureEngine'
import { persistSessionLogs } from '@/services/logService'
import type {
  DashboardStats,
  FormClassification,
  Session,
} from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export async function createSession(
  data: Omit<Session, 'id' | 'created_at'>,
  meta?: { exercise_slug?: string; classification?: FormClassification }
): Promise<Session> {
  try {
    const supabase = createClient()
    const payload = {
      ...data,
      exercise_id: data.exercise_id ?? null,
      category: data.category ?? null,
      exercise_type: data.exercise_type ?? 'hold',
      reps: data.reps ?? 0,
      sets: data.sets ?? 1,
    }
    const { data: session, error } = await supabase
      .from('sessions')
      .insert(payload)
      .select()
      .single()

    handleError(error, 'Failed to create session')

    const saved = session as Session
    const classification = meta?.classification ?? classifyForm(saved.accuracy)
    await persistSessionLogs(saved, {
      exercise_slug: meta?.exercise_slug,
      classification,
    })

    return saved
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function getUserSessions(
  userId: string,
  limit?: number
): Promise<Session[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    handleError(error, 'Failed to fetch sessions')
    return (data ?? []) as Session[]
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function getSessionStats(userId: string): Promise<DashboardStats> {
  try {
    const supabase = createClient()

    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('duration_seconds, accuracy, reps')
      .eq('user_id', userId)

    handleError(sessionsError, 'Failed to fetch session stats')

    const { data: streak, error: streakError } = await supabase
      .from('user_streaks')
      .select('current_streak, best_streak')
      .eq('user_id', userId)
      .single()

    handleError(streakError, 'Failed to fetch streak')

    const rows = sessions ?? []
    const totalSessions = rows.length
    const totalDuration = rows.reduce((sum, s) => sum + s.duration_seconds, 0)
    const accuracies = rows.map((s) => s.accuracy)
    const averageAccuracy =
      accuracies.length > 0
        ? Math.round(
            (accuracies.reduce((a, b) => a + b, 0) / accuracies.length) * 10
          ) / 10
        : 0
    const bestAccuracy =
      accuracies.length > 0 ? Math.max(...accuracies) : 0
    const totalReps = rows.reduce((sum, s) => sum + (s.reps ?? 0), 0)

    return {
      total_sessions: totalSessions,
      total_duration_seconds: totalDuration,
      total_reps: totalReps,
      current_streak: streak?.current_streak ?? 0,
      best_streak: streak?.best_streak ?? 0,
      average_accuracy: averageAccuracy,
      best_accuracy: bestAccuracy,
    }
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function updateUserStreak(userId: string): Promise<void> {
  try {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: existing, error: fetchError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    handleError(fetchError, 'Failed to fetch streak')

    let currentStreak = 1
    let bestStreak = existing?.best_streak ?? 0

    if (existing?.last_session_date) {
      const lastDate = new Date(existing.last_session_date)
      const todayDate = new Date(today)
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 0) {
        currentStreak = existing.current_streak
      } else if (diffDays === 1) {
        currentStreak = existing.current_streak + 1
      } else {
        currentStreak = 1
      }
    }

    bestStreak = Math.max(bestStreak, currentStreak)

    const { error: updateError } = await supabase
      .from('user_streaks')
      .update({
        current_streak: currentStreak,
        best_streak: bestStreak,
        last_session_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    handleError(updateError, 'Failed to update streak')
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}
