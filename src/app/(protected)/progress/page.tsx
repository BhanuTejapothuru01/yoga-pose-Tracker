'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StreakBadge } from '@/components/dashboard/StreakBadge'
import { MonthlyChart } from '@/components/progress/MonthlyChart'
import { PoseAccuracyTable } from '@/components/progress/PoseAccuracyTable'
import { Heatmap } from '@/components/progress/Heatmap'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useProgressData } from '@/hooks/useDashboard'

const ranges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'All time', days: null },
] as const

export default function ProgressPage() {
  const { user } = useAuth()
  const [selectedRange, setSelectedRange] = useState<number | null>(30)
  const { sessions, streak, loading } = useProgressData(user?.id, selectedRange)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <PageHeader
        title="Your Progress"
        description="Review accuracy trends, practice heatmap, and pose breakdown."
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex gap-2">
          {ranges.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => setSelectedRange(range.days)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                selectedRange === range.days
                  ? 'bg-primary text-white'
                  : 'bg-surface-2 text-text-muted hover:bg-primary-pale'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <StreakBadge current={streak.current} best={streak.best} />
      <MonthlyChart sessions={sessions} />
      <Heatmap sessions={sessions} />
      <PoseAccuracyTable sessions={sessions} />
    </div>
  )
}
