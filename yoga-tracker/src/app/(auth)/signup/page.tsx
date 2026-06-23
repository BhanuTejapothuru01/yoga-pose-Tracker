'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { signupSchema, type SignupFormData } from '@/lib/validations/authSchema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignupPage() {
  const { signUp, loading, error, user, signOut } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setSuccessEmail(null)
    try {
      await signUp(data.name, data.email, data.password)
      setSuccessEmail(data.email.trim().toLowerCase())
      reset()
    } catch {
      // Error handled in useAuth
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex">
        <div className="text-xl font-bold">YogaTracker</div>
        <div>
          <h2 className="mb-4 text-3xl font-semibold">Create an account</h2>
          <p className="text-white/80">
            Sign up to save sessions, track progress, and get a workout plan based on your profile.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 block text-xl font-bold text-primary lg:hidden">
            YogaTracker
          </Link>
          <h1 className="mb-2 text-2xl font-extrabold text-text-brand">Create your account</h1>
          <p className="mb-2 font-medium text-text-muted">
            Free forever. Use any email — each account needs a unique address.
          </p>
          <p className="mb-8 text-sm text-text-muted">
            Examples: <span className="font-medium">you@gmail.com</span>,{' '}
            <span className="font-medium">name@outlook.com</span>,{' '}
            <span className="font-medium">student@school.edu</span>
          </p>

          {user && (
            <Alert className="mb-6 border-2 border-primary/30 bg-primary-pale">
              <AlertDescription className="text-sm">
                Signed in as <strong>{user.email}</strong>. Submitting this form
                creates a <strong>new separate account</strong> with a different email.
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="ml-1 font-bold text-primary underline"
                >
                  Sign out instead
                </button>
              </AlertDescription>
            </Alert>
          )}

          {successEmail && (
            <Alert className="mb-6 border-2 border-primary/30 bg-primary-pale">
              <AlertDescription>
                Account created for <strong>{successEmail}</strong>. Redirecting to
                dashboard…
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Jane Doe" className="mt-1.5" {...register('name')} />
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="any.email@example.com"
                className="mt-1.5"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
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

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1.5"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
