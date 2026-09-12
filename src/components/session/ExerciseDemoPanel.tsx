'use client'

import { Play } from 'lucide-react'
import { PoseReferenceIllustration } from './PoseReferenceIllustration'
import type { Exercise } from '@/types'
import { cn } from '@/lib/utils'

interface ExerciseDemoPanelProps {
  exercise: Exercise
  onStart?: () => void
  showStart?: boolean
  variant?: 'full' | 'overlay'
}

export function ExerciseDemoPanel({
  exercise,
  onStart,
  showStart = false,
  variant = 'full',
}: ExerciseDemoPanelProps) {
  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          'absolute bottom-2 right-2 z-10 flex max-h-[min(52%,280px)] w-[min(calc(100%-5rem),300px)] flex-col overflow-hidden',
          'rounded-xl border border-white/30 bg-white/95 shadow-xl backdrop-blur-md',
          'sm:bottom-4 sm:right-4 sm:max-h-[min(60%,320px)] sm:w-[min(calc(100%-6rem),340px)]'
        )}
      >
        <div className="shrink-0 border-b border-primary/15 bg-primary/5 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary sm:text-xs">
            Exercise demonstration
          </p>
          <h3 className="text-sm font-bold text-text-brand sm:text-base">{exercise.name}</h3>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[88px_1fr] gap-2 overflow-hidden p-2 sm:grid-cols-[100px_1fr] sm:gap-3 sm:p-3">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-950 ring-1 ring-primary/25">
            <PoseReferenceIllustration poseName={exercise.name} compact showLabel />
          </div>

          <div className="min-h-0 overflow-y-auto pr-0.5">
            <p className="mb-1.5 line-clamp-2 text-[11px] leading-snug text-text-muted sm:text-xs">
              {exercise.description}
            </p>
            <ol className="list-inside list-decimal space-y-0.5 text-[10px] leading-snug text-text-brand sm:text-xs">
              {exercise.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        {exercise.demo_video_url && (
          <a
            href={exercise.demo_video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline mx-2 mb-2 inline-flex shrink-0 !py-1.5 text-[10px] sm:mx-3 sm:mb-3 sm:text-xs"
          >
            <Play className="h-3 w-3" />
            Watch video
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="panel-card overflow-hidden">
      <div className="border-b border-primary/15 bg-primary/5 px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Exercise demonstration
        </p>
        <h3 className="font-bold text-text-brand">{exercise.name}</h3>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-950 ring-2 ring-primary/20">
          <PoseReferenceIllustration poseName={exercise.name} showLabel />
        </div>

        <div>
          <p className="mb-3 text-sm text-text-muted">{exercise.description}</p>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {exercise.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {exercise.demo_video_url && (
            <a
              href={exercise.demo_video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-4 inline-flex text-sm"
            >
              <Play className="h-4 w-4" />
              Watch video
            </a>
          )}
          {showStart && onStart && (
            <button type="button" className="btn-primary mt-4 w-full" onClick={onStart}>
              Start This Exercise
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
