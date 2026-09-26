export type FinanceType = 'income' | 'expense'
export type FinanceScope = 'business' | 'personal'

export interface FinanceEntry {
  id: string
  date: string // YYYY-MM-DD
  scope: FinanceScope
  project: string // '' for personal entries
  type: FinanceType
  category: string
  amount: number
  comment: string
  createdAt: string
}

export const PERSONAL_LABEL = 'Личное'

export const DEFAULT_PROJECTS = [
  'OPEN BBQ',
  'lövé',
  'Клининг',
  'Теплица',
  'Kwork',
  'Реселлинг',
  'Опт-маркетплейс',
  'Другое',
]

export const DEFAULT_BUSINESS_INCOME_CATEGORIES = ['Продажи', 'Услуги', 'Инвестиции', 'Прочее']
export const DEFAULT_BUSINESS_EXPENSE_CATEGORIES = ['Закупка', 'Реклама', 'Аренда', 'Зарплата', 'Логистика', 'Кредит', 'Налоги', 'Прочее']
export const DEFAULT_PERSONAL_INCOME_CATEGORIES = ['Зарплата', 'Подработка', 'Подарок', 'Прочее']
export const DEFAULT_PERSONAL_EXPENSE_CATEGORIES = ['Еда', 'Транспорт', 'Жильё и коммуналка', 'Здоровье', 'Развлечения', 'Одежда', 'Подарки', 'Кредит', 'Прочее']

export interface LoanInfo {
  totalDebt: number
  monthlyPayment: number
  annualRatePct: number
  startDate: string // YYYY-MM-DD
}

export const DEFAULT_LOAN: LoanInfo = {
  totalDebt: 3_000_000,
  monthlyPayment: 231_000,
  annualRatePct: 0,
  startDate: new Date().toISOString().slice(0, 10),
}

// ── Tasks module ──
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface ChecklistItem {
  id: string
  label: string
}

export interface ChecklistCompletion {
  date: string // YYYY-MM-DD
  itemIds: string[]
}

export interface Task {
  id: string
  text: string
  deadline: string // YYYY-MM-DD or ''
  priority: TaskPriority
  status: TaskStatus
  createdAt: string
  completedAt?: string
}

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', label: 'Зарядка / разминка' },
  { id: 'c2', label: 'Планирование дня' },
  { id: 'c3', label: 'Проверить финансы за вчера' },
  { id: 'c4', label: 'Читать 20 минут' },
]

// ── Workouts module ──
export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
}

export interface WorkoutSession {
  id: string
  date: string
  type: string
  exercises: Exercise[]
  notes: string
  createdAt: string
}

export const WORKOUT_TYPES = ['Силовая', 'Кардио', 'Функциональная', 'Растяжка', 'Другое']
