'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SkeletonCanvas } from './SkeletonCanvas'
import type { PoseLandmark } from '@/types'

interface WebcamModuleProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isActive: boolean
  isLive?: boolean
  error: string | null
  landmarksRef: React.RefObject<PoseLandmark[]>
  onStart: () => void
  onStop: () => void
  children?: React.ReactNode
}

export const WebcamModule = memo(function WebcamModule({
  videoRef,
  isActive,
  isLive = false,
  error,
  landmarksRef,
  onStart,
  onStop,
  children,
}: WebcamModuleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 640, height: 360 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) {
        setSize({ width: Math.round(width), height: Math.round(height) })
      }
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900 ring-2 ring-primary/30 touch-none"
      >
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 z-0 h-full w-full object-cover',
            !isActive && 'invisible'
          )}
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
          autoPlay
          width={1280}
          height={720}
          aria-label="Webcam feed"
        />

        {!isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white/70">
            <Camera className="mb-3 h-12 w-12 sm:h-14 sm:w-14" />
            <p className="text-base sm:text-lg">Tap Start Camera to begin</p>
            <p className="mt-2 max-w-xs text-xs text-white/50">
              Works on phone, tablet, and desktop — allow camera access when prompted.
            </p>
          </div>
        ) : (
          <>
            {isLive && (
              <div className="absolute left-2 top-2 z-10 card-glass px-2 py-1 sm:left-4 sm:top-4 sm:px-3 sm:py-1.5">
                <div className="flex items-center gap-2">
                  <span className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-semibold text-text-brand sm:text-xs">Live</span>
                </div>
              </div>
            )}
            <SkeletonCanvas
              landmarksRef={landmarksRef}
              width={size.width}
              height={size.height}
            />
            {children}
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 px-1 text-center text-xs leading-relaxed text-error sm:text-sm">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-2 text-sm sm:justify-start">
          <span
            className={`h-2 w-2 rounded-full ${isActive ? 'pulse-dot bg-green-500' : 'bg-red-500'}`}
          />
          {isActive ? 'Camera Active' : 'Camera Off'}
        </div>
        <button
          type="button"
          onClick={isActive ? onStop : onStart}
          className="btn-outline min-h-[44px] w-full text-sm sm:w-auto sm:!px-4"
        >
          {isActive ? (
            <>
              <CameraOff className="h-4 w-4" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Start Camera
            </>
          )}
        </button>
      </div>
    </div>
  )
})
