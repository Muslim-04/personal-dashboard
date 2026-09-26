'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { FinanceEntry, PERSONAL_LABEL } from '@/lib/types'
import { Period, PERIOD_LABELS, isInPeriod } from '@/lib/period'
import { formatDate, formatKzt } from '@/lib/format'

const ALL = '__all__'

export function FinanceList({
  entries,
  projects,
  period,
  onPeriodChange,
  onRemove,
}: {
  entries: FinanceEntry[]
  projects: string[]
  period: Period
  onPeriodChange: (p: Period) => void
  onRemove: (id: string) => void
}) {
  const [projectFilter, setProjectFilter] = useState(ALL)
  const [typeFilter, setTypeFilter] = useState(ALL)

  const filtered = useMemo(() => {
    return entries
      .filter(e => isInPeriod(e.date, period))
      .filter(e => {
        if (projectFilter === ALL) return true
        if (projectFilter === PERSONAL_LABEL) return e.scope === 'personal'
        return e.project === projectFilter
      })
      .filter(e => typeFilter === ALL || e.type === typeFilter)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }, [entries, period, projectFilter, typeFilter])

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="mr-auto text-sm font-semibold text-neutral-200">Записи</h3>
        <Select value={period} onChange={e => onPeriodChange(e.target.value as Period)} className="!w-auto text-xs">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
          ))}
        </Select>
        <Select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="!w-auto text-xs">
          <option value={ALL}>Все проекты</option>
          {projects.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
          <option value={PERSONAL_LABEL}>{PERSONAL_LABEL}</option>
        </Select>
        <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="!w-auto text-xs">
          <option value={ALL}>Доход и расход</option>
          <option value="income">Доход</option>
          <option value="expense">Расход</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">Записей не найдено</p>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800">
          {filtered.map(e => (
            <div key={e.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-neutral-200">{e.scope === 'personal' ? PERSONAL_LABEL : e.project}</span>
                  <span className="text-xs text-neutral-500">· {e.category}</span>
                </div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  {formatDate(e.date)}{e.comment ? ` · ${e.comment}` : ''}
                </div>
              </div>
              <span className={`shrink-0 text-sm font-bold ${e.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                {e.type === 'income' ? '+' : '-'}{formatKzt(e.amount)}
              </span>
              <button
                onClick={() => onRemove(e.id)}
                aria-label="Удалить запись"
                className="shrink-0 rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
