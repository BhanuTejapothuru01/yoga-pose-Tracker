import type { FormClassification, PoseLandmark } from '@/types'

/** Exponential smoothing factor — lower = smoother skeleton (0.2–0.5) */
const LANDMARK_ALPHA = 0.38
const SCORE_ALPHA = 0.28

export function smoothLandmarks(
  previous: PoseLandmark[] | null,
  next: PoseLandmark[]
): PoseLandmark[] {
  if (!previous?.length || previous.length !== next.length) {
    return next.map((lm) => ({ ...lm }))
  }

  return next.map((lm, i) => {
    const prev = previous[i]
    const visibility = lm.visibility ?? prev.visibility ?? 1
    return {
      x: prev.x + (lm.x - prev.x) * LANDMARK_ALPHA,
      y: prev.y + (lm.y - prev.y) * LANDMARK_ALPHA,
      z: prev.z + (lm.z - prev.z) * LANDMARK_ALPHA,
      visibility,
    }
  })
}

export function smoothScore(previous: number, next: number): number {
  if (previous <= 0) return next
  const value = previous + (next - previous) * SCORE_ALPHA
  return Math.round(value * 10) / 10
}

export function smoothClassification(
  previous: FormClassification,
  next: FormClassification,
  score: number
): FormClassification {
  // Avoid flickering between correct / needs_adjustment on borderline scores
  if (previous === next) return next
  if (score >= 82) return 'correct'
  if (score < 58) return 'incorrect'
  return previous === 'correct' || previous === 'incorrect' ? previous : next
}
