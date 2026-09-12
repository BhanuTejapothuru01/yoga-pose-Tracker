'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Volume2, VolumeX } from 'lucide-react'
import { useWebcam } from '@/hooks/useWebcam'
import { useSession } from '@/hooks/useSession'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { LiveTrackingPanel } from '@/components/session/LiveTrackingPanel'
import { ExerciseSelector } from '@/components/session/ExerciseSelector'
import { SessionSummary } from '@/components/session/SessionSummary'
import { calculateCalories, getPoseIntensity } from '@/lib/utils/calories'
import { classifyForm } from '@/lib/posture/postureEngine'
import type { Exercise } from '@/types'

export function SessionClient() {
  const router = useRouter()
  const { user } = useAuth()
  const { videoRef, isActive: cameraActive, error: cameraError, startCamera, stopCamera } = useWebcam()
  const {
    isActive: sessionActive,
    elapsedSeconds,
    holdSeconds,
    setHoldSeconds,
    startSession,
    stopSession,
    saveSession,
    resetSession,
  } = useSession()

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [saving, setSaving] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [avgAccuracy, setAvgAccuracy] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [repCount, setRepCount] = useState(0)
  const [feedbackLog, setFeedbackLog] = useState<string[]>([])
  const accuracySumRef = useRef(0)
  const accuracyCountRef = useRef(0)
  const lastAccuracySampleRef = useRef(0)

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise)
  }, [])

  const handleStartSession = useCallback(() => {
    if (!selectedExercise || !cameraActive) return
    accuracySumRef.current = 0
    accuracyCountRef.current = 0
    lastAccuracySampleRef.current = 0
    setRepCount(0)
    setFeedbackLog([])
    startSession()
  }, [selectedExercise, cameraActive, startSession])

  const handleStopSession = useCallback(() => {
    stopSession()
    const avg =
      accuracyCountRef.current > 0
        ? Math.round((accuracySumRef.current / accuracyCountRef.current) * 10) / 10
        : 0
    setAvgAccuracy(avg)
    setShowSummary(true)
  }, [stopSession])

  const handleAccuracySample = useCallback(
    (accuracy: number) => {
      if (!sessionActive || accuracy <= 0) return
      if (Date.now() - lastAccuracySampleRef.current < 500) return
      lastAccuracySampleRef.current = Date.now()
      accuracySumRef.current += accuracy
      accuracyCountRef.current += 1
    },
    [sessionActive]
  )

  const handleConfidenceSample = useCallback((value: number) => {
    setConfidence(value)
  }, [])

  const handleFeedbackMessage = useCallback((message: string) => {
    setFeedbackLog((prev) => [message, ...prev].slice(0, 20))
  }, [])

  const handleRepUpdate = useCallback((reps: number) => {
    setRepCount(reps)
  }, [])

  const handleSave = useCallback(async () => {
    if (!user || !selectedExercise) return
    setSaving(true)
    try {
      const intensity = getPoseIntensity(selectedExercise.difficulty)
      const calories = calculateCalories(elapsedSeconds, intensity)

      await saveSession({
        user_id: user.id,
        pose_id: null,
        pose_name: selectedExercise.name,
        exercise_id: selectedExercise.id,
        exercise_slug: selectedExercise.slug,
        category: selectedExercise.category,
        exercise_type: selectedExercise.exercise_type,
        duration_seconds: elapsedSeconds,
        accuracy: avgAccuracy,
        confidence,
        calories_burned: calories,
        reps: repCount,
        sets: selectedExercise.target_sets,
        feedback_log: feedbackLog,
        classification: classifyForm(avgAccuracy),
      })

      toast.success('Session saved successfully!')
      resetSession()
      setShowSummary(false)
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save session')
    } finally {
      setSaving(false)
    }
  }, [user, selectedExercise, elapsedSeconds, avgAccuracy, confidence, repCount, feedbackLog, saveSession, resetSession, router])

  const handleDiscard = useCallback(() => {
    setShowSummary(false)
    resetSession()
    setSelectedExercise(null)
    setFeedbackLog([])
  }, [resetSession])

  const formatTimer = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const calories = selectedExercise
    ? calculateCalories(elapsedSeconds, getPoseIntensity(selectedExercise.difficulty))
    : 0

  return (
    <div className="space-y-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Workout Session"
          description="Real-time posture analysis with voice & visual feedback."
        />
        <button
          type="button"
          className="btn-outline !py-2 !px-3 text-sm"
          onClick={() => setVoiceEnabled((v) => !v)}
          aria-label={voiceEnabled ? 'Mute voice feedback' : 'Enable voice feedback'}
        >
          {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          Voice {voiceEnabled ? 'On' : 'Off'}
        </button>
      </div>

      <LiveTrackingPanel
        videoRef={videoRef}
        cameraActive={cameraActive}
        cameraError={cameraError}
        selectedExercise={selectedExercise}
        sessionActive={sessionActive}
        elapsedSeconds={elapsedSeconds}
        holdSeconds={holdSeconds}
        setHoldSeconds={setHoldSeconds}
        voiceEnabled={voiceEnabled}
        onStartCamera={startCamera}
        onStopCamera={stopCamera}
        onAccuracySample={handleAccuracySample}
        onConfidenceSample={handleConfidenceSample}
        onFeedbackMessage={handleFeedbackMessage}
        onRepUpdate={handleRepUpdate}
      />

      <div className="card-glass flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Session timer
          </p>
          <p className="text-4xl font-bold tabular-nums text-text-brand">
            {formatTimer(elapsedSeconds)}
          </p>
          {selectedExercise?.exercise_type === 'rep' && sessionActive && (
            <p className="mt-1 text-sm font-semibold text-primary">{repCount} reps</p>
          )}
        </div>

        {!sessionActive ? (
          <button
            type="button"
            onClick={handleStartSession}
            disabled={!selectedExercise || !cameraActive}
            className="btn-primary w-full sm:w-auto sm:min-w-[200px]"
          >
            Start Session
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStopSession}
            className="btn-outline w-full !border-error !text-error hover:!bg-red-50 sm:w-auto sm:min-w-[200px]"
          >
            Stop & Save
          </button>
        )}
      </div>

      <ExerciseSelector
        selectedExercise={selectedExercise}
        onSelect={handleSelectExercise}
      />

      <SessionSummary
        open={showSummary}
        exercise={selectedExercise}
        durationSeconds={elapsedSeconds}
        averageAccuracy={avgAccuracy}
        caloriesBurned={calories}
        reps={repCount}
        saving={saving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  )
}
