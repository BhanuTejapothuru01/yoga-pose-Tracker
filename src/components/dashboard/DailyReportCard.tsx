'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getDailyReports, getWeeklyRepTotal } from '@/services/analyticsService'

export function DailyReportCard() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Awaited<ReturnType<typeof getDailyReports>>>([])
  const [weeklyReps, setWeeklyReps] = useState(0)

  useEffect(() => {
    if (!user) return
    getDailyReports(user.id, 7).then(setReports)
    getWeeklyRepTotal(user.id).then(setWeeklyReps)
  }, [user])

  const today = reports[0]

  return (
    <div className="panel-card p-6">
      <h2 className="section-heading mb-4 text-lg">Daily & Weekly Analytics</h2>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="metric-card !p-3">
          <p className="text-2xl font-bold text-primary">{today?.sessions ?? 0}</p>
          <p className="text-xs text-text-muted">Today&apos;s sessions</p>
        </div>
        <div className="metric-card !p-3">
          <p className="text-2xl font-bold text-primary">{today?.reps ?? 0}</p>
          <p className="text-xs text-text-muted">Today&apos;s reps</p>
        </div>
        <div className="metric-card !p-3">
          <p className="text-2xl font-bold text-primary">{weeklyReps}</p>
          <p className="text-xs text-text-muted">Weekly reps</p>
        </div>
        <div className="metric-card !p-3">
          <p className="text-2xl font-bold text-primary">{today?.average_accuracy ?? 0}%</p>
          <p className="text-xs text-text-muted">Today accuracy</p>
        </div>
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text-muted">Last 7 days</h3>
      <div className="space-y-2">
        {reports.map((day) => (
          <div
            key={day.date}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/10 px-3 py-2 text-sm"
          >
            <span className="font-medium">{day.date}</span>
            <span className="text-text-muted">
              {day.sessions} sessions · {day.reps} reps · {day.average_accuracy}% avg
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
