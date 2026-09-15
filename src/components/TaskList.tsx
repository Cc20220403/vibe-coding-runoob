import type { Task } from '../types/task'
import TaskCard from './TaskCard'

interface Props {
  tasks: Task[]
  onEdit: (task: Task) => void
}

export default function TaskList({ tasks, onEdit }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-200 dark:text-slate-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <p className="text-slate-400 dark:text-slate-500 text-sm">没有找到匹配的任务</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} />
      ))}
    </div>
  )
}
