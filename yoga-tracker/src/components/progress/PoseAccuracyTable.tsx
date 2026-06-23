'use client'

import { useMemo } from 'react'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PoseAccuracyStat, Session } from '@/types'

function progressColor(accuracy: number): string {
  if (accuracy > 80) return '[&>div]:bg-primary'
  if (accuracy >= 60) return '[&>div]:bg-yellow-500'
  return '[&>div]:bg-red-500'
}

interface PoseAccuracyTableProps {
  sessions: Session[]
}

export function PoseAccuracyTable({ sessions }: PoseAccuracyTableProps) {
  const stats = useMemo(() => {
    const map = new Map<string, PoseAccuracyStat>()

    sessions.forEach((s) => {
      const existing = map.get(s.pose_name)
      if (!existing) {
        map.set(s.pose_name, {
          pose_name: s.pose_name,
          sessions_count: 1,
          avg_accuracy: s.accuracy,
          best_accuracy: s.accuracy,
          last_practiced: s.created_at,
        })
      } else {
        const totalAccuracy = existing.avg_accuracy * existing.sessions_count + s.accuracy
        const newCount = existing.sessions_count + 1
        map.set(s.pose_name, {
          pose_name: s.pose_name,
          sessions_count: newCount,
          avg_accuracy: Math.round((totalAccuracy / newCount) * 10) / 10,
          best_accuracy: Math.max(existing.best_accuracy, s.accuracy),
          last_practiced:
            s.created_at > existing.last_practiced ? s.created_at : existing.last_practiced,
        })
      }
    })

    return Array.from(map.values()).sort((a, b) => b.avg_accuracy - a.avg_accuracy)
  }, [sessions])

  if (stats.length === 0) {
    return (
      <div className="card-glass p-8 text-center text-text-muted">
        No pose data yet
      </div>
    )
  }

  return (
    <div className="card-glass overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-semibold text-text-brand">Pose Accuracy</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pose</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Avg Accuracy</TableHead>
              <TableHead>Best</TableHead>
              <TableHead>Last Practiced</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((row) => (
              <TableRow key={row.pose_name}>
                <TableCell className="font-medium">{row.pose_name}</TableCell>
                <TableCell>{row.sessions_count}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={row.avg_accuracy}
                      className={`h-2 w-24 ${progressColor(row.avg_accuracy)}`}
                    />
                    <span>{row.avg_accuracy}%</span>
                  </div>
                </TableCell>
                <TableCell>{row.best_accuracy}%</TableCell>
                <TableCell>
                  {new Date(row.last_practiced).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
