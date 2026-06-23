import type { PoseLandmark } from '@/types'

const TASKS_VISION_VERSION = '0.10.21'
const WASM_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

/** ~30 fps — MediaPipe VIDEO mode needs monotonically increasing ms (not video.currentTime). */
const FRAME_MS = 33

type ResultsCallback = (results: {
  poseLandmarks?: PoseLandmark[]
  poseWorldLandmarks?: PoseLandmark[]
}) => void

function toLandmarks(
  points:
    | { x: number; y: number; z: number; visibility?: number; presence?: number }[]
    | undefined
): PoseLandmark[] | undefined {
  if (!points?.length) return undefined
  return points.map((p) => ({
    x: p.x,
    y: p.y,
    z: p.z,
    visibility: p.visibility ?? p.presence ?? 1,
  }))
}

export class PoseDetector {
  private landmarker: import('@mediapipe/tasks-vision').PoseLandmarker | null = null
  private onResultsCallback: ResultsCallback
  /** Webcam streams often keep currentTime at 0 — use our own clock instead. */
  private timestampMs = 0

  constructor(onResults: ResultsCallback) {
    this.onResultsCallback = onResults
  }

  async initialize(): Promise<void> {
    const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision')
    const vision = await FilesetResolver.forVisionTasks(WASM_CDN)

    const options = {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU' as const,
      },
      runningMode: 'VIDEO' as const,
      numPoses: 1,
      minPoseDetectionConfidence: 0.35,
      minPosePresenceConfidence: 0.35,
      minTrackingConfidence: 0.35,
    }

    try {
      this.landmarker = await PoseLandmarker.createFromOptions(vision, options)
    } catch {
      this.landmarker = await PoseLandmarker.createFromOptions(vision, {
        ...options,
        baseOptions: { ...options.baseOptions, delegate: 'CPU' },
      })
    }

    this.timestampMs = 0
  }

  detect(videoElement: HTMLVideoElement): boolean {
    if (!this.landmarker) return false
    if (videoElement.readyState < 2 || videoElement.videoWidth === 0) return false

    this.timestampMs += FRAME_MS

    try {
      const result = this.landmarker.detectForVideo(videoElement, this.timestampMs)

      const poseLandmarks = toLandmarks(result.landmarks[0])
      const poseWorldLandmarks = toLandmarks(result.worldLandmarks[0])

      if (!poseLandmarks?.length && !poseWorldLandmarks?.length) return false

      this.onResultsCallback({
        poseLandmarks,
        poseWorldLandmarks: poseWorldLandmarks ?? poseLandmarks,
      })
      return true
    } catch {
      return false
    }
  }

  destroy(): void {
    this.landmarker?.close()
    this.landmarker = null
    this.timestampMs = 0
  }
}
