'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function Hero() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-primary-pale to-white">
      <div className="float-blob absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary-pale/60 blur-3xl" />
      <div
        className="float-blob absolute -right-16 bottom-32 h-96 w-96 rounded-full bg-primary-light/20 blur-3xl"
        style={{ animationDelay: '2s' }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-primary/25 bg-white/90 px-4 py-1.5 text-sm font-semibold shadow-sm">
            <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
            Webcam + MediaPipe
          </div>

          <h1 className="section-title mb-6">
            Track your form
            <br />
            <span className="text-primary">while you work out</span>
          </h1>

          <p className="mb-8 max-w-lg text-lg text-text-muted">
            Pick an exercise, turn on your camera, and get live feedback on posture,
            reps, and accuracy. Sessions save to your dashboard.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/signup" className="btn-primary">
              Create account
            </Link>
            <button type="button" onClick={scrollToHowItWorks} className="btn-outline">
              How it works
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-gray-400">Session preview</span>
            </div>

            <div className="relative aspect-[4/3] bg-gray-950 p-6">
              <svg viewBox="0 0 200 300" className="mx-auto h-full w-auto" aria-label="Skeleton overlay preview">
                <line x1="100" y1="40" x2="100" y2="90" stroke="#52B788" strokeWidth="2" />
                <line x1="100" y1="90" x2="70" y2="140" stroke="#52B788" strokeWidth="2" />
                <line x1="100" y1="90" x2="130" y2="140" stroke="#52B788" strokeWidth="2" />
                <line x1="70" y1="140" x2="60" y2="200" stroke="#52B788" strokeWidth="2" />
                <line x1="130" y1="140" x2="140" y2="200" stroke="#52B788" strokeWidth="2" />
                <line x1="100" y1="90" x2="100" y2="180" stroke="#52B788" strokeWidth="2" />
                <line x1="100" y1="180" x2="80" y2="260" stroke="#52B788" strokeWidth="2" />
                <line x1="100" y1="180" x2="120" y2="260" stroke="#52B788" strokeWidth="2" />
                {[[100, 40], [100, 90], [70, 140], [130, 140], [60, 200], [140, 200], [100, 180], [80, 260], [120, 260]].map(
                  ([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="5" fill="#52B788" />
                  )
                )}
              </svg>

              <div className="absolute bottom-4 left-4 card-glass px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-text-brand">Live</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
