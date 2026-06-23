'use client'

import { memo, useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAllExercises } from '@/services/exerciseService'
import { PoseReferenceIllustration } from './PoseReferenceIllustration'
import { CATEGORY_LABELS, type Exercise, type ExerciseCategory } from '@/types'

interface ExerciseSelectorProps {
  selectedExercise: Exercise | null
  onSelect: (exercise: Exercise) => void
  onPreview?: (exercise: Exercise) => void
}

const categories: ExerciseCategory[] = [
  'fitness',
  'strength_training',
  'yoga',
  'office_posture',
]

export const ExerciseSelector = memo(function ExerciseSelector({
  selectedExercise,
  onSelect,
  onPreview,
}: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllExercises()
      .then(setExercises)
      .catch(() => setExercises([]))
      .finally(() => setLoading(false))
  }, [])

  const difficultyColor = {
    beginner: 'bg-primary-pale text-primary',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-600',
  }

  const renderCard = (exercise: Exercise) => {
    const isSelected = selectedExercise?.id === exercise.id
    return (
      <button
        key={exercise.id}
        type="button"
        onClick={() => {
          onSelect(exercise)
          onPreview?.(exercise)
        }}
        className={cn(
          'relative flex w-[140px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border-2 text-left transition-all hover:border-primary',
          isSelected ? 'border-primary bg-primary-pale ring-2 ring-primary/20' : 'border-primary/20 bg-white'
        )}
      >
        {isSelected && <Check className="absolute right-2 top-2 z-10 h-4 w-4 text-primary" />}
        <div className="aspect-[4/5] w-full bg-gray-950">
          <PoseReferenceIllustration poseName={exercise.name} compact showLabel />
        </div>
        <div className="p-2">
          <p className="truncate text-sm font-semibold">{exercise.name}</p>
          <Badge className={cn('mt-1 text-[10px]', difficultyColor[exercise.difficulty])}>
            {exercise.exercise_type === 'rep' ? `${exercise.target_reps} reps` : 'Hold'}
          </Badge>
        </div>
      </button>
    )
  }

  return (
    <div>
      <h2 className="section-heading mb-4 border-b-2 border-primary/20 pb-3">
        Select Exercise
      </h2>

      {loading ? (
        <p className="text-sm text-text-muted">Loading exercises…</p>
      ) : (
        <Tabs defaultValue="fitness">
          <TabsList className="mb-4 flex h-auto w-full flex-wrap gap-1">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="flex-1 text-xs sm:text-sm">
                {CATEGORY_LABELS[cat].split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
                {exercises.filter((e) => e.category === category).map(renderCard)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
})
