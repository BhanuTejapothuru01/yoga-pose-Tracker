import type { PoseLandmark } from '@/types'

const JOINT_LABELS: Record<string, string> = {
  left_elbow: 'left elbow',
  right_elbow: 'right elbow',
  left_knee: 'left knee',
  right_knee: 'right knee',
  left_hip: 'left hip',
  right_hip: 'right hip',
  left_shoulder: 'left shoulder',
  right_shoulder: 'right shoulder',
  front_knee: 'front knee',
  back_knee: 'back knee',
  standing_knee: 'standing knee',
  raised_hip: 'raised hip',
  hip: 'hips',
}

const JOINT_SUGGESTIONS: Record<string, (deviation: number) => string> = {
  left_elbow: (d) => (d > 0 ? 'Bend your left elbow more' : 'Straighten your left elbow'),
  right_elbow: (d) => (d > 0 ? 'Bend your right elbow more' : 'Straighten your right elbow'),
  left_knee: (d) => (d > 0 ? 'Bend your left knee more' : 'Straighten your left knee'),
  right_knee: (d) => (d > 0 ? 'Bend your right knee more' : 'Straighten your right knee'),
  left_hip: (d) => (d > 0 ? 'Open your left hip wider' : 'Close your left hip slightly'),
  right_hip: (d) => (d > 0 ? 'Open your right hip wider' : 'Close your right hip slightly'),
  left_shoulder: (d) => (d > 0 ? 'Raise your left arm higher' : 'Lower your left arm slightly'),
  right_shoulder: (d) => (d > 0 ? 'Raise your right arm higher' : 'Lower your right arm slightly'),
  front_knee: (d) => (d > 0 ? 'Bend your front knee more' : 'Straighten your front knee'),
  back_knee: (d) => (d > 0 ? 'Bend your back knee more' : 'Straighten your back knee'),
  standing_knee: (d) => (d > 0 ? 'Bend your standing knee more' : 'Straighten your standing knee'),
  raised_hip: (d) => (d > 0 ? 'Lift your raised leg higher' : 'Lower your raised leg slightly'),
  hip: (d) => (d > 0 ? 'Open your hips wider' : 'Square your hips forward'),
}

export function calculateAngle(
  a: PoseLandmark,
  b: PoseLandmark,
  c: PoseLandmark
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z }

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z
  const magBa = Math.sqrt(ba.x ** 2 + ba.y ** 2 + ba.z ** 2)
  const magBc = Math.sqrt(bc.x ** 2 + bc.y ** 2 + bc.z ** 2)

  if (magBa === 0 || magBc === 0) return 0

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBa * magBc)))
  return (Math.acos(cosAngle) * 180) / Math.PI
}

export function calculatePoseAccuracy(
  detectedAngles: Record<string, number>,
  idealAngles: Record<string, number>
): number {
  const keys = Object.keys(idealAngles)
  if (keys.length === 0) return 0

  const scores = keys.map((key) => {
    const detected = detectedAngles[key] ?? idealAngles[key]
    const deviation = Math.abs(detected - idealAngles[key])
    return Math.max(0, 100 - deviation * 1.5)
  })

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length
  return Math.round(average * 10) / 10
}

export function generateFeedback(
  detectedAngles: Record<string, number>,
  idealAngles: Record<string, number>,
  poseName: string,
  accuracy?: number
): string[] {
  const feedback: string[] = []
  const poseAccuracy = accuracy ?? calculatePoseAccuracy(detectedAngles, idealAngles)

  for (const [joint, ideal] of Object.entries(idealAngles)) {
    const detected = detectedAngles[joint] ?? ideal
    const deviation = detected - ideal

    if (Math.abs(deviation) > 15) {
      const suggester = JOINT_SUGGESTIONS[joint]
      if (suggester) {
        feedback.push(suggester(deviation))
      } else {
        const label = JOINT_LABELS[joint] ?? joint.replace(/_/g, ' ')
        feedback.push(`Adjust your ${label} alignment`)
      }
    }

    if (feedback.length >= 3) break
  }

  if (poseAccuracy > 90) {
    feedback.unshift('Excellent posture! Hold steady.')
  } else if (feedback.length === 0) {
    feedback.push(`Good form in ${poseName}. Keep breathing steadily.`)
  }

  return feedback.slice(0, 3)
}

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
  [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
]

export function extractAnglesFromLandmarks(
  landmarks: PoseLandmark[]
): Record<string, number> {
  const get = (i: number) => landmarks[i]
  const angles: Record<string, number> = {}

  if (get(11) && get(13) && get(15)) {
    angles.left_elbow = calculateAngle(get(11), get(13), get(15))
  }
  if (get(12) && get(14) && get(16)) {
    angles.right_elbow = calculateAngle(get(12), get(14), get(16))
  }
  if (get(23) && get(25) && get(27)) {
    angles.left_knee = calculateAngle(get(23), get(25), get(27))
  }
  if (get(24) && get(26) && get(28)) {
    angles.right_knee = calculateAngle(get(24), get(26), get(28))
  }
  if (get(11) && get(23) && get(25)) {
    angles.left_hip = calculateAngle(get(11), get(23), get(25))
  }
  if (get(12) && get(24) && get(26)) {
    angles.right_hip = calculateAngle(get(12), get(24), get(26))
  }
  if (get(13) && get(11) && get(23)) {
    angles.left_shoulder = calculateAngle(get(13), get(11), get(23))
  }
  if (get(14) && get(12) && get(24)) {
    angles.right_shoulder = calculateAngle(get(14), get(12), get(24))
  }

  const leftKnee = angles.left_knee ?? 0
  const rightKnee = angles.right_knee ?? 0
  if (leftKnee <= rightKnee) {
    angles.front_knee = leftKnee
    angles.back_knee = rightKnee
    angles.standing_knee = rightKnee
  } else {
    angles.front_knee = rightKnee
    angles.back_knee = leftKnee
    angles.standing_knee = leftKnee
  }

  angles.raised_hip = Math.min(angles.left_hip ?? 180, angles.right_hip ?? 180)
  angles.hip = ((angles.left_hip ?? 0) + (angles.right_hip ?? 0)) / 2

  return angles
}
