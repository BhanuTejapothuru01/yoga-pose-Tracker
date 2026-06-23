'use client'

import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Exercise } from '@/types'

interface SessionSummaryProps {
  open: boolean
  exercise: Exercise | null
  durationSeconds: number
  averageAccuracy: number
  caloriesBurned: number
  reps?: number
  saving: boolean
  onSave: () => void
  onDiscard: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

const difficultyColor = {
  beginner: 'bg-primary-pale text-primary',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-600',
}

export function SessionSummary({
  open,
  exercise,
  durationSeconds,
  averageAccuracy,
  caloriesBurned,
  reps = 0,
  saving,
  onSave,
  onDiscard,
}: SessionSummaryProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Complete</DialogTitle>
        </DialogHeader>

        {exercise && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">{exercise.name}</h3>
              <Badge className={difficultyColor[exercise.difficulty]}>
                {exercise.difficulty}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
              <div className="metric-card !p-3 text-center sm:!p-4">
                <p className="text-lg font-bold text-primary sm:text-2xl">
                  {formatDuration(durationSeconds)}
                </p>
                <p className="text-xs text-text-muted">Duration</p>
              </div>
              <div className="metric-card !p-3 text-center sm:!p-4">
                <p className="text-lg font-bold text-primary sm:text-2xl">
                  {averageAccuracy.toFixed(1)}%
                </p>
                <p className="text-xs text-text-muted">Posture Score</p>
              </div>
              {exercise.exercise_type === 'rep' && (
                <div className="metric-card !p-3 text-center sm:!p-4">
                  <p className="text-lg font-bold text-primary sm:text-2xl">{reps}</p>
                  <p className="text-xs text-text-muted">Reps</p>
                </div>
              )}
              <div className="metric-card !p-3 text-center sm:!p-4">
                <p className="text-lg font-bold text-primary sm:text-2xl">{caloriesBurned}</p>
                <p className="text-xs text-text-muted">Calories</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Session
            </button>

            <button
              type="button"
              onClick={onDiscard}
              className="w-full text-center text-sm text-text-muted hover:text-error"
            >
              Discard
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
