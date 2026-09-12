import { ApiError, apiError, apiSuccess, requireAuth, sanitizeString } from '@/lib/api/security'
import { getExerciseBySlug } from '@/services/exerciseService'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAuth()
    const { slug } = await params
    const safeSlug = sanitizeString(slug, 100)
    const exercise = await getExerciseBySlug(safeSlug)

    if (!exercise) {
      throw new ApiError(404, 'Exercise not found')
    }

    return apiSuccess({ exercise })
  } catch (err) {
    return apiError(err)
  }
}
