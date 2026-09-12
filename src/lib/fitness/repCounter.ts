import type { PoseLandmark } from '@/types'
import { extractAnglesFromLandmarks } from '@/lib/utils/poseAngles'

export type RepPhase = 'up' | 'down' | 'idle'

export interface RepCounterState {
  reps: number
  phase: RepPhase
  formScore: number
}

const REP_DOWN_ANGLES: Record<string, number> = {
  squat: 95,
  'push-up': 95,
  lunge: 95,
  'bicep-curl': 50,
  'shoulder-press': 90,
}

const REP_UP_ANGLES: Record<string, number> = {
  squat: 155,
  'push-up': 155,
  lunge: 155,
  'bicep-curl': 155,
  'shoulder-press': 165,
}

const REP_ANGLE_KEY: Record<string, string> = {
  squat: 'left_knee',
  'push-up': 'left_elbow',
  lunge: 'front_knee',
  'bicep-curl': 'left_elbow',
  'shoulder-press': 'left_elbow',
}

function getTrackingAngle(slug: string, angles: Record<string, number>): number {
  const key = REP_ANGLE_KEY[slug]
  if (!key) return 180
  return angles[key] ?? 180
}

export function updateRepCounter(
  slug: string,
  landmarks: PoseLandmark[],
  prev: RepCounterState
): RepCounterState {
  const downTarget = REP_DOWN_ANGLES[slug]
  const upTarget = REP_UP_ANGLES[slug]
  if (!downTarget || !upTarget || landmarks.length === 0) {
    return prev
  }

  const angles = extractAnglesFromLandmarks(landmarks)
  const angle = getTrackingAngle(slug, angles)

  let { reps, phase } = prev

  if (phase === 'idle' || phase === 'up') {
    if (angle <= downTarget) {
      phase = 'down'
    }
  } else if (phase === 'down') {
    if (angle >= upTarget) {
      reps += 1
      phase = 'up'
    }
  }

  const mid = (downTarget + upTarget) / 2
  const deviation = Math.abs(angle - mid)
  const formScore = Math.max(0, Math.min(100, 100 - deviation * 1.2))

  return { reps, phase, formScore: Math.round(formScore) }
}

export function isRepBasedExercise(slug: string): boolean {
  return slug in REP_DOWN_ANGLES
}
