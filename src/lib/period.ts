export type Period = 'day' | 'week' | 'month' | 'all'

export const PERIOD_LABELS: Record<Period, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
  all: 'Всё время',
}

function startOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // Monday = 0
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date
}

export function isInPeriod(dateISO: string, period: Period, reference: Date = new Date()): boolean {
  if (period === 'all') return true
  const d = new Date(dateISO)
  if (Number.isNaN(d.getTime())) return false

  if (period === 'day') {
    return d.toDateString() === reference.toDateString()
  }
  if (period === 'week') {
    const start = startOfWeek(reference)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return d >= start && d < end
  }
  // month
  return d.getFullYear() === reference.getFullYear() && d.getMonth() === reference.getMonth()
}
