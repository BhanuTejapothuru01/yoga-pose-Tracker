'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'Is my camera video uploaded anywhere?',
    answer:
      'No. Pose detection runs in the browser with MediaPipe. Video stays on your device.',
  },
  {
    question: 'What exercises are supported?',
    answer:
      'Squats, push-ups, lunges, bicep curls, shoulder press, plus yoga holds like Tree, Warrior, Cobra, and Mountain pose. Office stretches are included too.',
  },
  {
    question: 'What do I need to run it?',
    answer: 'A webcam and a modern browser. Chrome or Edge works best on desktop.',
  },
  {
    question: 'How is the form score calculated?',
    answer:
      'The app compares joint angles from your webcam to target angles for the exercise you picked.',
  },
  {
    question: 'Does it work on a phone?',
    answer:
      'Yes, but you need HTTPS in production. Local dev uses localhost on a computer.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-title mb-12 text-center"
        >
          FAQ
        </motion.h2>

        <Accordion className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-text-brand">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-text-muted">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
