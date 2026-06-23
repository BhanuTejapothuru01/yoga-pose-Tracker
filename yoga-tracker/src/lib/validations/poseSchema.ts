import { z } from 'zod'

export const poseSchema = z.object({
  name: z.string().min(1, 'Pose name is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string().min(1, 'Description is required'),
  instructions: z.array(z.string().min(1)).min(1, 'Add at least one instruction'),
  ideal_angles: z.record(z.string(), z.number()),
})

export type PoseFormData = z.infer<typeof poseSchema>
