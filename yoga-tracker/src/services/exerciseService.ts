import { createClient } from '@/lib/supabase/client'
import type { Exercise, ExerciseCategory } from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export async function getAllExercises(): Promise<Exercise[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('category')
    .order('name')

  handleError(error, 'Failed to fetch exercises')
  return (data ?? []) as Exercise[]
}

export async function getExercisesByCategory(
  category: ExerciseCategory
): Promise<Exercise[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('category', category)
    .order('name')

  handleError(error, 'Failed to fetch exercises')
  return (data ?? []) as Exercise[]
}

export async function getExerciseBySlug(slug: string): Promise<Exercise | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  handleError(error, 'Failed to fetch exercise')
  return data as Exercise | null
}

export function exerciseToPoseShape(exercise: Exercise) {
  return {
    id: exercise.id,
    name: exercise.name,
    difficulty: exercise.difficulty,
    description: exercise.description,
    instructions: exercise.instructions,
    ideal_angles: exercise.ideal_angles,
    keypoints: { landmarks: [11, 12, 13, 14, 23, 24, 25, 26] },
    thumbnail_url: null,
    created_at: exercise.created_at,
  }
}
