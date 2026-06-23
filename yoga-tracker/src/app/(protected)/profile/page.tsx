'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar } from '@/services/userService'
import { getSessionStats } from '@/services/sessionService'
import {
  passwordChangeSchema,
  profileSchema,
  type PasswordChangeFormData,
  type ProfileFormData,
} from '@/lib/validations/authSchema'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [totalSessions, setTotalSessions] = useState(0)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '' },
  })

  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  })

  useEffect(() => {
    if (user?.id) {
      getSessionStats(user.id).then((stats) => setTotalSessions(stats.total_sessions))
    }
  }, [user?.id])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const url = await uploadAvatar(user.id, file)
      await updateProfile({ avatar_url: url })
      toast.success('Avatar updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({ name: data.name })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const onPasswordSubmit = async (data: PasswordChangeFormData) => {
    setPasswordError(null)
    setPasswordSuccess(false)
    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: data.currentPassword,
    })

    if (signInError) {
      setPasswordError('Current password is incorrect')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: data.newPassword })
    if (error) {
      setPasswordError(error.message)
      return
    }

    setPasswordSuccess(true)
    passwordForm.reset()
    toast.success('Password updated')
  }

  if (loading || !user) {
    return <Skeleton className="h-96 rounded-2xl" />
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20 md:pb-6">
      <PageHeader title="Profile" description="Manage your account, avatar, and password." />
      <div className="card-glass border-2 border-primary/20 p-8">
        <h2 className="section-heading mb-6 border-b-2 border-primary/15 pb-3">Profile Details</h2>

        <div className="mb-8 flex items-center gap-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative"
            aria-label="Upload avatar"
          >
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-primary-pale text-primary text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-text-muted">Click avatar to upload photo</p>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" className="mt-1.5" {...profileForm.register('name')} />
            {profileForm.formState.errors.name && (
              <p className="mt-1 text-sm text-error">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="mt-1.5 bg-muted"
              title="Email cannot be changed"
            />
            <p className="mt-1 text-xs text-text-muted">Email cannot be changed</p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </form>

        <p className="mt-6 text-sm text-text-muted">
          Member since{' '}
          {new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}{' '}
          · Total sessions: {totalSessions}
        </p>
      </div>

      <div className="card-glass p-8">
        <h2 className="mb-6 text-xl font-semibold">Change Password</h2>

        {passwordError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        )}

        {passwordSuccess && (
          <Alert className="mb-4 border-primary bg-primary-pale">
            <AlertDescription className="text-primary">
              Password updated successfully
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              className="mt-1.5"
              {...passwordForm.register('currentPassword')}
            />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              className="mt-1.5"
              {...passwordForm.register('newPassword')}
            />
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              className="mt-1.5"
              {...passwordForm.register('confirmPassword')}
            />
          </div>
          <button type="submit" className="btn-primary">
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
