'use client'

import { useCallback, useEffect, useRef } from 'react'

export function useVoiceFeedback(enabled = true) {
  const lastSpokenRef = useRef('')
  const speakingRef = useRef(false)

  const speak = useCallback(
    (text: string, priority = false) => {
      if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return
      if (!text || (text === lastSpokenRef.current && !priority)) return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 0.9

      speakingRef.current = true
      utterance.onend = () => {
        speakingRef.current = false
      }

      lastSpokenRef.current = text
      window.speechSynthesis.speak(utterance)
    },
    [enabled]
  )

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      speakingRef.current = false
    }
  }, [])

  useEffect(() => () => stop(), [stop])

  return { speak, stop, isSpeaking: () => speakingRef.current }
}
