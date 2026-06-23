import { NextRequest } from 'next/server'
import { apiError, apiSuccess, requireAuth } from '@/lib/api/security'
import { getAllExercises, getExercisesByCategory } from '@/services/exerciseService'
import type { ExerciseCategory } from '@/types'

const VALID_CATEGORIES = [
  'fitness',
  'strength_training',
  'yoga',
  'office_posture',
] as const

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const category = request.nextUrl.searchParams.get('category')

    if (category) {
      if (!VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
        return apiError(new Error('Invalid category'))
      }
      const exercises = await getExercisesByCategory(category as ExerciseCategory)
      return apiSuccess({ exercises })
    }

    const exercises = await getAllExercises()
    return apiSuccess({ exercises })
  } catch (err) {
    return apiError(err)
  }
}
