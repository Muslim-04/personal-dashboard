'use client'

import { FormEvent, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Exercise, WORKOUT_TYPES, WorkoutSession } from '@/lib/types'
import { todayISO } from '@/lib/format'

function emptyExercise(): Exercise {
  return { id: Math.random().toString(36).slice(2), name: '', sets: 3, reps: 10, weight: 0 }
}

export function WorkoutForm({ addSession }: { addSession: (input: Omit<WorkoutSession, 'id' | 'createdAt'>) => void }) {
  const [date, setDate] = useState(todayISO())
  const [type, setType] = useState(WORKOUT_TYPES[0])
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()])
  const [notes, setNotes] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  function updateExercise(id: string, patch: Partial<Exercise>) {
    setExercises(prev => prev.map(ex => (ex.id === id ? { ...ex, ...patch } : ex)))
  }

  function removeExercise(id: string) {
    setExercises(prev => (prev.length > 1 ? prev.filter(ex => ex.id !== id) : prev))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const cleaned = exercises.filter(ex => ex.name.trim())
    if (cleaned.length === 0) return

    addSession({ date, type, exercises: cleaned, notes: notes.trim() })
    setExercises([emptyExercise()])
    setNotes('')
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1800)
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-neutral-200">Новая тренировка</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Дата">
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </Field>
          <Field label="Тип тренировки">
            <Select value={type} onChange={e => setType(e.target.value)}>
              {WORKOUT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-neutral-400">Упражнения</span>
          {exercises.map(ex => (
            <div key={ex.id} className="grid grid-cols-[1fr_56px_56px_64px_auto] items-center gap-2">
              <Input
                value={ex.name}
                onChange={e => updateExercise(ex.id, { name: e.target.value })}
                placeholder="Название"
              />
              <Input type="number" min={0} value={ex.sets}
                onChange={e => updateExercise(ex.id, { sets: Number(e.target.value) })} title="Подходы" />
              <Input type="number" min={0} value={ex.reps}
                onChange={e => updateExercise(ex.id, { reps: Number(e.target.value) })} title="Повторения" />
              <Input type="number" min={0} value={ex.weight}
                onChange={e => updateExercise(ex.id, { weight: Number(e.target.value) })} title="Вес, кг" />
              <button
                type="button"
                onClick={() => removeExercise(ex.id)}
                aria-label="Удалить упражнение"
                className="rounded-lg p-2 text-neutral-600 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_56px_56px_64px_auto] gap-2 text-[10px] text-neutral-600">
            <span>Упражнение</span><span className="text-center">Подх.</span><span className="text-center">Повт.</span><span className="text-center">Вес, кг</span><span />
          </div>
          <Button type="button" variant="secondary" onClick={() => setExercises(prev => [...prev, emptyExercise()])} className="self-start">
            <Plus size={16} /> Добавить упражнение
          </Button>
        </div>

        <Field label="Заметки">
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Как прошла тренировка?" />
        </Field>

        <Button type="submit" className="w-full md:w-auto">
          {justAdded ? '✓ Сохранено' : 'Сохранить тренировку'}
        </Button>
      </form>
    </Card>
  )
}
