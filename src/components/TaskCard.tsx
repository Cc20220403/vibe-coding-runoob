import { useState } from 'react'
import type { Task } from '../types/task'
import { priorityBorder, priorityLabel, priorityBadge } from '../constants/task'
import { useTaskStore } from '../store/taskStore'
import DeleteConfirmModal from './DeleteConfirmModal'

interface Props {
  task: Task
  onEdit: (task: Task) => void
}

export default function TaskCard({ task, onEdit }: Props) {
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const [showDelete, setShowDelete] = useState(false)

  const isDone = task.status === 'done'

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 p-4 transition-transform duration-200 hover:scale-[1.02] ${priorityBorder[task.priority]}`}
      >
        {/* 操作按钮组 */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {/* 编辑按钮 */}
          <button
            onClick={() => onEdit(task)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 dark:text-slate-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            title="编辑任务"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {/* 删除按钮 */}
          <button
            onClick={() => setShowDelete(true)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            title="删除任务"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-start gap-3">
          {/* 复选框 */}
          <label className="flex items-center pt-0.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isDone}
              onChange={() => toggleTask(task.id)}
              className="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
            />
          </label>

          {/* 任务内容 */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-medium pr-14 transition-colors ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityBadge[task.priority]}`}
              >
                {priorityLabel[task.priority]}
              </span>
              {task.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {task.category}
                </span>
              )}
              {task.dueDate && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  截止：{task.dueDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDelete}
        taskTitle={task.title}
        onConfirm={() => { deleteTask(task.id); setShowDelete(false) }}
        onCancel={() => setShowDelete(false)}
      />
    </>
  )
}
