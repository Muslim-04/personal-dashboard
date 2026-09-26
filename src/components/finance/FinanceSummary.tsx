'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { FinanceEntry, PERSONAL_LABEL } from '@/lib/types'
import { Period, isInPeriod } from '@/lib/period'
import { formatKzt } from '@/lib/format'

export function FinanceSummary({ entries, period }: { entries: FinanceEntry[]; period: Period }) {
  const filtered = useMemo(() => entries.filter(e => isInPeriod(e.date, period)), [entries, period])

  const { income, expense } = useMemo(() => {
    let income = 0
    let expense = 0
    for (const e of filtered) {
      if (e.type === 'income') income += e.amount
      else expense += e.amount
    }
    return { income, expense }
  }, [filtered])

  const net = income - expense

  const byProject = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()
    for (const e of filtered) {
      const label = e.scope === 'personal' ? PERSONAL_LABEL : e.project
      const row = map.get(label) ?? { income: 0, expense: 0 }
      if (e.type === 'income') row.income += e.amount
      else row.expense += e.amount
      map.set(label, row)
    }
    return Array.from(map.entries())
      .map(([project, v]) => ({ project, ...v, net: v.income - v.expense }))
      .sort((a, b) => b.income + b.expense - (a.income + a.expense))
  }, [filtered])

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <div className="text-xs text-neutral-500">Доход</div>
          <div className="mt-1 text-base font-bold text-emerald-400 md:text-lg">{formatKzt(income)}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs text-neutral-500">Расход</div>
          <div className="mt-1 text-base font-bold text-red-400 md:text-lg">{formatKzt(expense)}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs text-neutral-500">Чистая прибыль</div>
          <div className={`mt-1 text-base font-bold md:text-lg ${net >= 0 ? 'text-neutral-100' : 'text-red-400'}`}>
            {formatKzt(net)}
          </div>
        </Card>
      </div>

      {byProject.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-neutral-200">По проектам и личному</h3>
          <div className="flex flex-col divide-y divide-neutral-800">
            {byProject.map(p => (
              <div key={p.project} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium text-neutral-300">{p.project}</span>
                <span className={p.net >= 0 ? 'font-semibold text-emerald-400' : 'font-semibold text-red-400'}>
                  {formatKzt(p.net)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
