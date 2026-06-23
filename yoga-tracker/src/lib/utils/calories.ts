export const POSE_INTENSITY: Record<string, number> = {
  beginner: 1.2,
  intermediate: 1.6,
  advanced: 2.2,
}

export function getPoseIntensity(difficulty: string): number {
  return POSE_INTENSITY[difficulty] ?? 1.2
}

export function calculateCalories(
  durationSeconds: number,
  poseIntensity: number
): number {
  const calories =
    (durationSeconds / 60) * 3.5 * 70 * poseIntensity / 200
  return Math.round(calories * 10) / 10
}
