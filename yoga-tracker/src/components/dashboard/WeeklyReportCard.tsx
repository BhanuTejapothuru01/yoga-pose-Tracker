'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Dumbbell, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { WeeklyReport } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function WeeklyReportCard() {
  const { user } = useAuth()
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch('/api/analytics/weekly?weeks=4')
      .then((r) => r.json())
      .then((json) => setReports(json.data?.reports ?? []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return <Skeleton className="h-48 rounded-2xl" />
  }

  const current = reports[0]

  return (
    <div className="card rounded-2xl border border-border p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-text-brand">Weekly Report</h2>
      </div>

      {!current || current.total_sessions === 0 ? (
        <p className="text-sm text-text-muted">
          Complete a session this week to see your weekly report.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-primary-pale p-4">
            <p className="text-2xl font-bold text-primary">{current.total_sessions}</p>
            <p className="text-xs text-text-muted">Sessions this week</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-2xl font-bold text-text-brand">{current.total_reps}</p>
            <p className="text-xs text-text-muted">Total reps</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-2xl font-bold text-text-brand">{current.average_form_score}%</p>
            <p className="text-xs text-text-muted">Avg form score</p>
          </div>
        </div>
      )}

      {current && current.total_sessions > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {current.days_active} active days
          </span>
          <span>{formatDuration(current.total_duration_seconds)} practiced</span>
          {current.top_exercises.length > 0 && (
            <span className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              Top: {current.top_exercises.join(', ')}
            </span>
          )}
        </div>
      )}

      {reports.length > 1 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
            Historical weeks
          </p>
          <div className="space-y-2">
            {reports.slice(1, 4).map((week) => (
              <div
                key={week.week_start}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-text-muted">
                  {week.week_start} — {week.week_end}
                </span>
                <span className="font-medium text-text-brand">
                  {week.total_sessions} sessions · {week.average_form_score}% form
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
