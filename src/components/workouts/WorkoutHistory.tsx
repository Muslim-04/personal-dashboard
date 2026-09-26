'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { WorkoutSession } from '@/lib/types'
import { formatDate } from '@/lib/format'

const ALL = '__all__'

export function WorkoutHistory({
  sessions,
  onRemove,
}: {
  sessions: WorkoutSession[]
  onRemove: (id: string) => void
}) {
  const [month, setMonth] = useState(ALL)

  const months = useMemo(() => {
    const set = new Set<string>()
    for (const s of sessions) {
      const d = new Date(s.date)
      set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    return Array.from(set).sort().reverse()
  }, [sessions])

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (month === ALL) return true
      const d = new Date(s.date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === month
    })
  }, [sessions, month])

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">История тренировок</h2>
        {months.length > 0 && (
          <Select value={month} onChange={e => setMonth(e.target.value)} className="!w-auto text-xs">
            <option value={ALL}>Все месяцы</option>
            {months.map(m => (
              <option key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </Select>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-500">Тренировок пока нет</p>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800">
          {filtered.map(s => (
            <div key={s.id} className="py-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-semibold text-neutral-200">{s.type}</span>
                  <span className="ml-2 text-xs text-neutral-500">{formatDate(s.date)}</span>
                </div>
                <button
                  onClick={() => onRemove(s.id)}
                  aria-label="Удалить тренировку"
                  className="rounded-lg p-1.5 text-neutral-600 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {s.exercises.map(ex => (
                  <li key={ex.id} className="text-sm text-neutral-400">
                    {ex.name} — {ex.sets}×{ex.reps}{ex.weight ? ` × ${ex.weight} кг` : ''}
                  </li>
                ))}
              </ul>
              {s.notes && <p className="mt-2 text-xs italic text-neutral-500">{s.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
