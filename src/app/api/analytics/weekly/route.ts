import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiError, apiSuccess, requireAuth } from '@/lib/api/security'
import { getWeeklyReports } from '@/services/logService'

const weeklyQuerySchema = z.object({
  weeks: z.coerce.number().int().min(1).max(12).optional().default(4),
})

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const params = weeklyQuerySchema.parse({
      weeks: request.nextUrl.searchParams.get('weeks') ?? 4,
    })
    const reports = await getWeeklyReports(user.id, params.weeks)
    return apiSuccess({ reports })
  } catch (err) {
    return apiError(err)
  }
}
