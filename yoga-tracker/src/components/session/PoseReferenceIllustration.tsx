'use client'

import { POSE_CONNECTIONS } from '@/lib/utils/poseAngles'
import { getReferenceLandmarks } from '@/lib/poseReferenceLandmarks'
import { cn } from '@/lib/utils'

const BONE = '#2DFFAA'
const BONE_OUTLINE = '#0a1f17'
const JOINT = '#4DFF91'
const JOINT_RING = '#0a1f17'
const GUIDE = 'rgba(45, 255, 170, 0.35)'

interface PoseReferenceIllustrationProps {
  poseName: string
  className?: string
  showLabel?: boolean
  compact?: boolean
}

function pt(landmarks: Record<number, { x: number; y: number }>, index: number) {
  const p = landmarks[index]
  if (!p) return null
  return p
}

function line(
  landmarks: Record<number, { x: number; y: number }>,
  a: number,
  b: number,
  key: string,
  width = 3.2
) {
  const p1 = pt(landmarks, a)
  const p2 = pt(landmarks, b)
  if (!p1 || !p2) return null
  return (
    <g key={key}>
      <line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={BONE_OUTLINE}
        strokeWidth={width + 2.2}
        strokeLinecap="round"
      />
      <line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={BONE}
        strokeWidth={width}
        strokeLinecap="round"
      />
    </g>
  )
}

export function PoseReferenceIllustration({
  poseName,
  className,
  showLabel = false,
  compact = false,
}: PoseReferenceIllustrationProps) {
  const landmarks = getReferenceLandmarks(poseName)
  const jointRadius = compact ? 2.6 : 3.4
  const headRadius = compact ? 4 : 5

  const head = pt(landmarks, 0)

  return (
    <svg
      viewBox="0 0 100 125"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={`${poseName} skeleton reference`}
    >
      <defs>
        <radialGradient id="poseRefBg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1a2e24" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>

      <rect width="100" height="125" fill="url(#poseRefBg)" rx="4" />

      {/* Dotted alignment guides */}
      <line x1="50" y1="4" x2="50" y2="121" stroke={GUIDE} strokeWidth="0.6" strokeDasharray="2 3" />
      <line x1="8" y1="90" x2="92" y2="90" stroke={GUIDE} strokeWidth="0.6" strokeDasharray="2 3" />

      {/* Torso midline */}
      {head && pt(landmarks, 23) && pt(landmarks, 24) && (
        <line
          x1={head.x}
          y1={head.y + headRadius}
          x2={(landmarks[23].x + landmarks[24].x) / 2}
          y2={(landmarks[23].y + landmarks[24].y) / 2}
          stroke={GUIDE}
          strokeWidth="0.8"
          strokeDasharray="1.5 2.5"
        />
      )}

      {/* Bones — same connections as live MediaPipe skeleton */}
      {POSE_CONNECTIONS.map(([a, b]) => line(landmarks, a, b, `c-${a}-${b}`))}

      {/* Head-to-shoulders */}
      {head && pt(landmarks, 11) && pt(landmarks, 12) && (
        <>
          {line(landmarks, 0, 11, 'neck-l', 2.4)}
          {line(landmarks, 0, 12, 'neck-r', 2.4)}
        </>
      )}

      {/* Joints */}
      {Object.entries(landmarks).map(([index, point]) => {
        const i = Number(index)
        const r = i === 0 ? headRadius : jointRadius
        return (
          <g key={`j-${index}`}>
            <circle cx={point.x} cy={point.y} r={r + 1.2} fill={JOINT_RING} />
            <circle cx={point.x} cy={point.y} r={r} fill={JOINT} />
          </g>
        )
      })}

      {showLabel && (
        <text
          x="50"
          y="118"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="4.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
        >
          {poseName}
        </text>
      )}
    </svg>
  )
}
