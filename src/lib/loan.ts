import { LoanInfo } from './types'

export interface LoanScheduleMonth {
  month: number
  date: string
  startBalance: number
  interest: number
  principal: number
  payment: number
  endBalance: number
}

const MAX_MONTHS = 600 // 50-year safety cap

/** Builds a month-by-month payoff schedule. Assumes 0% interest unless annualRatePct is set. */
export function buildLoanSchedule(loan: LoanInfo): LoanScheduleMonth[] {
  const schedule: LoanScheduleMonth[] = []
  let balance = loan.totalDebt
  const monthlyRate = loan.annualRatePct / 100 / 12
  const start = new Date(loan.startDate || new Date().toISOString().slice(0, 10))
  let month = 0

  while (balance > 0.5 && month < MAX_MONTHS) {
    month += 1
    const interest = balance * monthlyRate
    let principal = loan.monthlyPayment - interest
    if (principal <= 0) break // payment doesn't even cover interest
    if (principal > balance) principal = balance
    const payment = principal + interest
    const endBalance = balance - principal

    const d = new Date(start)
    d.setMonth(d.getMonth() + month)

    schedule.push({
      month,
      date: d.toISOString().slice(0, 10),
      startBalance: balance,
      interest,
      principal,
      payment,
      endBalance,
    })
    balance = endBalance
  }

  return schedule
}

export function loanIsPayable(loan: LoanInfo): boolean {
  const monthlyRate = loan.annualRatePct / 100 / 12
  const interestOnly = loan.totalDebt * monthlyRate
  return loan.monthlyPayment > interestOnly
}
