'use client'

import { useCallback } from 'react'
import { useLocalState } from '../useLocalState'
import { syncToSheet } from '../sheetSync'
import { WorkoutSession } from '../types'
import { isInPeriod } from '../period'

const SESSIONS_KEY = 'pd:workouts:sessions'

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useWorkouts() {
  const [sessions, setSessions, hydrated] = useLocalState<WorkoutSession[]>(SESSIONS_KEY, [])

  const addSession = useCallback((input: Omit<WorkoutSession, 'id' | 'createdAt'>) => {
    const session: WorkoutSession = { ...input, id: makeId(), createdAt: new Date().toISOString() }
    setSessions(prev => [session, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
    syncToSheet('Workouts', 'upsert', session)
    return session
  }, [setSessions])

  const removeSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
    syncToSheet('Workouts', 'delete', { id })
  }, [setSessions])

  const countInPeriod = useCallback((period: 'week' | 'month') => {
    return sessions.filter(s => isInPeriod(s.date, period)).length
  }, [sessions])

  return { sessions, addSession, removeSession, countInPeriod, hydrated }
}
