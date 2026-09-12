import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseUrl } from '@/lib/supabase/env'

const signupBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('Server configuration error: missing service role key')
  }

  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: Request) {
  try {
    const body = signupBodySchema.parse(await request.json())
    const admin = getAdminClient()

    const { data, error } = await admin.auth.admin.createUser({
      email: body.email.trim().toLowerCase(),
      password: body.password,
      email_confirm: true,
      user_metadata: { name: body.name.trim() },
    })

    if (error) {
      const message =
        error.message.includes('already been registered') ||
        error.message.includes('already exists')
          ? 'This email is already registered. Use a different email or sign in.'
          : error.message

      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ userId: data.user.id })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? 'Invalid signup data' },
        { status: 400 }
      )
    }

    const message = err instanceof Error ? err.message : 'Sign up failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
