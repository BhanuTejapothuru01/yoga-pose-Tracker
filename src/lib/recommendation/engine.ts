import type { EquipmentType, Exercise, Profile, UserGoal } from '@/types'

const GOAL_EXERCISE_MAP: Record<UserGoal, string[]> = {
  stay_healthy: ['squat', 'push-up', 'mountain-pose', 'desk-stretch'],
  weight_loss: ['squat', 'lunge', 'push-up', 'warrior-pose'],
  muscle_gain: ['squat', 'shoulder-press', 'bicep-curl', 'push-up'],
  strength_building: ['squat', 'shoulder-press', 'bicep-curl', 'lunge'],
  flexibility: ['tree-pose', 'cobra-pose', 'warrior-pose', 'seated-twist'],
  posture_improvement: ['mountain-pose', 'cobra-pose', 'desk-stretch', 'seated-twist'],
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function hasEquipment(exercise: Exercise, userEquipment: EquipmentType[]): boolean {
  if (!exercise.equipment_required?.length) return true
  return exercise.equipment_required.every((eq) =>
    userEquipment.includes(eq as EquipmentType)
  )
}

function filterByEquipment(exercises: Exercise[], userEquipment: EquipmentType[]): Exercise[] {
  const withMat = userEquipment.includes('yoga_mat')
    ? userEquipment
    : [...userEquipment, 'yoga_mat' as EquipmentType]

  return exercises.filter((ex) => hasEquipment(ex, withMat))
}

function pickWeeklySchedule(exercises: Exercise[], daysPerWeek: number): Map<number, Exercise[]> {
  const schedule = new Map<number, Exercise[]>()
  const workoutDays = daysPerWeek === 7 ? [1, 2, 3, 4, 5, 6, 0] : [1, 3, 5]

  workoutDays.slice(0, daysPerWeek).forEach((day, dayIndex) => {
    const dayExercises: Exercise[] = []
    for (let i = 0; i < Math.min(4, exercises.length); i += 1) {
      dayExercises.push(exercises[(dayIndex + i) % exercises.length])
    }
    schedule.set(day, dayExercises)
  })

  return schedule
}

function daysPerWeekForActivity(level: Profile['activity_level']): number {
  switch (level) {
    case 'sedentary':
      return 3
    case 'light':
      return 3
    case 'moderate':
      return 4
    case 'active':
      return 5
    case 'very_active':
      return 6
    default:
      return 3
  }
}

export interface GeneratedPlan {
  title: string
  goal: UserGoal
  bmi: number | null
  items: Array<{
    exercise: Exercise
    day_of_week: number
    day_name: string
    sets: number
    reps: number
    sort_order: number
  }>
  summary: string
}

export function generateWorkoutPlan(
  profile: Profile,
  allExercises: Exercise[],
  userEquipment: EquipmentType[]
): GeneratedPlan {
  const goal = profile.goal ?? 'stay_healthy'
  const preferredSlugs = GOAL_EXERCISE_MAP[goal]

  let candidates = allExercises.filter((ex) => preferredSlugs.includes(ex.slug))
  if (candidates.length < 3) {
    candidates = allExercises
  }

  candidates = filterByEquipment(candidates, userEquipment)

  if (profile.bmi && profile.bmi >= 30) {
    candidates = candidates.filter((ex) => ex.difficulty !== 'advanced')
  }

  const daysPerWeek = daysPerWeekForActivity(profile.activity_level)
  const schedule = pickWeeklySchedule(candidates, daysPerWeek)

  const items: GeneratedPlan['items'] = []
  schedule.forEach((dayExercises, day) => {
    dayExercises.forEach((exercise, index) => {
      items.push({
        exercise,
        day_of_week: day,
        day_name: DAY_NAMES[day],
        sets: exercise.target_sets,
        reps: exercise.target_reps,
        sort_order: index,
      })
    })
  })

  const title = `${GOAL_LABELS[goal] ?? goal} Plan — ${daysPerWeek} days/week`

  return {
    title,
    goal,
    bmi: profile.bmi,
    items,
    summary: `Personalized for ${profile.name}: BMI ${profile.bmi ?? '—'}, goal "${GOAL_LABELS[goal]}", ${userEquipment.length || 'no'} equipment items selected.`,
  }
}

const GOAL_LABELS: Record<UserGoal, string> = {
  stay_healthy: 'Stay Healthy',
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  strength_building: 'Strength Building',
  flexibility: 'Flexibility',
  posture_improvement: 'Posture Improvement',
}
