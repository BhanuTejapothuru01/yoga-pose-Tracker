'use client'

import { motion } from 'framer-motion'
import { Camera, LineChart, ListChecks, Scan } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Start camera',
    description: 'Allow webcam access in the browser. Nothing gets uploaded.',
  },
  {
    number: '02',
    icon: ListChecks,
    title: 'Pick an exercise',
    description: 'Choose from fitness moves, yoga poses, or desk stretches.',
  },
  {
    number: '03',
    icon: Scan,
    title: 'Follow the overlay',
    description: 'Skeleton tracking and form tips show up on the video feed.',
  },
  {
    number: '04',
    icon: LineChart,
    title: 'Save the session',
    description: 'Stop when done — reps, time, and accuracy go to your dashboard.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="section-title">How it works</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-[60%] top-8 hidden h-0.5 w-[80%] bg-primary-pale md:block" />
                )}
                <div className="mb-4 text-4xl font-bold text-primary">{step.number}</div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-pale">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
