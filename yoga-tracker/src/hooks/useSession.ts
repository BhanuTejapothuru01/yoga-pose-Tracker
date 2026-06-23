'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createSession,
  updateUserStreak,
} from '@/services/sessionService'
import type { ExerciseCategory, ExerciseType, FormClassification, Session } from '@/types'

interface SaveSessionData {
  user_id: string
  pose_id: string | null
  pose_name: string
  exercise_id: string | null
  exercise_slug?: string
  category: ExerciseCategory | null
  exercise_type: ExerciseType
  duration_seconds: number
  accuracy: number
  confidence: number
  calories_burned: number
  reps: number
  sets: number
  feedback_log: string[]
  classification?: FormClassification
}

export function useSession() {
  const [isActive, setIsActive] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [holdSeconds, setHoldSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startSession = useCallback(() => {
    setStartTime(Date.now())
    setElapsedSeconds(0)
    setHoldSeconds(0)
    setIsActive(true)
  }, [])

  const stopSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsActive(false)
    return elapsedSeconds
  }, [elapsedSeconds])

  const resetSession = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsActive(false)
    setStartTime(null)
    setElapsedSeconds(0)
    setHoldSeconds(0)
  }, [])

  const saveSession = useCallback(
    async (sessionData: SaveSessionData): Promise<Session> => {
      const session = await createSession(sessionData, {
        exercise_slug: sessionData.exercise_slug,
        classification: sessionData.classification,
      })
      await updateUserStreak(sessionData.user_id)
      return session
    },
    []
  )

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  return {
    isActive,
    startTime,
    elapsedSeconds,
    holdSeconds,
    setHoldSeconds,
    startSession,
    stopSession,
    saveSession,
    resetSession,
  }
}
