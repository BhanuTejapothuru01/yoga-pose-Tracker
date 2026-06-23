'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginFormData } from '@/lib/validations/authSchema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

export default function LoginPage() {
  const { signIn, loading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password)
    } catch {
      // Error handled in useAuth
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between border-r-4 border-primary/30 bg-text-brand p-12 text-white lg:flex">
        <div className="text-xl font-extrabold tracking-tight">YogaTracker</div>
        <div>
          <blockquote className="mb-6 text-2xl font-light leading-relaxed">
            &ldquo;Yoga is the journey of the self, through the self, to the self.&rdquo;
          </blockquote>
          <p className="text-white/60">— The Bhagavad Gita</p>
        </div>
        <div className="flex flex-col items-center gap-6">
          <svg viewBox="0 0 120 200" className="h-48 opacity-60" aria-hidden>
            <circle cx="60" cy="30" r="15" fill="#52B788" />
            <line x1="60" y1="45" x2="60" y2="100" stroke="#52B788" strokeWidth="3" />
            <line x1="60" y1="70" x2="30" y2="90" stroke="#52B788" strokeWidth="3" />
            <line x1="60" y1="70" x2="90" y2="90" stroke="#52B788" strokeWidth="3" />
            <line x1="60" y1="100" x2="40" y2="160" stroke="#52B788" strokeWidth="3" />
            <line x1="60" y1="100" x2="80" y2="160" stroke="#52B788" strokeWidth="3" />
          </svg>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-surface px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="panel-card mx-auto w-full max-w-md p-8">
          <Link href="/" className="mb-8 block text-xl font-extrabold text-primary lg:hidden">
            YogaTracker
          </Link>
          <h1 className="page-heading mb-2">Welcome back</h1>
          <p className="mb-8 font-medium text-text-muted">Sign in to continue your practice</p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1.5"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">
                Remember me
              </Label>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="mt-6 text-center text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Start free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
