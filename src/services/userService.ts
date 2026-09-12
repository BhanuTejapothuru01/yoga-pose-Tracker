import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export async function getProfile(userId: string): Promise<Profile> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    handleError(error, 'Failed to fetch profile')
    return data as Profile
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<Profile>
): Promise<Profile> {
  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    handleError(error, 'Failed to update profile')
    return profile as Profile
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    handleError(uploadError, 'Failed to upload avatar')

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)

    await updateProfile(userId, { avatar_url: publicUrl })

    return publicUrl
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}
