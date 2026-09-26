export function formatKzt(n: number): string {
  const sign = n < 0 ? '-' : ''
  return sign + new Intl.NumberFormat('ru-RU').format(Math.round(Math.abs(n))) + ' ₸'
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatMonth(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
