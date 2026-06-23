'use client'

import { memo } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import type { FormClassification } from '@/types'
import { cn } from '@/lib/utils'

interface MetricsOverlayProps {
  accuracy: number
  confidence: number
  holdSeconds: number
  sessionSeconds: number
  poseLocked?: boolean
  lockThreshold?: number
  reps?: number
  showReps?: boolean
  formScore?: number
  classification?: FormClassification
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export const MetricsOverlay = memo(function MetricsOverlay({
  accuracy,
  confidence,
  holdSeconds,
  sessionSeconds,
  poseLocked = false,
  lockThreshold = 75,
  reps = 0,
  showReps = false,
  formScore,
  classification,
}: MetricsOverlayProps) {
  const score = formScore ?? accuracy

  return (
    <div className="absolute bottom-2 left-2 right-2 z-10 card-glass px-3 py-2 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:px-4 sm:py-3">
      {classification && (
        <div
          className={cn(
            'mb-2 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold sm:text-xs',
            classification === 'correct' && 'bg-primary/15 text-primary',
            classification === 'incorrect' && 'bg-red-100 text-red-700',
            classification === 'needs_adjustment' && 'bg-amber-100 text-amber-800'
          )}
        >
          {classification === 'correct'
            ? 'Correct'
            : classification === 'incorrect'
              ? 'Incorrect'
              : 'Adjust form'}
        </div>
      )}
      <div
        className={cn(
          'mb-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold sm:text-xs',
          poseLocked
            ? 'bg-primary/15 text-primary'
            : 'bg-gray-100 text-text-muted'
        )}
      >
        {poseLocked ? (
          <>
            <Lock className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            <span className="truncate">Pose locked</span>
          </>
        ) : (
          <>
            <LockOpen className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            <span className="truncate">Reach {lockThreshold}% to lock</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1 sm:flex sm:gap-6">
        <div className="min-w-0 text-center sm:text-left">
          <p
            className={cn(
              'text-lg font-bold tabular-nums sm:text-2xl',
              poseLocked ? 'text-primary' : 'text-text-brand'
            )}
          >
            {Math.round(score)}%
          </p>
          <p className="truncate text-[10px] text-text-muted sm:text-xs">Form score</p>
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-base font-semibold tabular-nums text-text-brand sm:text-lg">
            {Math.round(confidence * 100)}%
          </p>
          <p className="truncate text-[10px] text-text-muted sm:text-xs">Confidence</p>
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <p
            className={cn(
              'text-base font-semibold tabular-nums sm:text-lg',
              showReps ? 'text-primary' : 'text-text-brand'
            )}
          >
            {showReps ? reps : `${holdSeconds}s`}
          </p>
          <p className="truncate text-[10px] text-text-muted sm:text-xs">
            {showReps ? 'Reps' : 'Hold'}
          </p>
        </div>
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-base font-semibold tabular-nums text-text-brand sm:text-lg">
            {formatTime(sessionSeconds)}
          </p>
          <p className="truncate text-[10px] text-text-muted sm:text-xs">Session</p>
        </div>
      </div>
    </div>
  )
})
