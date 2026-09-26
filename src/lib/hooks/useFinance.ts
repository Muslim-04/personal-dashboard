'use client'

import { useCallback, useMemo } from 'react'
import { useLocalState } from '../useLocalState'
import { syncToSheet } from '../sheetSync'
import {
  DEFAULT_BUSINESS_EXPENSE_CATEGORIES,
  DEFAULT_BUSINESS_INCOME_CATEGORIES,
  DEFAULT_PERSONAL_EXPENSE_CATEGORIES,
  DEFAULT_PERSONAL_INCOME_CATEGORIES,
  DEFAULT_PROJECTS,
  FinanceEntry,
  FinanceScope,
  FinanceType,
} from '../types'

const ENTRIES_KEY = 'pd:finance:entries'
const PROJECTS_KEY = 'pd:finance:projects'

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function normalizeEntry(e: FinanceEntry): FinanceEntry {
  // Backward-compat for entries saved before the `scope` field existed.
  return { ...e, scope: e.scope ?? 'business' }
}

export function useFinanceEntries() {
  const [raw, setEntries, hydrated] = useLocalState<FinanceEntry[]>(ENTRIES_KEY, [])
  const entries = useMemo(() => raw.map(normalizeEntry), [raw])

  const addEntry = useCallback((input: Omit<FinanceEntry, 'id' | 'createdAt'>) => {
    const entry: FinanceEntry = { ...input, id: makeId(), createdAt: new Date().toISOString() }
    setEntries(prev => [entry, ...prev])
    syncToSheet('Finance', 'upsert', entry)
    return entry
  }, [setEntries])

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    syncToSheet('Finance', 'delete', { id })
  }, [setEntries])

  const updateEntry = useCallback((id: string, patch: Partial<FinanceEntry>) => {
    setEntries(prev => {
      const next = prev.map(e => (e.id === id ? { ...e, ...patch } : e))
      const updated = next.find(e => e.id === id)
      if (updated) syncToSheet('Finance', 'upsert', updated)
      return next
    })
  }, [setEntries])

  /** Keeps historical entries consistent when a project/category is renamed. */
  const renameProjectInEntries = useCallback((oldName: string, newName: string) => {
    setEntries(prev => prev.map(e => (e.project === oldName ? { ...e, project: newName } : e)))
  }, [setEntries])

  const renameCategoryInEntries = useCallback((scope: FinanceScope, type: FinanceType, oldName: string, newName: string) => {
    setEntries(prev => prev.map(e => (e.scope === scope && e.type === type && e.category === oldName ? { ...e, category: newName } : e)))
  }, [setEntries])

  return { entries, addEntry, removeEntry, updateEntry, renameProjectInEntries, renameCategoryInEntries, hydrated }
}

export function useProjects() {
  const [projects, setProjects, hydrated] = useLocalState<string[]>(PROJECTS_KEY, DEFAULT_PROJECTS)

  const addProject = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setProjects(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
  }, [setProjects])

  const removeProject = useCallback((name: string) => {
    setProjects(prev => prev.filter(p => p !== name))
  }, [setProjects])

  const renameProject = useCallback((oldName: string, newName: string) => {
    setProjects(prev => prev.map(p => (p === oldName ? newName : p)))
  }, [setProjects])

  return { projects, addProject, removeProject, renameProject, hydrated }
}

const CATEGORY_KEYS = {
  business: { income: 'pd:finance:categories:business:income', expense: 'pd:finance:categories:business:expense' },
  personal: { income: 'pd:finance:categories:personal:income', expense: 'pd:finance:categories:personal:expense' },
} as const

const CATEGORY_DEFAULTS = {
  business: { income: DEFAULT_BUSINESS_INCOME_CATEGORIES, expense: DEFAULT_BUSINESS_EXPENSE_CATEGORIES },
  personal: { income: DEFAULT_PERSONAL_INCOME_CATEGORIES, expense: DEFAULT_PERSONAL_EXPENSE_CATEGORIES },
} as const

type CategorySetter = (updater: (prev: string[]) => string[]) => void

export function useCategories() {
  const [businessIncome, setBusinessIncome, h1] = useLocalState(CATEGORY_KEYS.business.income, CATEGORY_DEFAULTS.business.income as string[])
  const [businessExpense, setBusinessExpense, h2] = useLocalState(CATEGORY_KEYS.business.expense, CATEGORY_DEFAULTS.business.expense as string[])
  const [personalIncome, setPersonalIncome, h3] = useLocalState(CATEGORY_KEYS.personal.income, CATEGORY_DEFAULTS.personal.income as string[])
  const [personalExpense, setPersonalExpense, h4] = useLocalState(CATEGORY_KEYS.personal.expense, CATEGORY_DEFAULTS.personal.expense as string[])

  const getSetter = useCallback((scope: FinanceScope, type: FinanceType): CategorySetter => {
    if (scope === 'business') return type === 'income' ? setBusinessIncome : setBusinessExpense
    return type === 'income' ? setPersonalIncome : setPersonalExpense
  }, [setBusinessIncome, setBusinessExpense, setPersonalIncome, setPersonalExpense])

  const getList = useCallback((scope: FinanceScope, type: FinanceType) => {
    if (scope === 'business') return type === 'income' ? businessIncome : businessExpense
    return type === 'income' ? personalIncome : personalExpense
  }, [businessIncome, businessExpense, personalIncome, personalExpense])

  const addCategory = useCallback((scope: FinanceScope, type: FinanceType, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    getSetter(scope, type)(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
  }, [getSetter])

  const removeCategory = useCallback((scope: FinanceScope, type: FinanceType, name: string) => {
    getSetter(scope, type)(prev => prev.filter(c => c !== name))
  }, [getSetter])

  const renameCategory = useCallback((scope: FinanceScope, type: FinanceType, oldName: string, newName: string) => {
    getSetter(scope, type)(prev => prev.map(c => (c === oldName ? newName : c)))
  }, [getSetter])

  return {
    lists: { business: { income: businessIncome, expense: businessExpense }, personal: { income: personalIncome, expense: personalExpense } },
    getList,
    addCategory,
    removeCategory,
    renameCategory,
    hydrated: h1 && h2 && h3 && h4,
  }
}
