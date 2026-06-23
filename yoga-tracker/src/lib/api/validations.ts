import { z } from 'zod'

export const createSessionSchema = z.object({
  pose_name: z.string().min(1).max(200),
  exercise_id: z.string().uuid().nullable().optional(),
  category: z
    .enum(['fitness', 'strength_training', 'yoga', 'office_posture'])
    .nullable()
    .optional(),
  exercise_type: z.enum(['hold', 'rep']).optional(),
  duration_seconds: z.number().int().min(0).max(86400),
  accuracy: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  calories_burned: z.number().min(0).max(10000).optional(),
  reps: z.number().int().min(0).max(10000).optional(),
  sets: z.number().int().min(0).max(100).optional(),
  classification: z.enum(['correct', 'incorrect', 'needs_adjustment']).optional(),
  feedback_log: z.array(z.string().max(500)).max(50).optional(),
})

export const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(7),
})

export const equipmentUploadSchema = z.object({
  maxSizeBytes: z.number().default(5 * 1024 * 1024),
  allowedTypes: z
    .array(z.string())
    .default(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
})
