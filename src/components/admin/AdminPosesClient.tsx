'use client'

import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PoseForm } from '@/components/admin/PoseForm'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  createPose,
  deletePose,
  getAllPoses,
  updatePose,
} from '@/services/poseService'
import type { PoseFormData } from '@/lib/validations/poseSchema'
import type { YogaPose } from '@/types'

const difficultyColor = {
  beginner: 'bg-primary-pale text-primary',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-600',
}

export function AdminPosesClient() {
  const [poses, setPoses] = useState<YogaPose[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPose, setEditingPose] = useState<YogaPose | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchPoses = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllPoses()
      setPoses(data)
    } catch {
      setPoses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPoses()
  }, [fetchPoses])

  const handleSubmit = async (data: PoseFormData) => {
    try {
      if (editingPose) {
        await updatePose(editingPose.id, data)
        toast.success('Pose updated')
      } else {
        await createPose(data)
        toast.success('Pose created')
      }
      setDialogOpen(false)
      setEditingPose(null)
      fetchPoses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePose(id)
      toast.success('Pose deleted')
      setDeleteConfirm(null)
      fetchPoses()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  if (loading) {
    return <Skeleton className="h-64 rounded-2xl" />
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-text-brand">Manage Poses</h2>
        <button
          type="button"
          onClick={() => {
            setEditingPose(null)
            setDialogOpen(true)
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add New Pose
        </button>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poses.map((pose) => (
                <TableRow key={pose.id}>
                  <TableCell className="font-medium">{pose.name}</TableCell>
                  <TableCell>
                    <Badge className={difficultyColor[pose.difficulty]}>
                      {pose.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(pose.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPose(pose)
                          setDialogOpen(true)
                        }}
                        aria-label={`Edit ${pose.name}`}
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(pose.id)}
                        aria-label={`Delete ${pose.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPose ? 'Edit Pose' : 'Add New Pose'}</DialogTitle>
          </DialogHeader>
          <PoseForm
            initialData={editingPose ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pose</DialogTitle>
          </DialogHeader>
          <p className="text-text-muted">Are you sure you want to delete this pose?</p>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="btn-primary !bg-error"
            >
              Delete
            </button>
            <button type="button" onClick={() => setDeleteConfirm(null)} className="btn-outline">
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
