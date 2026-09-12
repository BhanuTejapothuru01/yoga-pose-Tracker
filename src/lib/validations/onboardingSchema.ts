import { z } from 'zod'

export const profileStepSchema = z.object({
  age: z.number().min(13, 'Must be at least 13').max(120, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  height_cm: z.number().min(100, 'Enter height in cm').max(250),
  weight_kg: z.number().min(30, 'Enter weight in kg').max(300),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
})

export const goalStepSchema = z.object({
  goal: z.enum([
    'stay_healthy',
    'weight_loss',
    'muscle_gain',
    'strength_building',
    'flexibility',
    'posture_improvement',
  ]),
})

export const equipmentStepSchema = z.object({
  equipment: z.array(
    z.enum(['dumbbells', 'resistance_bands', 'yoga_mat', 'pull_up_bar', 'bench'])
  ),
})

export type ProfileStepData = z.infer<typeof profileStepSchema>
export type GoalStepData = z.infer<typeof goalStepSchema>
export type EquipmentStepData = z.infer<typeof equipmentStepSchema>

export function calculateBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}
