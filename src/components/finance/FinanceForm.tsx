'use client'

import { FormEvent, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { FinanceEntry, FinanceScope, FinanceType } from '@/lib/types'
import { todayISO } from '@/lib/format'

const NEW_PROJECT_VALUE = '__new__'

export function FinanceForm({
  projects,
  addProject,
  getCategories,
  addEntry,
}: {
  projects: string[]
  addProject: (name: string) => void
  getCategories: (scope: FinanceScope, type: FinanceType) => string[]
  addEntry: (input: Omit<FinanceEntry, 'id' | 'createdAt'>) => void
}) {
  const [scope, setScope] = useState<FinanceScope>('business')
  const [date, setDate] = useState(todayISO())
  const [project, setProject] = useState(projects[0] ?? '')
  const [newProject, setNewProject] = useState('')
  const [type, setType] = useState<FinanceType>('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  const categories = getCategories(scope, type)
  const isAddingProject = project === NEW_PROJECT_VALUE
  const isBusiness = scope === 'business'

  function switchScope(next: FinanceScope) {
    setScope(next)
    setCategory('')
  }

  function switchType(next: FinanceType) {
    setType(next)
    setCategory('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const finalProject = isBusiness ? (isAddingProject ? newProject.trim() : project) : ''
    const numAmount = Number(amount)
    if ((isBusiness && !finalProject) || !category || !numAmount || numAmount <= 0) return

    if (isBusiness && isAddingProject && finalProject) addProject(finalProject)

    addEntry({
      date,
      scope,
      project: finalProject,
      type,
      category,
      amount: numAmount,
      comment: comment.trim(),
    })

    setAmount('')
    setComment('')
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1800)
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-neutral-200">Новая запись</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Сфера">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => switchScope('business')}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isBusiness ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                Бизнес
              </button>
              <button
                type="button"
                onClick={() => switchScope('personal')}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  !isBusiness ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}
              >
                Личное
              </button>
            </div>
          </Field>
        </div>

        <Field label="Дата">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </Field>

        <Field label="Тип">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => switchType('income')}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                type === 'income' ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              Доход
            </button>
            <button
              type="button"
              onClick={() => switchType('expense')}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                type === 'expense' ? 'bg-red-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}
            >
              Расход
            </button>
          </div>
        </Field>

        {isBusiness && (
          <Field label="Проект">
            <Select value={project} onChange={e => setProject(e.target.value)}>
              {projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value={NEW_PROJECT_VALUE}>+ Новый проект…</option>
            </Select>
          </Field>
        )}

        {isBusiness && isAddingProject && (
          <Field label="Название нового проекта">
            <Input value={newProject} onChange={e => setNewProject(e.target.value)} placeholder="Название" required />
          </Field>
        )}

        <Field label="Категория">
          <Select value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="" disabled>Выберите категорию</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>

        <Field label="Сумма, ₸">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            required
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Комментарий">
            <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Необязательно" />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full md:w-auto">
            {justAdded ? '✓ Добавлено' : 'Добавить запись'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
