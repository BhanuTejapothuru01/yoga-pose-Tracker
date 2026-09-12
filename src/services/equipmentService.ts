import { createClient } from '@/lib/supabase/client'
import type { EquipmentType, UserEquipment } from '@/types'

function handleError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback)
}

export async function getUserEquipment(userId: string): Promise<EquipmentType[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_equipment')
    .select('equipment_type')
    .eq('user_id', userId)

  handleError(error, 'Failed to fetch equipment')
  return (data ?? []).map((row) => row.equipment_type as EquipmentType)
}

export async function saveUserEquipment(
  userId: string,
  equipment: EquipmentType[],
  detectedVia: 'manual' | 'yolo' = 'manual'
): Promise<void> {
  const supabase = createClient()

  const { error: deleteError } = await supabase
    .from('user_equipment')
    .delete()
    .eq('user_id', userId)

  handleError(deleteError, 'Failed to update equipment')

  if (equipment.length === 0) return

  const rows: Omit<UserEquipment, 'created_at'>[] = equipment.map((equipment_type) => ({
    user_id: userId,
    equipment_type,
    detected_via: detectedVia,
  }))

  const { error } = await supabase.from('user_equipment').insert(rows)
  handleError(error, 'Failed to save equipment')
}
