'use client'

import { memo, useEffect, useRef } from 'react'
import { POSE_CONNECTIONS } from '@/lib/utils/poseAngles'
import { getCanvasDevicePixelRatio } from '@/lib/device'
import type { PoseLandmark } from '@/types'

interface SkeletonCanvasProps {
  landmarksRef: React.RefObject<PoseLandmark[]>
  width: number
  height: number
}

const JOINT_COLORS = {
  high: '#4DFF91',
  medium: '#FFD166',
  low: '#FF5C5C',
} as const

const BONE_COLOR = '#2DFFAA'
const BONE_OUTLINE = 'rgba(0, 0, 0, 0.65)'

function jointColor(visibility: number) {
  if (visibility > 0.7) return JOINT_COLORS.high
  if (visibility > 0.4) return JOINT_COLORS.medium
  return JOINT_COLORS.low
}

export const SkeletonCanvas = memo(function SkeletonCanvas({
  landmarksRef,
  width,
  height,
}: SkeletonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sizeRef = useRef({ width: 0, height: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let rafId = 0

    const resizeIfNeeded = () => {
      if (sizeRef.current.width === width && sizeRef.current.height === height) return
      const dpr = getCanvasDevicePixelRatio()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { width, height }
    }

    const draw = () => {
      resizeIfNeeded()
      ctx.clearRect(0, 0, width, height)

      const landmarks = landmarksRef.current
      if (landmarks.length === 0) {
        rafId = requestAnimationFrame(draw)
        return
      }

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < POSE_CONNECTIONS.length; i += 1) {
        const [a, b] = POSE_CONNECTIONS[i]
        const p1 = landmarks[a]
        const p2 = landmarks[b]
        if (!p1 || !p2) continue

        const v1 = p1.visibility ?? 0
        const v2 = p2.visibility ?? 0
        if (v1 < 0.15 || v2 < 0.15) continue

        const x1 = p1.x * width
        const y1 = p1.y * height
        const x2 = p2.x * width
        const y2 = p2.y * height

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = BONE_OUTLINE
        ctx.lineWidth = 7
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = BONE_COLOR
        ctx.lineWidth = 4
        ctx.stroke()
      }

      for (let i = 0; i < landmarks.length; i += 1) {
        const landmark = landmarks[i]
        const visibility = landmark.visibility ?? 0
        if (visibility < 0.15) continue

        const x = landmark.x * width
        const y = landmark.y * height
        const fill = jointColor(visibility)

        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)
        ctx.fillStyle = BONE_OUTLINE
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)
        ctx.fillStyle = fill
        ctx.fill()
      }

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [landmarksRef, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
      style={{ transform: 'scaleX(-1)' }}
      aria-hidden
    />
  )
})
