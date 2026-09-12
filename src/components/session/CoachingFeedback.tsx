'use client'

import { memo } from 'react'
import { AlertCircle, CheckCircle, MinusCircle } from 'lucide-react'
import type { FormClassification } from '@/types'
import { cn } from '@/lib/utils'

interface CoachingFeedbackProps {
  feedback: string[]
  accuracy: number
  classification?: FormClassification
}

const CLASSIFICATION_LABELS: Record<FormClassification, string> = {
  correct: 'Correct Form',
  incorrect: 'Incorrect Form',
  needs_adjustment: 'Needs Adjustment',
}

export const CoachingFeedback = memo(function CoachingFeedback({
  feedback,
  accuracy,
  classification = 'needs_adjustment',
}: CoachingFeedbackProps) {
  const latest = feedback[0]

  if (!latest) return null

  const isPositive = classification === 'correct'
  const isIncorrect = classification === 'incorrect'

  return (
    <div className="mt-4 min-h-[60px] space-y-2">
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
          isPositive && 'bg-primary/15 text-primary',
          isIncorrect && 'bg-red-100 text-red-700',
          !isPositive && !isIncorrect && 'bg-amber-100 text-amber-800'
        )}
      >
        {isPositive ? (
          <CheckCircle className="h-3.5 w-3.5" />
        ) : isIncorrect ? (
          <AlertCircle className="h-3.5 w-3.5" />
        ) : (
          <MinusCircle className="h-3.5 w-3.5" />
        )}
        {CLASSIFICATION_LABELS[classification]} · {Math.round(accuracy)}% form score
      </div>
      <div
        className={cn(
          'flex items-start gap-3 rounded-xl border-l-4 p-4 transition-opacity duration-200',
          isPositive ? 'border-primary bg-primary-pale' : isIncorrect ? 'border-red-400 bg-red-50' : 'border-warning bg-amber-50'
        )}
      >
        {isPositive ? (
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        ) : (
          <AlertCircle className={cn('mt-0.5 h-5 w-5 shrink-0', isIncorrect ? 'text-red-600' : 'text-warning')} />
        )}
        <p className="text-sm font-medium text-text-brand">{latest}</p>
      </div>
    </div>
  )
})
