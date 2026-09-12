'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface WeeklyChartProps {
  data: { day: string; sessions: number }[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div className="card-glass p-6">
      <h3 className="mb-4 font-semibold text-text-brand">This Week&apos;s Activity</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const count = payload[0].value as number
              return (
                <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow">
                  {count} session{count !== 1 ? 's' : ''} on {label}
                </div>
              )
            }}
          />
          <Bar dataKey="sessions" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
