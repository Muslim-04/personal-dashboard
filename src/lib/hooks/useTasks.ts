'use client'

import { useCallback } from 'react'
import { useLocalState } from '../useLocalState'
import { syncToSheet } from '../sheetSync'
import { ChecklistItem, DEFAULT_CHECKLIST, Task, TaskStatus } from '../types'
import { todayISO } from '../format'

const CHECKLIST_KEY = 'pd:tasks:checklist'
const COMPLETIONS_KEY = 'pd:tasks:completions' // Record<dateISO, itemId[]>
const TASKS_KEY = 'pd:tasks:items'

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useChecklist() {
  const [items, setItems, hydrated] = useLocalState<ChecklistItem[]>(CHECKLIST_KEY, DEFAULT_CHECKLIST)

  const addItem = useCallback((label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    setItems(prev => [...prev, { id: makeId(), label: trimmed }])
  }, [setItems])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [setItems])

  const renameItem = useCallback((id: string, label: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, label } : i)))
  }, [setItems])

  return { items, addItem, removeItem, renameItem, hydrated }
}

export function useChecklistCompletions() {
  const [completions, setCompletions, hydrated] = useLocalState<Record<string, string[]>>(COMPLETIONS_KEY, {})

  const isDone = useCallback((date: string, itemId: string) => {
    return (completions[date] ?? []).includes(itemId)
  }, [completions])

  const toggle = useCallback((date: string, itemId: string) => {
    setCompletions(prev => {
      const day = prev[date] ?? []
      const next = day.includes(itemId) ? day.filter(id => id !== itemId) : [...day, itemId]
      const updated = { ...prev, [date]: next }
      syncToSheet('Tasks', 'upsert', { kind: 'checklist', date, completedItemIds: next })
      return updated
    })
  }, [setCompletions])

  /** Total checklist ticks across the last N days (inclusive of today). */
  const countInLastDays = useCallback((days: number) => {
    let total = 0
    const now = new Date()
    for (let i = 0; i < days; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      total += (completions[key] ?? []).length
    }
    return total
  }, [completions])

  return { completions, isDone, toggle, countInLastDays, hydrated }
}

export function useTasks() {
  const [tasks, setTasks, hydrated] = useLocalState<Task[]>(TASKS_KEY, [])

  const addTask = useCallback((input: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const task: Task = { ...input, id: makeId(), status: 'todo', createdAt: new Date().toISOString() }
    setTasks(prev => [task, ...prev])
    syncToSheet('Tasks', 'upsert', { kind: 'task', ...task })
    return task
  }, [setTasks])

  const setStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === id
          ? { ...t, status, completedAt: status === 'done' ? todayISO() : undefined }
          : t
      )
      const updated = next.find(t => t.id === id)
      if (updated) syncToSheet('Tasks', 'upsert', { kind: 'task', ...updated })
      return next
    })
  }, [setTasks])

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    syncToSheet('Tasks', 'delete', { kind: 'task', id })
  }, [setTasks])

  /** One-off tasks marked done within the last N days. */
  const doneCountInLastDays = useCallback((days: number) => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    cutoff.setHours(0, 0, 0, 0)
    return tasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt) >= cutoff).length
  }, [tasks])

  return { tasks, addTask, setStatus, removeTask, doneCountInLastDays, hydrated }
}
