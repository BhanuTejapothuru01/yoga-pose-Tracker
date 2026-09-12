export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type UserGoal =
  | 'stay_healthy'
  | 'weight_loss'
  | 'muscle_gain'
  | 'strength_building'
  | 'flexibility'
  | 'posture_improvement'

export type EquipmentType =
  | 'dumbbells'
  | 'resistance_bands'
  | 'yoga_mat'
  | 'pull_up_bar'
  | 'bench'

export type ExerciseCategory =
  | 'fitness'
  | 'strength_training'
  | 'yoga'
  | 'office_posture'

export type ExerciseType = 'hold' | 'rep'

export type FormClassification = 'correct' | 'incorrect' | 'needs_adjustment'

export interface Profile {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: 'user' | 'admin'
  age: number | null
  gender: Gender | null
  height_cm: number | null
  weight_kg: number | null
  activity_level: ActivityLevel | null
  goal: UserGoal | null
  bmi: number | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface UserEquipment {
  user_id: string
  equipment_type: EquipmentType
  detected_via: 'manual' | 'yolo'
  created_at: string
}

export interface Exercise {
  id: string
  slug: string
  name: string
  category: ExerciseCategory
  exercise_type: ExerciseType
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  instructions: string[]
  ideal_angles: Record<string, number>
  demo_video_url: string | null
  equipment_required: string[]
  target_reps: number
  target_sets: number
  created_at: string
}

export interface WorkoutPlan {
  id: string
  user_id: string
  title: string
  goal: UserGoal
  bmi: number | null
  created_at: string
}

export interface WorkoutPlanItem {
  id: string
  plan_id: string
  exercise_id: string
  day_of_week: number
  sets: number
  reps: number
  sort_order: number
  exercise?: Exercise
}

export interface YogaPose {
  id: string
  name: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
  instructions: string[]
  ideal_angles: Record<string, number>
  keypoints: { landmarks: number[] }
  thumbnail_url: string | null
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  pose_id: string | null
  pose_name: string
  exercise_id: string | null
  category: ExerciseCategory | null
  exercise_type: ExerciseType | null
  duration_seconds: number
  accuracy: number
  confidence: number
  calories_burned: number
  reps: number
  sets: number
  feedback_log: string[]
  created_at: string
}

export interface DashboardStats {
  total_sessions: number
  total_duration_seconds: number
  total_reps: number
  current_streak: number
  best_streak: number
  average_accuracy: number
  best_accuracy: number
}

export interface DailyReport {
  date: string
  sessions: number
  duration_seconds: number
  reps: number
  average_accuracy: number
  exercises: string[]
}

export interface ExerciseLog {
  id: string
  session_id: string
  user_id: string
  exercise_id: string | null
  exercise_name: string
  exercise_slug: string | null
  category: ExerciseCategory | null
  exercise_type: ExerciseType
  reps: number
  sets: number
  form_score: number
  classification: FormClassification
  duration_seconds: number
  feedback_log: string[]
  created_at: string
}

export interface ProgressLog {
  id: string
  user_id: string
  log_date: string
  total_sessions: number
  total_reps: number
  total_duration_seconds: number
  average_form_score: number
  exercises_completed: string[]
  created_at: string
  updated_at: string
}

export interface WeeklyReport {
  week_start: string
  week_end: string
  total_sessions: number
  total_reps: number
  total_duration_seconds: number
  average_form_score: number
  days_active: number
  top_exercises: string[]
}

export interface PoseLandmark {
  x: number
  y: number
  z: number
  visibility: number
}

export interface PlatformStats {
  total_users: number
  total_sessions: number
  avg_accuracy: number
  most_practiced_pose: string
  active_users_today: number
}

export interface PoseAccuracyStat {
  pose_name: string
  sessions_count: number
  avg_accuracy: number
  best_accuracy: number
  last_practiced: string
}

declare global {
  interface Window {
    Pose: new (config: {
      locateFile: (file: string) => string
    }) => MediaPipePoseInstance
  }
}

export interface MediaPipePoseInstance {
  setOptions: (options: Record<string, unknown>) => void
  onResults: (callback: (results: MediaPipeResults) => void) => void
  send: (input: { image: HTMLVideoElement }) => Promise<void>
  close: () => void
}

export interface MediaPipeResults {
  poseLandmarks?: PoseLandmark[]
  poseWorldLandmarks?: PoseLandmark[]
}

export const GOAL_LABELS: Record<UserGoal, string> = {
  stay_healthy: 'Stay Healthy',
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  strength_building: 'Strength Building',
  flexibility: 'Flexibility',
  posture_improvement: 'Posture Improvement',
}

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  dumbbells: 'Dumbbells',
  resistance_bands: 'Resistance Bands',
  yoga_mat: 'Yoga Mat',
  pull_up_bar: 'Pull-up Bar',
  bench: 'Bench',
}

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  fitness: 'Fitness Exercises',
  strength_training: 'Strength Training',
  yoga: 'Yoga',
  office_posture: 'Office Posture Improvement',
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Light (1–3 days/week)',
  moderate: 'Moderate (3–5 days/week)',
  active: 'Active (6–7 days/week)',
  very_active: 'Very Active (athlete / physical job)',
}
