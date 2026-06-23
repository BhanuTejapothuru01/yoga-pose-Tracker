'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { usePoseDetection } from '@/hooks/usePoseDetection'
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback'
import { POSE_LOCK_ACCURACY } from '@/lib/sessionConstants'
import { isRepBasedExercise, updateRepCounter, type RepCounterState } from '@/lib/fitness/repCounter'
import { exerciseToPoseShape } from '@/services/exerciseService'
import { WebcamModule } from '@/components/session/WebcamModule'
import { MetricsOverlay } from '@/components/session/MetricsOverlay'
import { ExerciseDemoPanel } from '@/components/session/ExerciseDemoPanel'
import { CoachingFeedback } from '@/components/session/CoachingFeedback'
import type { Exercise, PoseLandmark } from '@/types'

interface LiveTrackingPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  cameraActive: boolean
  cameraError: string | null
  selectedExercise: Exercise | null
  sessionActive: boolean
  elapsedSeconds: number
  holdSeconds: number
  setHoldSeconds: React.Dispatch<React.SetStateAction<number>>
  voiceEnabled?: boolean
  onStartCamera: () => void
  onStopCamera: () => void
  onAccuracySample: (accuracy: number) => void
  onConfidenceSample: (confidence: number) => void
  onFeedbackMessage: (message: string) => void
  onRepUpdate?: (reps: number) => void
}

export const LiveTrackingPanel = memo(function LiveTrackingPanel({
  videoRef,
  cameraActive,
  cameraError,
  selectedExercise,
  sessionActive,
  elapsedSeconds,
  holdSeconds,
  setHoldSeconds,
  voiceEnabled = true,
  onStartCamera,
  onStopCamera,
  onAccuracySample,
  onConfidenceSample,
  onFeedbackMessage,
  onRepUpdate,
}: LiveTrackingPanelProps) {
  const detectionActive = cameraActive
  const poseShape = selectedExercise ? exerciseToPoseShape(selectedExercise) : null
  const isRepExercise = selectedExercise ? isRepBasedExercise(selectedExercise.slug) : false

  const { landmarksRef, accuracy, confidence, feedback, classification, formScore, isDetecting, detectionError } =
    usePoseDetection({
      videoRef,
      selectedPose: poseShape,
      isActive: detectionActive,
    })

  const { speak } = useVoiceFeedback(voiceEnabled)
  const lastFeedbackRef = useRef('')
  const accuracyRef = useRef(accuracy)
  const repStateRef = useRef<RepCounterState>({ reps: 0, phase: 'idle', formScore: 0 })
  const [repCount, setRepCount] = useState(0)

  accuracyRef.current = accuracy

  useEffect(() => {
    if (!sessionActive || accuracy <= 0) return
    onAccuracySample(accuracy)
    onConfidenceSample(confidence)
  }, [accuracy, confidence, sessionActive, onAccuracySample, onConfidenceSample])

  useEffect(() => {
    if (!sessionActive || isRepExercise) return
    const interval = setInterval(() => {
      if (accuracyRef.current >= POSE_LOCK_ACCURACY) {
        setHoldSeconds((prev) => prev + 1)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionActive, isRepExercise, setHoldSeconds])

  useEffect(() => {
    if (!sessionActive || isRepExercise) return
    if (accuracy >= POSE_LOCK_ACCURACY) return

    const timer = setTimeout(() => {
      if (accuracyRef.current < POSE_LOCK_ACCURACY) {
        setHoldSeconds(0)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [accuracy, sessionActive, isRepExercise, setHoldSeconds])

  useEffect(() => {
    if (!isRepExercise || !selectedExercise) return
    const interval = setInterval(() => {
      const landmarks = landmarksRef.current as PoseLandmark[]
      if (landmarks.length === 0) return
      const next = updateRepCounter(selectedExercise.slug, landmarks, repStateRef.current)
      repStateRef.current = next
      setRepCount(next.reps)
      onRepUpdate?.(next.reps)
    }, 150)
    return () => clearInterval(interval)
  }, [isRepExercise, selectedExercise, landmarksRef, onRepUpdate])

  useEffect(() => {
    repStateRef.current = { reps: 0, phase: 'idle', formScore: 0 }
    setRepCount(0)
  }, [selectedExercise?.id])

  useEffect(() => {
    const message = feedback[0]
    if (!message || message === lastFeedbackRef.current) return
    lastFeedbackRef.current = message
    onFeedbackMessage(message)
    if (voiceEnabled) speak(message)
  }, [feedback, onFeedbackMessage, speak, voiceEnabled])

  useEffect(() => {
    if (!voiceEnabled || !sessionActive || !isRepExercise) return
    if (repCount > 0 && repCount % 5 === 0) {
      speak(`${repCount} reps completed`, true)
    }
  }, [repCount, sessionActive, isRepExercise, speak, voiceEnabled])

  const poseLocked = sessionActive && !isRepExercise && accuracy >= POSE_LOCK_ACCURACY

  return (
    <div className="space-y-4">
      <WebcamModule
        videoRef={videoRef}
        isActive={cameraActive}
        isLive={cameraActive && isDetecting}
        error={cameraError ?? detectionError}
        landmarksRef={landmarksRef}
        onStart={onStartCamera}
        onStop={onStopCamera}
      >
        {selectedExercise && !sessionActive && (
          <ExerciseDemoPanel exercise={selectedExercise} variant="overlay" />
        )}
        {detectionActive && sessionActive && (
          <MetricsOverlay
            accuracy={accuracy}
            confidence={confidence}
            holdSeconds={holdSeconds}
            sessionSeconds={elapsedSeconds}
            poseLocked={poseLocked}
            lockThreshold={POSE_LOCK_ACCURACY}
            reps={repCount}
            showReps={isRepExercise}
            formScore={formScore}
            classification={classification}
          />
        )}
      </WebcamModule>

      {cameraActive && !selectedExercise && (
        <p className="text-center text-sm text-text-muted">
          Select an exercise below to start live AI tracking.
        </p>
      )}
      {cameraActive && selectedExercise && !sessionActive && (
        <p className="text-center text-sm text-primary">
          Review the demo on the video, then click Start Session when ready.
        </p>
      )}
      <CoachingFeedback feedback={feedback} accuracy={accuracy} classification={classification} />
    </div>
  )
})
