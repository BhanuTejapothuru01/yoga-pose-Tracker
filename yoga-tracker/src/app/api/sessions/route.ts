import { NextRequest } from 'next/server'
import { ApiError, apiError, apiSuccess, requireAuth, sanitizeString } from '@/lib/api/security'
import { createSessionSchema } from '@/lib/api/validations'
import { classifyForm } from '@/lib/posture/postureEngine'

async function updateStreakServer(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  userId: string
) {
  const today = new Date().toISOString().split('T')[0]
  const { data: existing, error: fetchError } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError) throw new ApiError(500, fetchError.message)

  let currentStreak = 1
  let bestStreak = existing?.best_streak ?? 0

  if (existing?.last_session_date) {
    const lastDate = new Date(existing.last_session_date)
    const todayDate = new Date(today)
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) currentStreak = existing.current_streak
    else if (diffDays === 1) currentStreak = existing.current_streak + 1
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

  if (updateError) throw new ApiError(500, updateError.message)
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireAuth()
    const limit = Math.min(
      100,
      Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 20))
    )

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new ApiError(500, error.message)
    return apiSuccess({ sessions: data ?? [] })
  } catch (err) {
    return apiError(err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireAuth()
    const body = await request.json()
    const parsed = createSessionSchema.parse(body)
    const classification = parsed.classification ?? classifyForm(parsed.accuracy)
    const logDate = new Date().toISOString().split('T')[0]

    const payload = {
      user_id: user.id,
      pose_id: null,
      pose_name: sanitizeString(parsed.pose_name, 200),
      exercise_id: parsed.exercise_id ?? null,
      category: parsed.category ?? null,
      exercise_type: parsed.exercise_type ?? 'hold',
      duration_seconds: parsed.duration_seconds,
      accuracy: parsed.accuracy,
      confidence: parsed.confidence,
      calories_burned: parsed.calories_burned ?? 0,
      reps: parsed.reps ?? 0,
      sets: parsed.sets ?? 1,
      feedback_log: parsed.feedback_log ?? [],
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .insert(payload)
      .select()
      .single()

    if (error) throw new ApiError(500, error.message)

    const { error: logError } = await supabase.from('exercise_logs').insert({
      session_id: session.id,
      user_id: user.id,
      exercise_id: session.exercise_id,
      exercise_name: session.pose_name,
      category: session.category,
      exercise_type: session.exercise_type ?? 'hold',
      reps: session.reps ?? 0,
      sets: session.sets ?? 1,
      form_score: session.accuracy,
      classification,
      duration_seconds: session.duration_seconds,
      feedback_log: session.feedback_log ?? [],
    })

    if (logError) throw new ApiError(500, logError.message)

    const { data: progressRow } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', logDate)
      .maybeSingle()

    const exercises = new Set(progressRow?.exercises_completed ?? [])
    exercises.add(session.pose_name)

    const { error: progressError } = await supabase.from('progress_logs').upsert(
      {
        user_id: user.id,
        log_date: logDate,
        total_sessions: (progressRow?.total_sessions ?? 0) + 1,
        total_reps: (progressRow?.total_reps ?? 0) + (session.reps ?? 0),
        total_duration_seconds:
          (progressRow?.total_duration_seconds ?? 0) + session.duration_seconds,
        average_form_score: progressRow
          ? Math.round(
              ((progressRow.average_form_score * progressRow.total_sessions +
                session.accuracy) /
                (progressRow.total_sessions + 1)) *
                10
            ) / 10
          : session.accuracy,
        exercises_completed: Array.from(exercises),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,log_date' }
    )

    if (progressError) throw new ApiError(500, progressError.message)

    await updateStreakServer(supabase, user.id)

    return apiSuccess({ session, classification }, 201)
  } catch (err) {
    return apiError(err)
  }
}
