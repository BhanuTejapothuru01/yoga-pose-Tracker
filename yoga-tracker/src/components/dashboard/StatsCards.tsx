'use client'

import { BarChart2, Clock, Flame, Target } from 'lucide-react'
import type { DashboardStats } from '@/types'

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Sessions',
      value: stats.total_sessions,
      icon: BarChart2,
      color: 'bg-primary-pale text-primary',
      display: String(stats.total_sessions),
    },
    {
      label: 'Total Practice',
      value: stats.total_duration_seconds,
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
      display: formatDuration(stats.total_duration_seconds),
    },
    {
      label: 'Current Streak',
      value: stats.current_streak,
      icon: Flame,
      color: 'bg-orange-100 text-orange-600',
      display: `${stats.current_streak} days 🔥`,
    },
    {
      label: 'Total Reps',
      value: stats.total_reps,
      icon: Target,
      color: 'bg-purple-100 text-purple-600',
      display: String(stats.total_reps ?? 0),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="metric-card">
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${card.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-text-brand">{card.display}</p>
            <p className="text-sm text-text-muted">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
