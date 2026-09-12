'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { updateUserRole } from '@/services/adminService'
import type { Profile } from '@/types'

interface UserTableProps {
  users: (Profile & { sessions_count: number })[]
  onRefresh: () => void
}

export function UserTable({ users, onRefresh }: UserTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    setUpdating(userId)
    try {
      await updateUserRole(userId, role)
      toast.success('User role updated')
      onRefresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setUpdating(null)
    }
  }

  if (users.length === 0) {
    return (
      <div className="card-glass p-8 text-center text-text-muted">
        No users found
      </div>
    )
  }

  return (
    <div className="card-glass overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const initials = user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.sessions_count}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as 'user' | 'admin')
                      }
                      disabled={updating === user.id}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
