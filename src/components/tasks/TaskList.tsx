'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Task, TaskPriority, TaskStatus } from '@/lib/types'
import { formatDate } from '@/lib/format'

const PRIORITY_LABELS: Record<TaskPriority, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-neutral-400 bg-neutral-800',
  medium: 'text-amber-300 bg-amber-500/10',
  high: 'text-red-300 bg-red-500/10',
}
const STATUS_LABELS: Record<TaskStatus, string> = { todo: 'Не начато', in_progress: 'В процессе', done: 'Готово' }

export function TaskList({
  tasks,
  addTask,
  setStatus,
  removeTask,
}: {
  tasks: Task[]
  addTask: (input: Omit<Task, 'id' | 'createdAt' | 'status'>) => void
  setStatus: (id: string, status: TaskStatus) => void
  removeTask: (id: string) => void
}) {
  const [text, setText] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [hideDone, setHideDone] = useState(true)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    addTask({ text: text.trim(), deadline, priority })
    setText('')
    setDeadline('')
  }

  const sorted = useMemo(() => {
    return tasks
      .filter(t => !hideDone || t.status !== 'done')
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'done' ? 1 : -1
        return (a.deadline || '9999').localeCompare(b.deadline || '9999')
      })
  }, [tasks, hideDone])

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold text-neutral-200">Разовые задачи</h2>

      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto_auto]">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="Что нужно сделать?" required />
        <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="md:w-40" />
        <Select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="md:w-36">
          {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map(p => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </Select>
        <Button type="submit">Добавить</Button>
      </form>

      <label className="mb-3 flex items-center gap-2 text-xs text-neutral-500">
        <input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} className="accent-emerald-500" />
        Скрывать завершённые
      </label>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-500">Задач нет</p>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800">
          {sorted.map(t => (
            <div key={t.id} className="flex flex-wrap items-center gap-2 py-3">
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${t.status === 'done' ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                  {t.text}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                  {t.deadline && <span>до {formatDate(t.deadline)}</span>}
                  <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_COLORS[t.priority]}`}>
                    {PRIORITY_LABELS[t.priority]}
                  </span>
                </div>
              </div>
              <Select
                value={t.status}
                onChange={e => setStatus(t.id, e.target.value as TaskStatus)}
                className="!w-auto text-xs"
              >
                {(Object.keys(STATUS_LABELS) as TaskStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </Select>
              <button
                onClick={() => removeTask(t.id)}
                aria-label="Удалить задачу"
                className="rounded-lg p-1.5 text-neutral-600 hover:bg-red-500/10 hover:text-red-400"
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
