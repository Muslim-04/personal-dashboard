'use client'

import { useLocalState } from '../useLocalState'
import { DEFAULT_LOAN, LoanInfo } from '../types'

const LOAN_KEY = 'pd:finance:loan'

export function useLoan() {
  const [loan, setLoan, hydrated] = useLocalState<LoanInfo>(LOAN_KEY, DEFAULT_LOAN)
  return { loan, setLoan, hydrated }
}
