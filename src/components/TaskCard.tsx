import { useState } from 'react'
import type { Task } from '../types/task'
import { priorityLabel } from '../constants/task'
import { useTaskStore } from '../store/taskStore'
import DeleteConfirmModal from './DeleteConfirmModal'

interface Props {
  task: Task
  onEdit: (task: Task) => void
  isOverdue?: boolean
}

const priorityDot: Record<string, string> = {
  high: 'bg-rose-500',
  medium: 'bg-indigo-500',
  low: 'bg-emerald-500',
}

const priorityGlow: Record<string, string> = {
  high: 'shadow-glow-blue',
  medium: 'shadow-soft',
  low: 'shadow-soft',
}

export default function TaskCard({ task, onEdit, isOverdue }: Props) {
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const [showDelete, setShowDelete] = useState(false)

  const isDone = task.status === 'done'

  return (
    <>
      <div
        className={`group relative glass-card rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01] ${isOverdue && !isDone ? 'shadow-glow-rose' : priorityGlow[task.priority] || 'shadow-soft'}`}
        style={{
          borderLeft: isOverdue && !isDone
            ? '3px solid rgba(244,63,94,0.6)'
            : `3px solid ${task.priority === 'high' ? 'rgba(244,63,94,0.4)' : task.priority === 'medium' ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.3)'}`,
        }}
      >
        {/* 操作按钮组 */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(task)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400/60 dark:text-slate-500/60 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
            title="编辑任务"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400/60 dark:text-slate-500/60 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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
              className="w-4.5 h-4.5 rounded-lg border-slate-300/50 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer accent-indigo-500"
            />
          </label>

          {/* 任务内容 */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-medium pr-14 transition-colors ${isDone ? 'line-through text-slate-400/70 dark:text-slate-500/70' : 'text-slate-800 dark:text-slate-100'}`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-slate-500/70 dark:text-slate-400/70 mt-0.5 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* 右侧标签区 */}
          <div className="flex items-center gap-2 shrink-0">
            {task.category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/8 text-indigo-600/80 dark:bg-indigo-400/10 dark:text-indigo-400/80 border border-indigo-200/30 dark:border-indigo-400/10">
                {task.category}
              </span>
            )}
            {/* 优先级圆点 + 文字 */}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${priorityDot[task.priority]}`} />
              <span className="text-[11px] font-medium text-slate-500/70 dark:text-slate-400/70">
                {priorityLabel[task.priority]}
              </span>
            </div>
            {task.dueDate && (
              <span className={`text-[11px] font-mono ${isOverdue && !isDone ? 'text-rose-500/80 font-medium' : 'text-slate-400/60 dark:text-slate-500/60'}`}>
                {task.dueDate}
              </span>
            )}
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
