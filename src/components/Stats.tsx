import { useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'

export default function Stats() {
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)

  const stats = useMemo(() => {
    const dayTasks = tasks.filter((t) => t.dueDate === selectedDate)
    const total = dayTasks.length
    const todo = dayTasks.filter((t) => t.status === 'todo').length
    const inProgress = dayTasks.filter((t) => t.status === 'in-progress').length
    const done = dayTasks.filter((t) => t.status === 'done').length
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
    const overdue = tasks.filter((t) => t.dueDate < selectedDate && t.status !== 'done').length
    return { total, todo, inProgress, done, completionRate, overdue }
  }, [tasks, selectedDate])

  const items = [
    { label: '总任务', value: stats.total, color: 'text-slate-700 dark:text-slate-200', glow: 'shadow-glow-blue' },
    { label: '待办', value: stats.todo, color: 'text-amber-600 dark:text-amber-400', glow: 'shadow-glow-amber' },
    { label: '已完成', value: stats.done, color: 'text-emerald-600 dark:text-emerald-400', glow: 'shadow-glow-emerald' },
    { label: '完成率', value: `${stats.completionRate}%`, color: 'text-purple-600 dark:text-purple-400', glow: 'shadow-glow-purple' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className={`glass-card rounded-2xl p-5 ${item.glow} transition-transform duration-300 hover:scale-[1.03]`}
        >
          <p className="text-xs font-medium text-slate-500/70 dark:text-slate-400/70 mb-2">{item.label}</p>
          <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
        </div>
      ))}

      {stats.overdue > 0 && (
        <div className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 dark:from-rose-500/15 dark:to-rose-600/10 rounded-2xl p-5 border border-rose-200/50 dark:border-rose-500/20 shadow-glow-rose col-span-2 md:col-span-1 animate-glow-pulse">
          <p className="text-xs font-medium text-rose-500/80 dark:text-rose-400/80 mb-2">逾期任务</p>
          <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.overdue}</p>
        </div>
      )}
    </div>
  )
}
