import { apiError, apiSuccess, requireAuth } from '@/lib/api/security'
import { getUserWorkoutPlan } from '@/services/planService'

export async function GET() {
  try {
    const { user } = await requireAuth()
    const plan = await getUserWorkoutPlan(user.id)
    return apiSuccess({ plan })
  } catch (err) {
    return apiError(err)
  }
}
