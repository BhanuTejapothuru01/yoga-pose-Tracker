'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import {
  equipmentStepSchema,
  goalStepSchema,
  profileStepSchema,
  type EquipmentStepData,
  type GoalStepData,
  type ProfileStepData,
} from '@/lib/validations/onboardingSchema'
import { completeOnboarding } from '@/services/onboardingService'
import {
  ACTIVITY_LABELS,
  EQUIPMENT_LABELS,
  GOAL_LABELS,
  type EquipmentType,
  type UserGoal,
} from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const STEPS = ['Profile', 'Goal', 'Equipment'] as const

export function OnboardingWizard() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>(['yoga_mat'])

  const profileForm = useForm<ProfileStepData>({
    resolver: zodResolver(profileStepSchema),
    defaultValues: { activity_level: 'moderate', gender: 'prefer_not_to_say' },
  })

  const goalForm = useForm<GoalStepData>({
    resolver: zodResolver(goalStepSchema),
    defaultValues: { goal: 'stay_healthy' },
  })

  const equipmentForm = useForm<EquipmentStepData>({
    resolver: zodResolver(equipmentStepSchema),
    defaultValues: { equipment: ['yoga_mat'] },
  })

  const toggleEquipment = (item: EquipmentType) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  const onFinish = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      const profileData = profileForm.getValues()
      const goalData = goalForm.getValues()
      equipmentForm.setValue('equipment', selectedEquipment)

      await completeOnboarding(user.id, profileData, goalData.goal, selectedEquipment)
      await updateProfile({ onboarding_completed: true })
      toast.success('Profile complete! Your personalized plan is ready.')
      router.push('/plan')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Onboarding failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const nextStep = async () => {
    if (step === 0) {
      const valid = await profileForm.trigger()
      if (!valid) return
      setStep(1)
    } else if (step === 1) {
      const valid = await goalForm.trigger()
      if (!valid) return
      setStep(2)
    } else {
      await onFinish()
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="page-heading">Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <p className="mt-2 text-text-muted">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
        <div className="mt-4 flex gap-2">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-primary/20'}`}
            />
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 0 && (
        <form className="space-y-4 panel-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" className="mt-1.5" {...profileForm.register('age', { valueAsNumber: true })} />
              {profileForm.formState.errors.age && (
                <p className="mt-1 text-sm text-error">{profileForm.formState.errors.age.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className="mt-1.5 w-full rounded-lg border-2 border-primary/20 px-3 py-2"
                {...profileForm.register('gender')}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input id="height_cm" type="number" className="mt-1.5" {...profileForm.register('height_cm', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input id="weight_kg" type="number" className="mt-1.5" {...profileForm.register('weight_kg', { valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <Label htmlFor="activity_level">Activity Level</Label>
            <select
              id="activity_level"
              className="mt-1.5 w-full rounded-lg border-2 border-primary/20 px-3 py-2"
              {...profileForm.register('activity_level')}
            >
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.entries(GOAL_LABELS) as [UserGoal, string][]).map(([value, label]) => {
            const selected = goalForm.watch('goal') === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => goalForm.setValue('goal', value)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selected ? 'border-primary bg-primary-pale' : 'border-primary/20 hover:border-primary/50'
                }`}
              >
                <span className="font-semibold text-text-brand">{label}</span>
              </button>
            )
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted">Select equipment you have available:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.entries(EQUIPMENT_LABELS) as [EquipmentType, string][]).map(([value, label]) => {
              const selected = selectedEquipment.includes(value)
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleEquipment(value)}
                  className={`rounded-xl border-2 p-4 text-left ${
                    selected ? 'border-primary bg-primary-pale' : 'border-primary/20'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <button type="button" className="btn-outline flex-1" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button type="button" className="btn-primary flex-1" onClick={nextStep} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {step === 2 ? 'Finish & Get My Plan' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
