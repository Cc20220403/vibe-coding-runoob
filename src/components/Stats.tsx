import { useTaskStore } from '../store/taskStore'

export default function Stats() {
  const stats = useTaskStore((s) => s.getStats())

  const items = [
    { label: '总任务', value: stats.total, color: 'text-slate-700 dark:text-slate-200' },
    { label: '待办', value: stats.todo, color: 'text-slate-600 dark:text-slate-400' },
    { label: '进行中', value: stats.inProgress, color: 'text-amber-600 dark:text-amber-400' },
    { label: '已完成', value: stats.done, color: 'text-emerald-600 dark:text-emerald-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
        </div>
      ))}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">完成率</p>
        <div className="flex items-end gap-1">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.completionRate}</p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-0.5">%</p>
        </div>
      </div>
    </div>
  )
}
