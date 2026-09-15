import { useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'

export default function Stats() {
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)

  const stats = useMemo(() => {
    // 选中日期的任务
    const dayTasks = tasks.filter((t) => t.dueDate === selectedDate)
    const total = dayTasks.length
    const todo = dayTasks.filter((t) => t.status === 'todo').length
    const inProgress = dayTasks.filter((t) => t.status === 'in-progress').length
    const done = dayTasks.filter((t) => t.status === 'done').length
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

    // 逾期任务
    const overdue = tasks.filter((t) => t.dueDate < selectedDate && t.status !== 'done').length

    return { total, todo, inProgress, done, completionRate, overdue }
  }, [tasks, selectedDate])

  const items = [
    { label: '总任务', value: stats.total, color: 'text-slate-700 dark:text-slate-200' },
    { label: '待办', value: stats.todo, color: 'text-amber-600 dark:text-amber-400' },
    { label: '已完成', value: stats.done, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: '完成率', value: `${stats.completionRate}%`, color: 'text-indigo-600 dark:text-indigo-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
          <div className="flex items-end justify-between">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        </div>
      ))}

      {/* 逾期提醒 */}
      {stats.overdue > 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 shadow-sm border border-rose-200 dark:border-rose-800/50 col-span-2 md:col-span-1">
          <p className="text-xs text-rose-500 dark:text-rose-400 mb-1">逾期任务</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.overdue}</p>
        </div>
      )}
    </div>
  )
}
