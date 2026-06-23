'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { AccuracyChart } from '@/components/dashboard/AccuracyChart'
import { RecentSessions } from '@/components/dashboard/RecentSessions'
import { StreakBadge } from '@/components/dashboard/StreakBadge'
import { DailyReportCard } from '@/components/dashboard/DailyReportCard'
import { WeeklyReportCard } from '@/components/dashboard/WeeklyReportCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'

export function DashboardClient() {
  const { user } = useAuth()
  const { stats, weeklySessions, accuracyByPose, recentSessions, loading } =
    useDashboard(user?.id)

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-6">
      <PageHeader
        title="Dashboard"
        description="Track your practice streaks, accuracy, and recent sessions."
      />
      <StreakBadge current={stats.current_streak} best={stats.best_streak} />
      <StatsCards stats={stats} />
      <DailyReportCard />
      <WeeklyReportCard />
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyChart data={weeklySessions} />
        <AccuracyChart data={accuracyByPose} />
      </div>
      <RecentSessions sessions={recentSessions} />
    </div>
  )
}
