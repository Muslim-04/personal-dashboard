'use client'

import { useMemo } from 'react'
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { FinanceEntry } from '@/lib/types'
import { formatKzt } from '@/lib/format'

export function FinanceChart({ entries }: { entries: FinanceEntry[] }) {
  const data = useMemo(() => {
    const map = new Map<string, { key: string; label: string; income: number; expense: number }>()
    for (const e of entries) {
      const d = new Date(e.date)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' })
      const row = map.get(key) ?? { key, label, income: 0, expense: 0 }
      if (e.type === 'income') row.income += e.amount
      else row.expense += e.amount
      map.set(key, row)
    }

    // Cumulative total is computed over the *full* history so the line keeps
    // its true running value even once we slice down to the last 12 months.
    const sorted = Array.from(map.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(r => ({ ...r, net: r.income - r.expense }))
    const withCumulative = sorted.map((r, i) => ({
      ...r,
      cumulative: sorted.slice(0, i + 1).reduce((sum, x) => sum + x.net, 0),
    }))

    return withCumulative.slice(-12)
  }, [entries])

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-neutral-200">Динамика прибыли</h3>
        <p className="py-8 text-center text-sm text-neutral-500">Пока нет данных для графика</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">Динамика прибыли</h3>
        <div className="flex items-center gap-3 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />по месяцам</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full bg-amber-400" />нарастающим итогом</span>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="label" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} width={70}
              tickFormatter={v => new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(v)} />
            <Tooltip
              cursor={{ fill: '#27272a' }}
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }}
              labelStyle={{ color: '#e4e4e7' }}
              formatter={(value, name) => [
                formatKzt(Number(value)),
                name === 'cumulative' ? 'Нарастающим итогом' : name === 'net' ? 'За месяц' : String(name),
              ]}
            />
            <Bar dataKey="net" radius={[6, 6, 0, 0]} barSize={28}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.net >= 0 ? '#34d399' : '#f87171'} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="cumulative" stroke="#fbbf24" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
