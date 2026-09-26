'use client'

import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/Card'
import { FinanceEntry } from '@/lib/types'
import { Period, isInPeriod } from '@/lib/period'
import { formatKzt } from '@/lib/format'

const COLORS = ['#f87171', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6', '#2dd4bf', '#fb923c', '#94a3b8', '#34d399', '#818cf8']

export function FinanceCategoryChart({ entries, period }: { entries: FinanceEntry[]; period: Period }) {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of entries) {
      if (e.type !== 'expense' || !isInPeriod(e.date, period)) continue
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [entries, period])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-neutral-200">Расходы по категориям</h3>
        <p className="py-8 text-center text-sm text-neutral-500">Пока нет расходов за этот период</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-neutral-200">Расходы по категориям</h3>
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
        <div className="h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={2} stroke="none">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }}
                labelStyle={{ color: '#e4e4e7' }}
                formatter={(value) => formatKzt(Number(value))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full flex-col gap-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 truncate text-neutral-300">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
              <span className="shrink-0 font-medium text-neutral-400">
                {formatKzt(d.value)} · {total ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
