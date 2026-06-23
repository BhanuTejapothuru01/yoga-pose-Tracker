import {
  calculatePoseAccuracy,
  extractAnglesFromLandmarks,
  generateFeedback,
} from '@/lib/utils/poseAngles'
import type { FormClassification, PoseLandmark } from '@/types'

const CORRECT_THRESHOLD = 85
const INCORRECT_THRESHOLD = 55

export interface JointValidation {
  joint: string
  ideal: number
  detected: number
  deviation: number
  valid: boolean
}

export interface PostureAnalysis {
  formScore: number
  classification: FormClassification
  jointValidations: JointValidation[]
  feedback: string[]
  isCorrect: boolean
}

export function classifyForm(formScore: number): FormClassification {
  if (formScore >= CORRECT_THRESHOLD) return 'correct'
  if (formScore < INCORRECT_THRESHOLD) return 'incorrect'
  return 'needs_adjustment'
}

export function validateJoints(
  detectedAngles: Record<string, number>,
  idealAngles: Record<string, number>,
  tolerance = 15
): JointValidation[] {
  return Object.entries(idealAngles).map(([joint, ideal]) => {
    const detected = detectedAngles[joint] ?? ideal
    const deviation = Math.abs(detected - ideal)
    return {
      joint,
      ideal,
      detected: Math.round(detected * 10) / 10,
      deviation: Math.round(deviation * 10) / 10,
      valid: deviation <= tolerance,
    }
  })
}

export function analyzePosture(
  landmarks: PoseLandmark[],
  idealAngles: Record<string, number>,
  exerciseName: string
): PostureAnalysis {
  const detectedAngles = extractAnglesFromLandmarks(landmarks)
  const formScore = calculatePoseAccuracy(detectedAngles, idealAngles)
  const classification = classifyForm(formScore)
  const jointValidations = validateJoints(detectedAngles, idealAngles)
  const feedback = generateFeedback(detectedAngles, idealAngles, exerciseName, formScore)

  if (classification === 'incorrect' && !feedback.some((f) => f.includes('Adjust'))) {
    feedback.unshift('Incorrect form — check your joint alignment.')
  }
  if (classification === 'correct' && feedback[0] !== 'Excellent posture! Hold steady.') {
    feedback.unshift('Correct form detected. Keep it up!')
  }

  return {
    formScore,
    classification,
    jointValidations,
    feedback: feedback.slice(0, 3),
    isCorrect: classification === 'correct',
  }
}

export { CORRECT_THRESHOLD, INCORRECT_THRESHOLD }
