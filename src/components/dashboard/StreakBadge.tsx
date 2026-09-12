'use client'

import { motion } from 'framer-motion'

interface StreakBadgeProps {
  current: number
  best: number
}

export function StreakBadge({ current, best }: StreakBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="card-glass flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 p-6"
    >
      <div>
        <p className="text-2xl font-bold text-text-brand">
          🔥 {current} day streak!
        </p>
        <p className="text-sm text-text-muted">Best: {best} days</p>
      </div>
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-4xl"
      >
        🔥
      </motion.span>
    </motion.div>
  )
}
