import { createClient } from '@/lib/supabase/client'
import type { YogaPose } from '@/types'
import type { PoseFormData } from '@/lib/validations/poseSchema'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 }

export async function getAllPoses(): Promise<YogaPose[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('yoga_poses')
      .select('*')
      .order('name')

    handleError(error, 'Failed to fetch poses')

    return ((data ?? []) as YogaPose[]).sort(
      (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
    )
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function createPose(data: PoseFormData): Promise<YogaPose> {
  try {
    const supabase = createClient()
    const { data: pose, error } = await supabase
      .from('yoga_poses')
      .insert({
        ...data,
        keypoints: { landmarks: [11, 12, 13, 14, 23, 24, 25, 26] },
      })
      .select()
      .single()

    handleError(error, 'Failed to create pose')
    return pose as YogaPose
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function updatePose(
  id: string,
  data: Partial<PoseFormData>
): Promise<YogaPose> {
  try {
    const supabase = createClient()
    const { data: pose, error } = await supabase
      .from('yoga_poses')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    handleError(error, 'Failed to update pose')
    return pose as YogaPose
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}

export async function deletePose(id: string): Promise<void> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('yoga_poses').delete().eq('id', id)
    handleError(error, 'Failed to delete pose')
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error('Something went wrong. Please try again.')
  }
}
