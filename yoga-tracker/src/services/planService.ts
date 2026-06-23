import { createClient } from '@/lib/supabase/client'
import type { GeneratedPlan } from '@/lib/recommendation/engine'
import type { WorkoutPlan, WorkoutPlanItem } from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export async function saveWorkoutPlan(
  userId: string,
  plan: GeneratedPlan
): Promise<WorkoutPlan> {
  const supabase = createClient()

  await supabase.from('workout_plans').delete().eq('user_id', userId)

  const { data: savedPlan, error: planError } = await supabase
    .from('workout_plans')
    .insert({
      user_id: userId,
      title: plan.title,
      goal: plan.goal,
      bmi: plan.bmi,
    })
    .select()
    .single()

  handleError(planError, 'Failed to save workout plan')

  const items = plan.items.map((item) => ({
    plan_id: savedPlan.id,
    exercise_id: item.exercise.id,
    day_of_week: item.day_of_week,
    sets: item.sets,
    reps: item.reps,
    sort_order: item.sort_order,
  }))

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('workout_plan_items').insert(items)
    handleError(itemsError, 'Failed to save plan items')
  }

  return savedPlan as WorkoutPlan
}

export async function getUserWorkoutPlan(userId: string): Promise<{
  plan: WorkoutPlan | null
  items: WorkoutPlanItem[]
}> {
  const supabase = createClient()

  const { data: plan, error: planError } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  handleError(planError, 'Failed to fetch workout plan')
  if (!plan) return { plan: null, items: [] }

  const { data: items, error: itemsError } = await supabase
    .from('workout_plan_items')
    .select('*, exercise:exercises(*)')
    .eq('plan_id', plan.id)
    .order('day_of_week')
    .order('sort_order')

  handleError(itemsError, 'Failed to fetch plan items')

  return {
    plan: plan as WorkoutPlan,
    items: (items ?? []) as WorkoutPlanItem[],
  }
}
