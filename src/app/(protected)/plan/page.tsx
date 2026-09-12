'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { getUserWorkoutPlan } from '@/services/planService'
import { CATEGORY_LABELS, GOAL_LABELS, type WorkoutPlanItem } from '@/types'
import { Badge } from '@/components/ui/badge'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function PlanPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [items, setItems] = useState<WorkoutPlanItem[]>([])

  useEffect(() => {
    if (!user) return
    getUserWorkoutPlan(user.id)
      .then(({ plan, items: planItems }) => {
        setTitle(plan?.title ?? 'No plan yet')
        setItems(planItems)
      })
      .finally(() => setLoading(false))
  }, [user])

  const byDay = items.reduce<Record<number, WorkoutPlanItem[]>>((acc, item) => {
    const list = acc[item.day_of_week] ?? []
    list.push(item)
    acc[item.day_of_week] = list
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-6">
      <PageHeader
        title="Your Workout Plan"
        description="Personalized based on your profile, BMI, goal, and equipment."
      />

      {items.length === 0 ? (
        <div className="panel-card p-6 text-center">
          <p className="text-text-muted">Complete onboarding to generate your plan.</p>
          <Link href="/onboarding" className="btn-primary mt-4 inline-flex">
            Complete Onboarding
          </Link>
        </div>
      ) : (
        <>
          <div className="panel-card p-6">
            <h2 className="section-heading text-lg">{title}</h2>
            {user?.goal && (
              <p className="mt-1 text-sm text-text-muted">
                Goal: {GOAL_LABELS[user.goal]} · BMI: {user.bmi ?? '—'}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(byDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, dayItems]) => (
                <div key={day} className="panel-card p-4">
                  <h3 className="mb-3 font-bold text-primary">{DAY_NAMES[Number(day)]}</h3>
                  <ul className="space-y-3">
                    {dayItems.map((item) => {
                      const ex = item.exercise as WorkoutPlanItem['exercise'] & { name?: string; category?: string; exercise_type?: string }
                      return (
                        <li key={item.id} className="rounded-lg border border-primary/15 p-3">
                          <p className="font-semibold">{ex?.name}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {ex?.category && (
                              <Badge variant="outline" className="text-xs">
                                {CATEGORY_LABELS[ex.category as keyof typeof CATEGORY_LABELS] ?? ex.category}
                              </Badge>
                            )}
                            <span className="text-xs text-text-muted">
                              {ex?.exercise_type === 'rep'
                                ? `${item.sets} sets × ${item.reps} reps`
                                : 'Hold pose'}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
          </div>

          <Link href="/session" className="btn-primary inline-flex w-full justify-center sm:w-auto">
            Start a Session
          </Link>
        </>
      )}
    </div>
  )
}
