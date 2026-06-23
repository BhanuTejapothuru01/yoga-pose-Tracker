'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PoseDetector } from '@/lib/mediapipe/poseDetector'
import {
  smoothClassification,
  smoothLandmarks,
  smoothScore,
} from '@/lib/mediapipe/landmarkSmoothing'
import { analyzePosture } from '@/lib/posture/postureEngine'
import { getDetectionIntervalMs, getUiUpdateMs } from '@/lib/device'
import type { FormClassification, PoseLandmark, YogaPose } from '@/types'

interface UsePoseDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  selectedPose: YogaPose | null
  isActive: boolean
}

export interface PoseMetrics {
  accuracy: number
  confidence: number
  feedback: string[]
  classification: FormClassification
  formScore: number
}

function waitForVideoReady(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  timeoutMs = 8000
): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      const video = videoRef.current
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        if (video.paused) void video.play().catch(() => {})
        resolve(video)
        return
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Camera feed not ready. Ensure the camera is running and you are in frame.'))
        return
      }
      requestAnimationFrame(check)
    }
    check()
  })
}

export function usePoseDetection({
  videoRef,
  selectedPose,
  isActive,
}: UsePoseDetectionProps) {
  const landmarksRef = useRef<PoseLandmark[]>([])
  const smoothedLandmarksRef = useRef<PoseLandmark[] | null>(null)
  const selectedPoseRef = useRef(selectedPose)
  const smoothedScoreRef = useRef(0)
  const classificationRef = useRef<FormClassification>('needs_adjustment')

  const [metrics, setMetrics] = useState<PoseMetrics>({
    accuracy: 0,
    confidence: 0,
    feedback: [],
    classification: 'needs_adjustment',
    formScore: 0,
  })
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionError, setDetectionError] = useState<string | null>(null)

  const detectorRef = useRef<PoseDetector | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastUiUpdateRef = useRef(0)
  const lastDetectAtRef = useRef(0)

  useEffect(() => {
    selectedPoseRef.current = selectedPose
  }, [selectedPose])

  const flushMetrics = useCallback((next: PoseMetrics) => {
    setMetrics((prev) => {
      if (
        prev.accuracy === next.accuracy &&
        prev.confidence === next.confidence &&
        prev.feedback[0] === next.feedback[0] &&
        prev.classification === next.classification
      ) {
        return prev
      }
      return next
    })
  }, [])

  const handleResults = useCallback(
    (results: { poseLandmarks?: PoseLandmark[]; poseWorldLandmarks?: PoseLandmark[] }) => {
      const displayLandmarks = results.poseLandmarks
      if (!displayLandmarks?.length) return

      const smoothed = smoothLandmarks(smoothedLandmarksRef.current, displayLandmarks)
      smoothedLandmarksRef.current = smoothed
      landmarksRef.current = smoothed

      const pose = selectedPoseRef.current
      const worldLandmarks = results.poseWorldLandmarks ?? displayLandmarks
      if (!pose) return

      const now = Date.now()
      if (now - lastUiUpdateRef.current < getUiUpdateMs()) return
      lastUiUpdateRef.current = now

      const analysis = analyzePosture(worldLandmarks, pose.ideal_angles, pose.name)
      const formScore = smoothScore(smoothedScoreRef.current, analysis.formScore)
      smoothedScoreRef.current = formScore

      const classification = smoothClassification(
        classificationRef.current,
        analysis.classification,
        formScore
      )
      classificationRef.current = classification

      let visibilitySum = 0
      for (let i = 0; i < worldLandmarks.length; i += 1) {
        visibilitySum += worldLandmarks[i].visibility ?? 1
      }
      const avgVisibility = visibilitySum / worldLandmarks.length

      flushMetrics({
        accuracy: formScore,
        confidence: Math.round(avgVisibility * 100) / 100,
        feedback: analysis.feedback,
        classification,
        formScore,
      })
    },
    [flushMetrics]
  )

  useEffect(() => {
    if (!isActive) {
      landmarksRef.current = []
      smoothedLandmarksRef.current = null
      smoothedScoreRef.current = 0
      classificationRef.current = 'needs_adjustment'
      setIsDetecting(false)
      setDetectionError(null)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    let mounted = true

    const startDetection = async () => {
      setDetectionError(null)
      try {
        await waitForVideoReady(videoRef)
        if (!mounted) return

        const detector = new PoseDetector(handleResults)
        await detector.initialize()
        if (!mounted) {
          detector.destroy()
          return
        }

        detectorRef.current = detector
        setIsDetecting(true)

        const detectInterval = getDetectionIntervalMs()

        const loop = () => {
          if (!mounted || !detectorRef.current) return

          const video = videoRef.current
          if (video && video.readyState >= 2) {
            const now = Date.now()
            if (now - lastDetectAtRef.current >= detectInterval) {
              detectorRef.current.detect(video)
              lastDetectAtRef.current = now
            }
          }

          rafRef.current = requestAnimationFrame(loop)
        }

        rafRef.current = requestAnimationFrame(loop)
      } catch (err) {
        setIsDetecting(false)
        setDetectionError(
          err instanceof Error
            ? err.message
            : 'Failed to load pose detection. Check your network connection.'
        )
      }
    }

    startDetection()

    return () => {
      mounted = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      detectorRef.current?.destroy()
      detectorRef.current = null
      landmarksRef.current = []
      smoothedLandmarksRef.current = null
      setIsDetecting(false)
    }
  }, [isActive, handleResults, videoRef])

  return {
    landmarksRef,
    accuracy: metrics.accuracy,
    confidence: metrics.confidence,
    feedback: metrics.feedback,
    classification: metrics.classification,
    formScore: metrics.formScore,
    isDetecting,
    detectionError,
  }
}
