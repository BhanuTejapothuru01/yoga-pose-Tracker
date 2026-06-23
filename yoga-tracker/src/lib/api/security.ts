import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiError(401, 'Unauthorized — valid JWT session required')
  }

  return { supabase, user }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function apiError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: err.issues[0]?.message ?? 'Validation failed', issues: err.issues },
      { status: 400 }
    )
  }
  const message = err instanceof Error ? err.message : 'Internal server error'
  console.error('[API]', message)
  return NextResponse.json({ error: message }, { status: 500 })
}

export function sanitizeString(value: string, maxLen = 500): string {
  return value.trim().slice(0, maxLen)
}
