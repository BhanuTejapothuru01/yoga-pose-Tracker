import { createClient } from '@/lib/supabase/client'
import type { Exercise, ExerciseCategory } from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    slug: 'squat',
    name: 'Squat',
    category: 'fitness',
    exercise_type: 'rep',
    difficulty: 'beginner',
    description: 'Lower-body compound movement for legs and glutes.',
    instructions: ['Feet shoulder-width apart', 'Chest up, core braced', 'Sit hips back and down', 'Knees track over toes', 'Drive through heels to stand'],
    ideal_angles: { left_knee: 90, right_knee: 90 },
    demo_video_url: null,
    equipment_required: [],
    target_reps: 12,
    target_sets: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-2',
    slug: 'push-up',
    name: 'Push-up',
    category: 'fitness',
    exercise_type: 'rep',
    difficulty: 'beginner',
    description: 'Upper-body pushing exercise for chest, shoulders, and triceps.',
    instructions: ['Hands under shoulders', 'Body in straight line', 'Lower chest toward floor', 'Elbows ~45° from body', 'Push back up'],
    ideal_angles: { left_elbow: 90, right_elbow: 90 },
    demo_video_url: null,
    equipment_required: [],
    target_reps: 10,
    target_sets: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-3',
    slug: 'lunge',
    name: 'Lunge',
    category: 'fitness',
    exercise_type: 'rep',
    difficulty: 'beginner',
    description: 'Single-leg strength and balance exercise.',
    instructions: ['Step one foot forward', 'Lower until front knee ~90°', 'Back knee hovers above floor', 'Torso upright', 'Push back to start'],
    ideal_angles: { front_knee: 90, back_knee: 90 },
    demo_video_url: null,
    equipment_required: [],
    target_reps: 10,
    target_sets: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-4',
    slug: 'bicep-curl',
    name: 'Bicep Curl',
    category: 'strength_training',
    exercise_type: 'rep',
    difficulty: 'beginner',
    description: 'Isolation exercise for biceps using dumbbells or bands.',
    instructions: ['Stand tall, elbows at sides', 'Curl weight up without swinging', 'Squeeze at top', 'Lower with control'],
    ideal_angles: { left_elbow: 40, right_elbow: 40 },
    demo_video_url: null,
    equipment_required: ['dumbbells'],
    target_reps: 12,
    target_sets: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-5',
    slug: 'shoulder-press',
    name: 'Shoulder Press',
    category: 'strength_training',
    exercise_type: 'rep',
    difficulty: 'intermediate',
    description: 'Overhead pressing movement for deltoids and triceps.',
    instructions: ['Start at shoulder height', 'Press weights overhead', 'Full extension without arching back', 'Lower with control'],
    ideal_angles: { left_elbow: 170, right_elbow: 170 },
    demo_video_url: null,
    equipment_required: ['dumbbells'],
    target_reps: 10,
    target_sets: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-6',
    slug: 'mountain-pose',
    name: 'Mountain Pose',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'beginner',
    description: 'Foundational standing pose for posture and balance.',
    instructions: ['Stand with feet together', 'Arms at sides', 'Weight evenly distributed', 'Spine tall', 'Shoulders relaxed'],
    ideal_angles: { left_knee: 175, right_knee: 175 },
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-7',
    slug: 'tree-pose',
    name: 'Tree Pose',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'beginner',
    description: 'Balancing pose that strengthens legs and improves focus.',
    instructions: ['Stand on one leg', 'Place foot on inner thigh', 'Hands in prayer', 'Gaze forward', 'Hold steady'],
    ideal_angles: { standing_knee: 175 },
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-8',
    slug: 'warrior-pose',
    name: 'Warrior I',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'intermediate',
    description: 'Powerful standing pose building strength and stamina.',
    instructions: ['Step into lunge', 'Front knee over ankle', 'Back foot angled', 'Arms overhead', 'Hips square forward'],
    ideal_angles: { front_knee: 90 },
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-9',
    slug: 'warrior-2',
    name: 'Warrior II',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'intermediate',
    description: 'Standing posture expanding hips and chest.',
    instructions: ['Feet wide apart', 'Front knee bent 90 degrees', 'Arms parallel to floor', 'Gaze over front fingers'],
    ideal_angles: { front_knee: 90 },
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-10',
    slug: 'cobra-pose',
    name: 'Cobra Pose',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'beginner',
    description: 'Backbend that strengthens spine and opens the chest.',
    instructions: ['Lie on stomach', 'Hands under shoulders', 'Press up slowly', 'Elbows slightly bent', 'Lift chest'],
    ideal_angles: { left_elbow: 150 },
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-11',
    slug: 'child-pose',
    name: 'Child Pose',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'beginner',
    description: 'Restorative stretch for back, hips, and shoulders.',
    instructions: ['Kneel on mat', 'Sit back on heels', 'Extend arms forward', 'Lower chest and forehead'],
    ideal_angles: {},
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-12',
    slug: 'triangle-pose',
    name: 'Triangle Pose',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'intermediate',
    description: 'Standing side stretch for legs and torso alignment.',
    instructions: ['Feet wide', 'Reach lower arm to shin', 'Reach upper arm to sky', 'Keep legs straight'],
    ideal_angles: {},
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-13',
    slug: 'crow-pose',
    name: 'Crow Pose',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'advanced',
    description: 'Arm balance pose building upper body strength and core control.',
    instructions: ['Squat on mat', 'Place hands shoulder-width', 'Knees on back of triceps', 'Lean forward and lift feet'],
    ideal_angles: {},
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-14',
    slug: 'chair-pose',
    name: 'Chair Pose',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'beginner',
    description: 'Strengthens thighs and core in an isometric sit pose.',
    instructions: ['Feet together', 'Bend knees as if sitting in a chair', 'Raise arms alongside ears'],
    ideal_angles: {},
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-15',
    slug: 'boat-pose',
    name: 'Boat Pose',
    category: 'yoga',
    exercise_type: 'hold',
    difficulty: 'intermediate',
    description: 'V-sit core balance exercise for abdominal strength.',
    instructions: ['Sit on floor', 'Lift legs to 45 degree angle', 'Extend arms parallel to floor', 'Keep spine long'],
    ideal_angles: {},
    demo_video_url: null,
    equipment_required: ['yoga_mat'],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-16',
    slug: 'desk-stretch',
    name: 'Desk Shoulder Stretch',
    category: 'office_posture',
    exercise_type: 'hold',
    difficulty: 'beginner',
    description: 'Office-friendly stretch to relieve shoulder and neck tension.',
    instructions: ['Sit or stand tall', 'Pull shoulder blades together', 'Chin slightly tucked', 'Hold 30 seconds', 'Breathe deeply'],
    ideal_angles: { left_shoulder: 120 },
    demo_video_url: null,
    equipment_required: [],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ex-17',
    slug: 'seated-twist',
    name: 'Seated Spinal Twist',
    category: 'office_posture',
    exercise_type: 'hold',
    difficulty: 'beginner',
    description: 'Gentle twist to improve spinal mobility at your desk.',
    instructions: ['Sit upright in chair', 'Rotate torso slowly', 'Keep hips facing forward', 'Hold each side', 'Breathe steadily'],
    ideal_angles: { left_hip: 90 },
    demo_video_url: null,
    equipment_required: [],
    target_reps: 0,
    target_sets: 1,
    created_at: new Date().toISOString(),
  },
]

export async function getAllExercises(): Promise<Exercise[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('category')
      .order('name')

    if (error || !data || data.length === 0) {
      return DEFAULT_EXERCISES
    }
    return data as Exercise[]
  } catch {
    return DEFAULT_EXERCISES
  }
}

export async function getExercisesByCategory(
  category: ExerciseCategory
): Promise<Exercise[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('category', category)
      .order('name')

    if (error || !data || data.length === 0) {
      return DEFAULT_EXERCISES.filter((e) => e.category === category)
    }
    return data as Exercise[]
  } catch {
    return DEFAULT_EXERCISES.filter((e) => e.category === category)
  }
}

export async function getExerciseBySlug(slug: string): Promise<Exercise | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !data) {
      return DEFAULT_EXERCISES.find((e) => e.slug === slug) ?? null
    }
    return data as Exercise | null
  } catch {
    return DEFAULT_EXERCISES.find((e) => e.slug === slug) ?? null
  }
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
