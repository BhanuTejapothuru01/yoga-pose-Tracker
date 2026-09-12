'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Session } from '@/types'

interface MonthlyChartProps {
  sessions: Session[]
}

export function MonthlyChart({ sessions }: MonthlyChartProps) {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    sessions.forEach((s) => {
      const date = s.created_at.split('T')[0]
      map.set(date, (map.get(date) ?? 0) + 1)
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: count,
      }))
  }, [sessions])

  if (data.length === 0) {
    return (
      <div className="card-glass flex h-60 items-center justify-center p-6 text-text-muted">
        No data yet — complete a session to see your progress
      </div>
    )
  }

  return (
    <div className="card-glass p-6">
      <h3 className="mb-4 font-semibold text-text-brand">Sessions Over Time</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sessionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D6A4F" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2D6A4F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#2D6A4F"
            fill="url(#sessionFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
