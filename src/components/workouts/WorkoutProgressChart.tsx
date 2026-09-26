'use client'

import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { WorkoutSession } from '@/lib/types'
import { formatDate } from '@/lib/format'

export function WorkoutProgressChart({ sessions }: { sessions: WorkoutSession[] }) {
  const exerciseNames = useMemo(() => {
    const set = new Set<string>()
    for (const s of sessions) {
      for (const ex of s.exercises) set.add(ex.name)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'))
  }, [sessions])

  const [selected, setSelected] = useState('')
  const activeExercise = selected || exerciseNames[0] || ''

  const data = useMemo(() => {
    if (!activeExercise) return []
    return sessions
      .filter(s => s.exercises.some(ex => ex.name === activeExercise))
      .map(s => {
        const ex = s.exercises.find(e => e.name === activeExercise)!
        return { date: s.date, label: formatDate(s.date), weight: ex.weight, reps: ex.reps, sets: ex.sets }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [sessions, activeExercise])

  if (exerciseNames.length === 0) {
    return (
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-neutral-200">Прогресс по упражнению</h3>
        <p className="py-8 text-center text-sm text-neutral-500">Добавьте тренировки с упражнениями, чтобы увидеть прогресс</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-200">Прогресс по упражнению</h3>
        <Select value={activeExercise} onChange={e => setSelected(e.target.value)} className="!w-auto text-xs">
          {exerciseNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </Select>
      </div>

      {data.length < 2 ? (
        <p className="py-8 text-center text-sm text-neutral-500">Нужно минимум 2 тренировки с «{activeExercise}», чтобы построить график</p>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }}
                labelStyle={{ color: '#e4e4e7' }}
                formatter={(value, name) => {
                  if (name === 'weight') return [`${value} кг`, 'Вес']
                  if (name === 'reps') return [value, 'Повторения']
                  return [value, String(name)]
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="reps" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />вес, кг</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" />повторения</span>
          </div>
        </div>
      )}
    </Card>
  )
}
