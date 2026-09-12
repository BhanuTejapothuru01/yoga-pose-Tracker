'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { poseSchema, type PoseFormData } from '@/lib/validations/poseSchema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { YogaPose } from '@/types'

interface PoseFormProps {
  initialData?: YogaPose
  onSubmit: (data: PoseFormData) => Promise<void>
  onCancel: () => void
}

export function PoseForm({ initialData, onSubmit, onCancel }: PoseFormProps) {
  const [saving, setSaving] = useState(false)

  const defaultAngles = initialData?.ideal_angles ?? {
    left_elbow: 175,
    right_elbow: 175,
    left_knee: 175,
    right_knee: 175,
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PoseFormData>({
    resolver: zodResolver(poseSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      difficulty: initialData?.difficulty ?? 'beginner',
      description: initialData?.description ?? '',
      instructions: initialData?.instructions ?? [''],
      ideal_angles: defaultAngles,
    },
  })

  const instructions = watch('instructions') ?? ['']

  const angleEntries = Object.entries(watch('ideal_angles') ?? {})

  const handleFormSubmit = async (data: PoseFormData) => {
    setSaving(true)
    try {
      await onSubmit(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="pose-name">Name</Label>
        <Input id="pose-name" {...register('name')} className="mt-1" />
        {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
      </div>

      <div>
        <Label>Difficulty</Label>
        <Select
          value={watch('difficulty')}
          onValueChange={(v) =>
            setValue('difficulty', v as PoseFormData['difficulty'])
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} className="mt-1" />
      </div>

      <div>
        <Label>Instructions</Label>
        {instructions.map((_, index) => (
          <div key={index} className="mt-2 flex gap-2">
            <Input {...register(`instructions.${index}`)} />
            <button
              type="button"
              onClick={() =>
                setValue(
                  'instructions',
                  instructions.filter((_, i) => i !== index)
                )
              }
              aria-label="Remove instruction"
            >
              <Trash2 className="h-4 w-4 text-error" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setValue('instructions', [...instructions, ''])}
          className="mt-2 flex items-center gap-1 text-sm text-primary"
        >
          <Plus className="h-4 w-4" /> Add instruction
        </button>
      </div>

      <div>
        <Label>Ideal Angles (degrees)</Label>
        <div className="mt-2 space-y-2">
          {angleEntries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-32 text-sm capitalize">{key.replace(/_/g, ' ')}</span>
              <Input
                type="number"
                value={value}
                onChange={(e) =>
                  setValue('ideal_angles', {
                    ...watch('ideal_angles'),
                    [key]: Number(e.target.value),
                  })
                }
                className="w-24"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn-primary flex-1" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {initialData ? 'Update Pose' : 'Create Pose'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  )
}
