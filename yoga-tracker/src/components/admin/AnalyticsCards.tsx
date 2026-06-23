'use client'

import { BarChart2, Target, TrendingUp, Users, Zap } from 'lucide-react'
import type { PlatformStats } from '@/types'

interface AnalyticsCardsProps {
  stats: PlatformStats
}

export function AnalyticsCards({ stats }: AnalyticsCardsProps) {
  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Sessions', value: stats.total_sessions, icon: BarChart2, color: 'bg-primary-pale text-primary' },
    { label: 'Most Practiced Pose', value: stats.most_practiced_pose, icon: TrendingUp, color: 'bg-purple-100 text-purple-600', isText: true },
    { label: 'Avg Platform Accuracy', value: `${stats.avg_accuracy}%`, icon: Target, color: 'bg-green-100 text-green-600', isText: true },
    { label: 'Active Today', value: stats.active_users_today, icon: Zap, color: 'bg-orange-100 text-orange-600' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="metric-card">
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${card.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className={`font-bold text-text-brand ${card.isText ? 'text-lg' : 'text-3xl'}`}>
              {card.value}
            </p>
            <p className="text-sm text-text-muted">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
