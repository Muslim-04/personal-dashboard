import { Card } from '@/components/ui/Card'

export function WeeklySummary({ checklistDone, tasksDone }: { checklistDone: number; tasksDone: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="text-center">
        <div className="text-xs text-neutral-500">Пункты режима за неделю</div>
        <div className="mt-1 text-lg font-bold text-emerald-400">{checklistDone}</div>
      </Card>
      <Card className="text-center">
        <div className="text-xs text-neutral-500">Задачи выполнены за неделю</div>
        <div className="mt-1 text-lg font-bold text-emerald-400">{tasksDone}</div>
      </Card>
    </div>
  )
}
