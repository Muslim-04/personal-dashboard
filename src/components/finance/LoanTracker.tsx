'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useLoan } from '@/lib/hooks/useLoan'
import { buildLoanSchedule, loanIsPayable } from '@/lib/loan'
import { formatDate, formatKzt } from '@/lib/format'

export function LoanTracker() {
  const { loan, setLoan, hydrated } = useLoan()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(loan)

  const schedule = useMemo(() => buildLoanSchedule(loan), [loan])
  const payable = loanIsPayable(loan)
  const monthsLeft = schedule.length
  const payoffDate = schedule.at(-1)?.date
  const totalInterest = schedule.reduce((sum, m) => sum + m.interest, 0)

  const chartData = schedule.map(m => ({
    label: new Date(m.date).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
    balance: Math.round(m.endBalance),
  }))
  chartData.unshift({ label: 'Сейчас', balance: loan.totalDebt })

  function startEdit() {
    setDraft(loan)
    setEditing(true)
  }

  function save() {
    setLoan(draft)
    setEditing(false)
  }

  if (!hydrated) return null

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">План погашения кредита</h3>
        {!editing && (
          <button onClick={startEdit} className="text-xs font-medium text-emerald-400 hover:underline">
            Изменить
          </button>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Остаток долга, ₸">
            <Input type="number" value={draft.totalDebt}
              onChange={e => setDraft(d => ({ ...d, totalDebt: Number(e.target.value) }))} />
          </Field>
          <Field label="Ежемесячный платёж, ₸">
            <Input type="number" value={draft.monthlyPayment}
              onChange={e => setDraft(d => ({ ...d, monthlyPayment: Number(e.target.value) }))} />
          </Field>
          <Field label="Годовая ставка, % (0 — если без переплаты)">
            <Input type="number" step="0.1" value={draft.annualRatePct}
              onChange={e => setDraft(d => ({ ...d, annualRatePct: Number(e.target.value) }))} />
          </Field>
          <Field label="Дата начала отсчёта">
            <Input type="date" value={draft.startDate}
              onChange={e => setDraft(d => ({ ...d, startDate: e.target.value }))} />
          </Field>
          <div className="flex gap-2 md:col-span-2">
            <Button onClick={save}>Сохранить</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>Отмена</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <div className="text-xs text-neutral-500">Текущий долг</div>
              <div className="mt-1 text-base font-bold text-neutral-100">{formatKzt(loan.totalDebt)}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Платёж / месяц</div>
              <div className="mt-1 text-base font-bold text-neutral-100">{formatKzt(loan.monthlyPayment)}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Осталось платежей</div>
              <div className="mt-1 text-base font-bold text-emerald-400">
                {payable ? `${monthsLeft} мес.` : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Погашение к</div>
              <div className="mt-1 text-base font-bold text-neutral-100">
                {payable && payoffDate ? formatDate(payoffDate) : '—'}
              </div>
            </div>
          </div>

          {!payable && (
            <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              При текущей ставке платёж не покрывает даже проценты — долг не будет уменьшаться. Увеличьте платёж или укажите ставку 0%, если переплаты нет.
            </p>
          )}

          {payable && loan.annualRatePct > 0 && (
            <p className="mt-3 text-xs text-neutral-500">
              Переплата по процентам за весь срок: <span className="text-neutral-300">{formatKzt(totalInterest)}</span>
            </p>
          )}

          {payable && chartData.length > 1 && (
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="loanFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} width={70}
                    tickFormatter={v => new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(v)} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12 }}
                    labelStyle={{ color: '#e4e4e7' }}
                    formatter={(value) => [formatKzt(Number(value)), 'Остаток долга']}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#34d399" strokeWidth={2} fill="url(#loanFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
