'use client'

import { useState } from 'react'
import { Settings2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EditableList } from '@/components/ui/EditableList'
import { FinanceScope, FinanceType } from '@/lib/types'

export function FinanceSettings({
  projects,
  addProject,
  removeProject,
  renameProject,
  categories,
  addCategory,
  removeCategory,
  renameCategory,
}: {
  projects: string[]
  addProject: (name: string) => void
  removeProject: (name: string) => void
  renameProject: (oldName: string, newName: string) => void
  categories: { business: { income: string[]; expense: string[] }; personal: { income: string[]; expense: string[] } }
  addCategory: (scope: FinanceScope, type: FinanceType, name: string) => void
  removeCategory: (scope: FinanceScope, type: FinanceType, name: string) => void
  renameCategory: (scope: FinanceScope, type: FinanceType, oldName: string, newName: string) => void
}) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-200"
      >
        <Settings2 size={16} /> Проекты и категории
      </button>
    )
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">Проекты и категории</h3>
        <button onClick={() => setOpen(false)} aria-label="Закрыть" className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-400">Бизнес</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <EditableList title="Проекты" items={projects} onAdd={addProject} onRemove={removeProject} onRename={renameProject} />
            <EditableList
              title="Категории дохода"
              items={categories.business.income}
              onAdd={n => addCategory('business', 'income', n)}
              onRemove={n => removeCategory('business', 'income', n)}
              onRename={(o, n) => renameCategory('business', 'income', o, n)}
            />
            <EditableList
              title="Категории расхода"
              items={categories.business.expense}
              onAdd={n => addCategory('business', 'expense', n)}
              onRemove={n => removeCategory('business', 'expense', n)}
              onRename={(o, n) => renameCategory('business', 'expense', o, n)}
            />
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-400">Личное</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <EditableList
              title="Категории дохода"
              items={categories.personal.income}
              onAdd={n => addCategory('personal', 'income', n)}
              onRemove={n => removeCategory('personal', 'income', n)}
              onRename={(o, n) => renameCategory('personal', 'income', o, n)}
            />
            <EditableList
              title="Категории расхода"
              items={categories.personal.expense}
              onAdd={n => addCategory('personal', 'expense', n)}
              onRemove={n => removeCategory('personal', 'expense', n)}
              onRename={(o, n) => renameCategory('personal', 'expense', o, n)}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
