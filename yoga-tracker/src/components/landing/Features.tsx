'use client'

import { motion } from 'framer-motion'
import { Camera, MessageCircle, Target, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: 'Live webcam tracking',
    description: 'MediaPipe draws a skeleton on your video and tracks movement in real time.',
  },
  {
    icon: Target,
    title: 'Form scoring',
    description: 'Joint angles are compared to the target pose so you know when form is off.',
  },
  {
    icon: MessageCircle,
    title: 'Voice and on-screen tips',
    description: 'Short cues like “bend your knee more” while you are in the session.',
  },
  {
    icon: TrendingUp,
    title: 'Session history',
    description: 'Dashboard shows streaks, weekly charts, and past workout stats.',
  },
]

export function Features() {
  return (
    <section id="features" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="section-title">What the app does</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-glass border-2 border-primary/20 p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary/20 bg-primary-pale">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-extrabold text-text-brand">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
