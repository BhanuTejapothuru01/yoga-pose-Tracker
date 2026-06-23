import { NextRequest } from 'next/server'
import { apiError, apiSuccess, requireAuth } from '@/lib/api/security'
import { analyticsQuerySchema } from '@/lib/api/validations'
import { getDailyReports } from '@/services/analyticsService'

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    const params = analyticsQuerySchema.parse({
      days: request.nextUrl.searchParams.get('days') ?? 7,
    })
    const reports = await getDailyReports(user.id, params.days)
    return apiSuccess({ reports })
  } catch (err) {
    return apiError(err)
  }
}
