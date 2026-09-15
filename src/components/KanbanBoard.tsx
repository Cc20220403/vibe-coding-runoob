import { useState } from 'react'
import type { Task, TaskStatus } from '../types/task'
import { priorityBorder, priorityLabel, priorityBadge } from '../constants/task'
import { useTaskStore } from '../store/taskStore'
import DeleteConfirmModal from './DeleteConfirmModal'

const columns: { status: TaskStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'todo', label: '待办', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-50 dark:bg-slate-700' },
  { status: 'in-progress', label: '进行中', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/30' },
  { status: 'done', label: '已完成', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30' },
]

export default function KanbanBoard() {
  const tasks = useTaskStore((s) => s.tasks)
  const updateTask = useTaskStore((s) => s.updateTask)
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  function getTasksByStatus(status: TaskStatus): Task[] {
    return tasks.filter((t) => t.status === status)
  }

  function onDragStart(task: Task) {
    setDraggedTaskId(task.id)
  }

  function onDragOver(status: TaskStatus) {
    setDragOverColumn(status)
  }

  function onDragLeave() {
    setDragOverColumn(null)
  }

  function onDrop(status: TaskStatus) {
    if (draggedTaskId) {
      updateTask(draggedTaskId, { status })
    }
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  function onDragEnd() {
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => (
          <div
            key={col.status}
            className={`rounded-xl border-2 transition-colors duration-150 ${dragOverColumn === col.status ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-transparent'}`}
          >
            {/* 列头 */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${col.bgColor} ${col.color}`}>
                  {getTasksByStatus(col.status).length}
                </span>
              </div>
            </div>

            {/* 拖放区域 */}
            <div
              className="px-3 pb-3 min-h-[200px] flex flex-col gap-3"
              onDragOver={(e) => { e.preventDefault(); onDragOver(col.status) }}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(col.status)}
            >
              {getTasksByStatus(col.status).map((task) => (
                <div
                  key={task.id}
                  draggable
                  className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 p-3 cursor-grab active:cursor-grabbing transition-transform duration-150 hover:scale-[1.02] ${priorityBorder[task.priority]} ${draggedTaskId === task.id ? 'opacity-40 scale-95' : ''}`}
                  onDragStart={() => onDragStart(task)}
                  onDragEnd={onDragEnd}
                >
                  {/* 卡片头部 */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-medium leading-snug ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                      {task.title}
                    </h4>
                    <button
                      onClick={() => setDeleteTarget(task)}
                      className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                      title="删除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* 描述 */}
                  {task.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                  )}

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between mt-2.5 flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${priorityBadge[task.priority]}`}>
                        {priorityLabel[task.priority]}
                      </span>
                      {task.category && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {task.category}
                        </span>
                      )}
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={() => toggleTask(task.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer accent-indigo-600"
                      />
                    </label>
                  </div>
                </div>
              ))}

              {/* 空列提示 */}
              {getTasksByStatus(col.status).length === 0 && (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-300 dark:text-slate-600 py-8">
                  拖拽任务到此处
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        taskTitle={deleteTarget?.title ?? ''}
        onConfirm={() => { if (deleteTarget) { deleteTask(deleteTarget.id); setDeleteTarget(null) } }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
