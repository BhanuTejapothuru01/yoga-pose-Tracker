/** Client-side device helpers for adaptive camera, UI, and pose detection. */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  const mobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const touchNarrow = navigator.maxTouchPoints > 0 && window.innerWidth < 1024
  return mobileUa || touchNarrow
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|Tablet|PlayBook|Silk/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth >= 768 && window.innerWidth < 1024)
}

export function getVideoConstraints(): MediaStreamConstraints {
  const mobile = isMobileDevice()
  const tablet = isTabletDevice()

  if (mobile && !tablet) {
    return {
      video: {
        facingMode: 'user',
        width: { ideal: 640, max: 1280 },
        height: { ideal: 360, max: 720 },
        frameRate: { ideal: 24, max: 30 },
      },
      audio: false,
    }
  }

  if (tablet) {
    return {
      video: {
        facingMode: 'user',
        width: { ideal: 960, max: 1280 },
        height: { ideal: 540, max: 720 },
        frameRate: { ideal: 24, max: 30 },
      },
      audio: false,
    }
  }

  return {
    video: {
      facingMode: 'user',
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 },
    },
    audio: false,
  }
}

export function getFallbackVideoConstraints(): MediaStreamConstraints {
  return {
    video: { facingMode: 'user' },
    audio: false,
  }
}

export function getDetectionIntervalMs(): number {
  if (isMobileDevice()) return 80
  if (isTabletDevice()) return 66
  return 50
}

export function getUiUpdateMs(): number {
  if (isMobileDevice()) return 280
  return 180
}

export function getCanvasDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  const dpr = window.devicePixelRatio || 1
  if (isMobileDevice()) return Math.min(dpr, 1.5)
  return Math.min(dpr, 2)
}

export function getCameraErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)

  if (message.includes('NotAllowedError') || message.includes('Permission')) {
    return isMobileDevice()
      ? 'Camera blocked. Open browser settings → Site settings → allow Camera for this page.'
      : 'Camera permission denied. Allow camera access in browser settings.'
  }
  if (message.includes('NotFoundError')) {
    return 'No camera found on this device.'
  }
  if (message.includes('NotReadableError') || message.includes('TrackStartError')) {
    return 'Camera is in use by another app. Close other apps and try again.'
  }
  if (message.includes('OverconstrainedError')) {
    return 'Camera settings not supported. Retrying with basic mode…'
  }
  if (message.includes('SecurityError') || message.includes('secure')) {
    return isMobileDevice()
      ? 'Camera needs HTTPS. Deploy the app with SSL or use Chrome/Safari on https://your-domain.com'
      : 'Camera requires a secure page. Use http://localhost:3000 (not a network IP).'
  }

  return message || 'Could not access the camera.'
}
