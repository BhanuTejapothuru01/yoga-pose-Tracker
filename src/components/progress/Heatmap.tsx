'use client'

import { useMemo } from 'react'
import type { Session } from '@/types'

interface HeatmapProps {
  sessions: Session[]
}

const LEVELS = ['#EFF8F2', '#B7E4C7', '#74C69D', '#2D6A4F']

function getIntensity(count: number): string {
  if (count === 0) return LEVELS[0]
  if (count === 1) return LEVELS[1]
  if (count === 2) return LEVELS[2]
  return LEVELS[3]
}

export function Heatmap({ sessions }: HeatmapProps) {
  const { weeks, today } = useMemo(() => {
    const map = new Map<string, number>()
    sessions.forEach((s) => {
      const date = s.created_at.split('T')[0]
      map.set(date, (map.get(date) ?? 0) + 1)
    })

    const todayStr = new Date().toISOString().split('T')[0]
    const cells: { date: string; count: number; day: number }[] = []

    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 364)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      cells.push({
        date: dateStr,
        count: map.get(dateStr) ?? 0,
        day: d.getDay(),
      })
    }

    const weekGroups: typeof cells[] = []
    let currentWeek: typeof cells = []

    cells.forEach((cell, i) => {
      if (i > 0 && cell.day === 0 && currentWeek.length > 0) {
        weekGroups.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(cell)
    })
    if (currentWeek.length > 0) weekGroups.push(currentWeek)

    return { weeks: weekGroups.slice(-52), today: todayStr }
  }, [sessions])

  return (
    <div className="card-glass p-6">
      <h3 className="mb-4 font-semibold text-text-brand">Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, di) => {
                const cell = week.find((c) => c.day === di)
                if (!cell) {
                  return <div key={di} className="h-3 w-3 rounded-sm bg-surface-2" />
                }
                const isToday = cell.date === today
                return (
                  <div
                    key={di}
                    title={`${cell.count} session${cell.count !== 1 ? 's' : ''} on ${new Date(cell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    className={`h-3 w-3 rounded-sm ${isToday ? 'ring-1 ring-primary ring-offset-1' : ''}`}
                    style={{ backgroundColor: getIntensity(cell.count) }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
        <span>Less</span>
        {LEVELS.map((color) => (
          <div key={color} className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
