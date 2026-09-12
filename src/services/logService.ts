import { createClient } from '@/lib/supabase/client'
import { classifyForm } from '@/lib/posture/postureEngine'
import type {
  ExerciseCategory,
  ExerciseLog,
  ExerciseType,
  FormClassification,
  ProgressLog,
  Session,
  WeeklyReport,
} from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export async function recordExerciseLog(
  session: Session,
  meta: {
    exercise_slug?: string
    classification?: FormClassification
  } = {}
): Promise<ExerciseLog> {
  const supabase = createClient()
  const formScore = session.accuracy
  const classification = meta.classification ?? classifyForm(formScore)

  const payload = {
    session_id: session.id,
    user_id: session.user_id,
    exercise_id: session.exercise_id,
    exercise_name: session.pose_name,
    exercise_slug: meta.exercise_slug ?? null,
    category: session.category,
    exercise_type: session.exercise_type ?? 'hold',
    reps: session.reps ?? 0,
    sets: session.sets ?? 1,
    form_score: formScore,
    classification,
    duration_seconds: session.duration_seconds,
    feedback_log: session.feedback_log ?? [],
  }

  const { data, error } = await supabase.from('exercise_logs').insert(payload).select().single()
  handleError(error, 'Failed to record exercise log')
  return data as ExerciseLog
}

export async function upsertProgressLog(
  userId: string,
  session: Session,
  exerciseName: string
): Promise<void> {
  const supabase = createClient()
  const logDate = new Date().toISOString().split('T')[0]

  const { data: existing, error: fetchError } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .maybeSingle()

  handleError(fetchError, 'Failed to fetch progress log')

  const exercises = new Set(existing?.exercises_completed ?? [])
  exercises.add(exerciseName)

  const payload = {
    user_id: userId,
    log_date: logDate,
    total_sessions: (existing?.total_sessions ?? 0) + 1,
    total_reps: (existing?.total_reps ?? 0) + (session.reps ?? 0),
    total_duration_seconds:
      (existing?.total_duration_seconds ?? 0) + session.duration_seconds,
    average_form_score: existing
      ? Math.round(
          ((existing.average_form_score * existing.total_sessions + session.accuracy) /
            (existing.total_sessions + 1)) *
            10
        ) / 10
      : session.accuracy,
    exercises_completed: Array.from(exercises),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('progress_logs').upsert(payload, {
    onConflict: 'user_id,log_date',
  })
  handleError(error, 'Failed to update progress log')
}

export async function getProgressLogs(
  userId: string,
  days = 30
): Promise<ProgressLog[]> {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', since.toISOString().split('T')[0])
    .order('log_date', { ascending: false })

  handleError(error, 'Failed to fetch progress logs')
  return (data ?? []) as ProgressLog[]
}

export async function getWeeklyReports(
  userId: string,
  weeks = 4
): Promise<WeeklyReport[]> {
  const logs = await getProgressLogs(userId, weeks * 7)
  const reports: WeeklyReport[] = []

  for (let w = 0; w < weeks; w += 1) {
    const weekEnd = new Date()
    weekEnd.setDate(weekEnd.getDate() - w * 7)
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 6)

    const startStr = weekStart.toISOString().split('T')[0]
    const endStr = weekEnd.toISOString().split('T')[0]

    const weekLogs = logs.filter((l) => l.log_date >= startStr && l.log_date <= endStr)
    if (weekLogs.length === 0 && w > 0) continue

    const exerciseCounts: Record<string, number> = {}
    for (const log of weekLogs) {
      for (const ex of log.exercises_completed) {
        exerciseCounts[ex] = (exerciseCounts[ex] ?? 0) + 1
      }
    }

    const topExercises = Object.entries(exerciseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    const totalSessions = weekLogs.reduce((s, l) => s + l.total_sessions, 0)
    const totalReps = weekLogs.reduce((s, l) => s + l.total_reps, 0)
    const totalDuration = weekLogs.reduce((s, l) => s + l.total_duration_seconds, 0)
    const avgForm =
      weekLogs.length > 0
        ? Math.round(
            (weekLogs.reduce((s, l) => s + l.average_form_score, 0) / weekLogs.length) * 10
          ) / 10
        : 0

    reports.push({
      week_start: startStr,
      week_end: endStr,
      total_sessions: totalSessions,
      total_reps: totalReps,
      total_duration_seconds: totalDuration,
      average_form_score: avgForm,
      days_active: weekLogs.length,
      top_exercises: topExercises,
    })
  }

  return reports
}

export async function getExerciseLogs(
  userId: string,
  limit = 50
): Promise<ExerciseLog[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  handleError(error, 'Failed to fetch exercise logs')
  return (data ?? []) as ExerciseLog[]
}

/** Called after session insert — writes exercise + progress logs */
export async function persistSessionLogs(
  session: Session,
  meta: {
    exercise_slug?: string
    category?: ExerciseCategory | null
    exercise_type?: ExerciseType
    classification?: FormClassification
  } = {}
): Promise<void> {
  await recordExerciseLog(session, meta)
  await upsertProgressLog(session.user_id, session, session.pose_name)
}
