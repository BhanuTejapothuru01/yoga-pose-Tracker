'use client'

import { useState } from 'react'
import { getExerciseImage } from '@/lib/exerciseImages'
import { cn } from '@/lib/utils'

interface PoseReferenceIllustrationProps {
  poseName: string
  className?: string
  showLabel?: boolean
  compact?: boolean
}

export function PoseReferenceIllustration({
  poseName,
  className,
  showLabel = false,
  compact = false,
}: PoseReferenceIllustrationProps) {
  const imageUrl = getExerciseImage(poseName)
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-900',
        className
      )}
    >
      {!imgError ? (
        <img
          src={imageUrl}
          alt={poseName}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 p-2 text-center">
          <span className="text-2xl">🧘</span>
          <span className="mt-1 text-xs font-semibold text-slate-300">{poseName}</span>
        </div>
      )}

      {/* Subtle overlay gradient for crisp look */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

      {showLabel && (
        <div className="absolute bottom-1 left-0 right-0 text-center px-1">
          <span
            className={cn(
              'inline-block rounded-md bg-black/60 px-1.5 py-0.5 font-semibold text-white backdrop-blur-sm',
              compact ? 'text-[10px]' : 'text-xs'
            )}
          >
            {poseName}
          </span>
        </div>
      )}
    </div>
  )
}

