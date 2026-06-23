'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnalyticsCards } from '@/components/admin/AnalyticsCards'
import { UserTable } from '@/components/admin/UserTable'
import { Skeleton } from '@/components/ui/skeleton'
import { getAllUsers, getPlatformStats } from '@/services/adminService'
import type { PlatformStats, Profile } from '@/types'

export function AdminDashboardClient() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [users, setUsers] = useState<(Profile & { sessions_count: number })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, usersData] = await Promise.all([
        getPlatformStats(),
        getAllUsers(),
      ])
      setStats(statsData)
      setUsers(usersData)
    } catch {
      setStats(null)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {stats && <AnalyticsCards stats={stats} />}
      <UserTable users={users} onRefresh={fetchData} />
    </div>
  )
}
