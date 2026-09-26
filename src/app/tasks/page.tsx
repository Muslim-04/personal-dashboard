'use client'

import { DailyChecklist } from '@/components/tasks/DailyChecklist'
import { TaskList } from '@/components/tasks/TaskList'
import { WeeklySummary } from '@/components/tasks/WeeklySummary'
import { useChecklist, useChecklistCompletions, useTasks } from '@/lib/hooks/useTasks'

export default function TasksPage() {
  const { items, addItem, removeItem, hydrated: checklistHydrated } = useChecklist()
  const { isDone, toggle, countInLastDays, hydrated: completionsHydrated } = useChecklistCompletions()
  const { tasks, addTask, setStatus, removeTask, doneCountInLastDays, hydrated: tasksHydrated } = useTasks()

  const hydrated = checklistHydrated && completionsHydrated && tasksHydrated

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div>
        <h1 className="text-xl font-bold text-neutral-100 md:text-2xl">Задачи и режим дня</h1>
        <p className="text-sm text-neutral-500">Ежедневный чек-лист и разовые задачи</p>
      </div>

      {hydrated && (
        <>
          <WeeklySummary checklistDone={countInLastDays(7)} tasksDone={doneCountInLastDays(7)} />
          <DailyChecklist items={items} addItem={addItem} removeItem={removeItem} isDone={isDone} toggle={toggle} />
          <TaskList tasks={tasks} addTask={addTask} setStatus={setStatus} removeTask={removeTask} />
        </>
      )}
    </div>
  )
}
