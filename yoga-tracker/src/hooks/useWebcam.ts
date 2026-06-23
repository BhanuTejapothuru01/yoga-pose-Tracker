'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getCameraErrorMessage,
  getFallbackVideoConstraints,
  getVideoConstraints,
  isMobileDevice,
} from '@/lib/device'

export function useWebcam() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const attachStream = useCallback(async (mediaStream: MediaStream) => {
    const video = videoRef.current
    if (!video) return false

    video.srcObject = mediaStream
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')

    try {
      await video.play()
      return true
    } catch {
      try {
        video.muted = true
        await video.play()
        return true
      } catch {
        return false
      }
    }
  }, [])

  useEffect(() => {
    if (!stream || !isActive) return
    void attachStream(stream)
  }, [stream, isActive, attachStream])

  const requestCamera = useCallback(async (constraints: MediaStreamConstraints) => {
    return navigator.mediaDevices.getUserMedia(constraints)
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser. Try Chrome, Safari, or Edge.')
      return
    }

    if (!window.isSecureContext) {
      setError(
        isMobileDevice()
          ? 'Camera needs a secure HTTPS connection. Open the deployed site with https:// or use localhost on this device.'
          : 'Camera requires http://localhost:3000 — do not use a network IP (e.g. 192.x.x.x).'
      )
      return
    }

    try {
      let mediaStream: MediaStream
      try {
        mediaStream = await requestCamera(getVideoConstraints())
      } catch (firstErr) {
        const msg = firstErr instanceof Error ? firstErr.message : ''
        if (msg.includes('Overconstrained') || msg.includes('NotFound')) {
          mediaStream = await requestCamera(getFallbackVideoConstraints())
        } else {
          throw firstErr
        }
      }

      setStream(mediaStream)
      setIsActive(true)
      await attachStream(mediaStream)
    } catch (err) {
      setError(getCameraErrorMessage(err))
      setIsActive(false)
      setStream(null)
    }
  }, [attachStream, requestCamera])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStream(null)
    setIsActive(false)
  }, [stream])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return { stream, isActive, error, videoRef, startCamera, stopCamera }
}
