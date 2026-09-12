import { createClient } from '@/lib/supabase/client'
import { generateWorkoutPlan } from '@/lib/recommendation/engine'
import { calculateBmi } from '@/lib/validations/onboardingSchema'
import { saveUserEquipment } from '@/services/equipmentService'
import { getAllExercises } from '@/services/exerciseService'
import { saveWorkoutPlan } from '@/services/planService'
import { updateProfile } from '@/services/userService'
import type { ProfileStepData } from '@/lib/validations/onboardingSchema'
import type { EquipmentType, UserGoal } from '@/types'

export async function completeOnboarding(
  userId: string,
  profileData: ProfileStepData,
  goal: UserGoal,
  equipment: EquipmentType[]
) {
  const bmi = calculateBmi(profileData.height_cm, profileData.weight_kg)

  await updateProfile(userId, {
    ...profileData,
    goal,
    bmi,
    onboarding_completed: true,
  })

  await saveUserEquipment(userId, equipment, 'manual')

  const exercises = await getAllExercises()
  const profile = {
    id: userId,
    name: '',
    email: '',
    avatar_url: null,
    role: 'user' as const,
    ...profileData,
    goal,
    bmi,
    onboarding_completed: true,
    created_at: '',
    updated_at: '',
  }

  const plan = generateWorkoutPlan(profile, exercises, equipment)
  await saveWorkoutPlan(userId, plan)

  return plan
}

export async function getOnboardingStatus(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data?.onboarding_completed ?? false
}
