import { Card } from '@/components/ui/Card'

export function WorkoutStats({ week, month }: { week: number; month: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="text-center">
        <div className="text-xs text-neutral-500">Тренировок за неделю</div>
        <div className="mt-1 text-lg font-bold text-emerald-400">{week}</div>
      </Card>
      <Card className="text-center">
        <div className="text-xs text-neutral-500">Тренировок за месяц</div>
        <div className="mt-1 text-lg font-bold text-emerald-400">{month}</div>
      </Card>
    </div>
  )
}
