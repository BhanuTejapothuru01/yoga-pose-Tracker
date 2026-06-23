'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { getUserEquipment, saveUserEquipment } from '@/services/equipmentService'
import { EQUIPMENT_LABELS, type EquipmentType } from '@/types'

export default function EquipmentPage() {
  const { user } = useAuth()
  const [selected, setSelected] = useState<EquipmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    getUserEquipment(user.id).then(setSelected).finally(() => setLoading(false))
  }, [user])

  const toggle = (item: EquipmentType) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await saveUserEquipment(user.id, selected, 'manual')
      toast.success('Equipment saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-6">
      <PageHeader
        title="Equipment"
        description="Tell the app what you have at home so workout plans can match your setup."
      />

      <div className="panel-card p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.entries(EQUIPMENT_LABELS) as [EquipmentType, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={`rounded-xl border-2 p-4 text-left ${
                selected.includes(value) ? 'border-primary bg-primary-pale' : 'border-primary/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary mt-4 w-full" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
      </div>
    </div>
  )
}
