'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Session } from '@/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function accuracyBadge(accuracy: number) {
  if (accuracy > 80) return 'bg-primary-pale text-primary'
  if (accuracy >= 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-600'
}

interface RecentSessionsProps {
  sessions: Session[]
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <div className="card-glass flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 text-5xl">🧘</div>
        <h3 className="mb-2 text-lg font-semibold">No sessions yet</h3>
        <p className="mb-6 text-text-muted">Start your first session to track your progress.</p>
        <Link href="/session" className="btn-primary">
          Start your first session
        </Link>
      </div>
    )
  }

  return (
    <div className="card-glass overflow-hidden">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-semibold text-text-brand">Recent Sessions</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Pose</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{formatDate(session.created_at)}</TableCell>
                <TableCell className="font-medium">{session.pose_name}</TableCell>
                <TableCell>
                  <Badge className={accuracyBadge(session.accuracy)}>
                    {session.accuracy}%
                  </Badge>
                </TableCell>
                <TableCell>{formatDuration(session.duration_seconds)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
