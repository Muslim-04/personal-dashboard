'use client'

import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { Input } from './Field'
import { Button } from './Button'

export function EditableList({
  title,
  items,
  onAdd,
  onRemove,
  onRename,
}: {
  title: string
  items: string[]
  onAdd: (name: string) => void
  onRemove: (name: string) => void
  onRename: (oldName: string, newName: string) => void
}) {
  const [newValue, setNewValue] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  function submitAdd() {
    if (!newValue.trim()) return
    onAdd(newValue.trim())
    setNewValue('')
  }

  function startEdit(item: string) {
    setEditing(item)
    setEditValue(item)
  }

  function submitEdit() {
    if (editing && editValue.trim() && editValue.trim() !== editing) {
      onRename(editing, editValue.trim())
    }
    setEditing(null)
  }

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h4>
      <div className="flex flex-col gap-1.5">
        {items.map(item => (
          <div key={item} className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5">
            {editing === item ? (
              <>
                <Input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitEdit()}
                  className="!py-1 text-sm"
                />
                <button onClick={submitEdit} className="shrink-0 rounded-md p-1 text-emerald-400 hover:bg-emerald-500/10">
                  <Check size={15} />
                </button>
                <button onClick={() => setEditing(null)} className="shrink-0 rounded-md p-1 text-neutral-500 hover:bg-neutral-800">
                  <X size={15} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-neutral-200">{item}</span>
                <button onClick={() => startEdit(item)} aria-label="Переименовать" className="shrink-0 rounded-md p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300">
                  <Pencil size={14} />
                </button>
                <button onClick={() => onRemove(item)} aria-label="Удалить" className="shrink-0 rounded-md p-1 text-neutral-600 hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}

        {items.length === 0 && <p className="py-1 text-xs text-neutral-600">Пусто</p>}

        <div className="mt-1 flex gap-2">
          <Input
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitAdd()}
            placeholder="Добавить…"
            className="text-sm"
          />
          <Button type="button" variant="secondary" onClick={submitAdd} aria-label="Добавить">
            <Plus size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
