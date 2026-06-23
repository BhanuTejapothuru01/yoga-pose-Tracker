import { createClient } from '@/lib/supabase/client'
import type { DailyReport, Session } from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export async function getDailyReports(userId: string, days = 7): Promise<DailyReport[]> {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  handleError(error, 'Failed to fetch sessions')

  const sessions = (data ?? []) as Session[]
  const byDate = new Map<string, Session[]>()

  sessions.forEach((session) => {
    const date = session.created_at.split('T')[0]
    const list = byDate.get(date) ?? []
    list.push(session)
    byDate.set(date, list)
  })

  const reports: DailyReport[] = []
  for (let i = 0; i < days; i += 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = d.toISOString().split('T')[0]
    const daySessions = byDate.get(date) ?? []

    reports.push({
      date,
      sessions: daySessions.length,
      duration_seconds: daySessions.reduce((s, x) => s + x.duration_seconds, 0),
      reps: daySessions.reduce((s, x) => s + (x.reps ?? 0), 0),
      average_accuracy:
        daySessions.length > 0
          ? Math.round(
              (daySessions.reduce((s, x) => s + x.accuracy, 0) / daySessions.length) * 10
            ) / 10
          : 0,
      exercises: [...new Set(daySessions.map((x) => x.pose_name))],
    })
  }

  return reports
}

export async function getWeeklyRepTotal(userId: string): Promise<number> {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data, error } = await supabase
    .from('sessions')
    .select('reps')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())

  handleError(error, 'Failed to fetch rep data')
  return (data ?? []).reduce((sum, row) => sum + (row.reps ?? 0), 0)
}
