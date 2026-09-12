'use client'

import {
  Area,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface AccuracyChartProps {
  data: { pose: string; accuracy: number }[]
}

export function AccuracyChart({ data }: AccuracyChartProps) {
  return (
    <div className="card-glass p-6">
      <h3 className="mb-4 font-semibold text-text-brand">Accuracy Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8F3DC" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#D8F3DC" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="pose" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-lg border bg-white px-3 py-2 text-sm shadow">
                  Accuracy: {payload[0].value}%
                </div>
              )
            }}
          />
          <Area type="monotone" dataKey="accuracy" fill="url(#accuracyFill)" stroke="none" />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#2D6A4F"
            strokeWidth={2}
            dot={{ fill: '#2D6A4F', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
