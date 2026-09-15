import type { Task } from '../types/task'
import TaskCard from './TaskCard'

interface Props {
  tasks: Task[]
  overdueTasks: Task[]
  onEdit: (task: Task) => void
}

export default function TaskList({ tasks, overdueTasks, onEdit }: Props) {
  const hasOverdue = overdueTasks.length > 0
  const hasToday = tasks.length > 0

  if (!hasToday && !hasOverdue) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-200 dark:text-slate-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <p className="text-slate-400 dark:text-slate-500 text-sm">该日期没有任务</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 逾期任务组 */}
      {hasOverdue && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              逾期任务
            </h3>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              {overdueTasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} isOverdue />
            ))}
          </div>
        </div>
      )}

      {/* 今日/选中日期任务组 */}
      {hasToday && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              当日任务
            </h3>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {tasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
