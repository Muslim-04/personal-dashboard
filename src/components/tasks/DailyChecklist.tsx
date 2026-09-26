'use client'

import { useState } from 'react'
import { Plus, Settings2, Trash2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { ChecklistItem } from '@/lib/types'
import { todayISO } from '@/lib/format'

export function DailyChecklist({
  items,
  addItem,
  removeItem,
  isDone,
  toggle,
}: {
  items: ChecklistItem[]
  addItem: (label: string) => void
  removeItem: (id: string) => void
  isDone: (date: string, itemId: string) => boolean
  toggle: (date: string, itemId: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const today = todayISO()
  const doneCount = items.filter(i => isDone(today, i.id)).length

  function handleAdd() {
    if (!newLabel.trim()) return
    addItem(newLabel)
    setNewLabel('')
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-200">Режим дня</h2>
          <p className="text-xs text-neutral-500">{doneCount} из {items.length} выполнено сегодня</p>
        </div>
        <button
          onClick={() => setEditing(e => !e)}
          aria-label="Редактировать список"
          className={`rounded-lg p-2 transition-colors ${editing ? 'bg-emerald-500/15 text-emerald-400' : 'text-neutral-500 hover:bg-neutral-800'}`}
        >
          <Settings2 size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {items.map(item => {
          const done = isDone(today, item.id)
          return (
            <div key={item.id} className="flex items-center gap-3">
              <button
                onClick={() => toggle(today, item.id)}
                className={`flex flex-1 items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-colors ${
                  done
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                  done ? 'border-emerald-400 bg-emerald-400 text-neutral-950' : 'border-neutral-600'
                }`}>
                  {done && '✓'}
                </span>
                <span className={done ? 'line-through decoration-emerald-500/50' : ''}>{item.label}</span>
              </button>
              {editing && (
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Удалить пункт"
                  className="shrink-0 rounded-lg p-2 text-neutral-600 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )
        })}

        {items.length === 0 && (
          <p className="py-4 text-center text-sm text-neutral-500">Список пуст — добавьте пункты режима</p>
        )}

        {editing && (
          <div className="mt-1 flex gap-2">
            <Input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Новый пункт режима"
            />
            <Button variant="secondary" onClick={handleAdd} aria-label="Добавить пункт">
              <Plus size={18} />
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)} aria-label="Готово">
              <X size={18} />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
