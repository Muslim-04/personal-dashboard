'use client'

import { WorkoutForm } from '@/components/workouts/WorkoutForm'
import { WorkoutHistory } from '@/components/workouts/WorkoutHistory'
import { WorkoutStats } from '@/components/workouts/WorkoutStats'
import { WorkoutProgressChart } from '@/components/workouts/WorkoutProgressChart'
import { useWorkouts } from '@/lib/hooks/useWorkouts'

export default function WorkoutsPage() {
  const { sessions, addSession, removeSession, countInPeriod, hydrated } = useWorkouts()

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div>
        <h1 className="text-xl font-bold text-neutral-100 md:text-2xl">Тренировки</h1>
        <p className="text-sm text-neutral-500">Дневник тренировок и статистика</p>
      </div>

      <WorkoutForm addSession={addSession} />

      {hydrated && (
        <>
          <WorkoutStats week={countInPeriod('week')} month={countInPeriod('month')} />
          <WorkoutProgressChart sessions={sessions} />
          <WorkoutHistory sessions={sessions} onRemove={removeSession} />
        </>
      )}
    </div>
  )
}
