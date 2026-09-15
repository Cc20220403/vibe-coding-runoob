import { useState, useEffect, useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'
import { priorityLabel } from '../constants/task'
import type { TaskPriority } from '../types/task'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface TaskDraft {
  id: number // 临时标识（行号）
  title: string
  priority: TaskPriority
  category: string
  description: string
}

export default function BatchAddModal({ isOpen, onClose }: Props) {
  const batchAddTasks = useTaskStore((s) => s.batchAddTasks)
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)

  const [text, setText] = useState('')
  const [taskList, setTaskList] = useState<TaskDraft[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))),
    [tasks]
  )

  // 打开时重置
  useEffect(() => {
    if (isOpen) {
      setText('')
      setTaskList([])
      setExpandedIds(new Set())
    }
  }, [isOpen])

  // ESC 关闭
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // 标题文本变化时同步任务列表（保留已有字段值）
  useEffect(() => {
    if (!isOpen) return
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const existingMap = new Map(taskList.map((t) => [t.title, t]))

    const newIds = new Set<number>()
    const newList: TaskDraft[] = lines.map((title, i) => {
      newIds.add(i)
      const existing = existingMap.get(title)
      if (existing) return { ...existing, id: i }
      return { id: i, title, priority: 'medium', category: '', description: '' }
    })

    setTaskList(newList)
    // 清理已不存在的展开状态
    setExpandedIds((prev) => {
      const next = new Set<number>()
      for (const id of prev) {
        if (newIds.has(id)) next.add(id)
      }
      return next
    })
  }, [text, isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateTask = (id: number, field: keyof TaskDraft, value: string) => {
    setTaskList((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allExpanded = taskList.length > 0 && expandedIds.size === taskList.length
  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(taskList.map((t) => t.id)))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (taskList.length === 0) return
    batchAddTasks(
      taskList.map((t) => ({
        title: t.title,
        description: t.description.trim(),
        category: t.category.trim(),
        priority: t.priority,
        dueDate: selectedDate,
      }))
    )
    onClose()
  }

  if (!isOpen) return null

  const inputCls =
    'px-2.5 py-1.5 text-xs rounded-lg border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-200 placeholder-slate-400/60 dark:placeholder-slate-500/60 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-500/10 transition-colors backdrop-blur-sm'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl w-full max-w-lg z-10 shadow-xl max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-5 pb-3 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            批量添加任务
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 可滚动内容区 */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
          {/* 标题输入 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              任务标题 <span className="text-slate-400 dark:text-slate-500 font-normal">（每行一个）</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder={'买牛奶\n写周报\n预约牙医\n...'}
              autoFocus
              className="w-full px-3 py-2 rounded-xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400/60 dark:placeholder-slate-500/60 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10 backdrop-blur-sm resize-none"
            />
          </div>

          {/* 任务列表 */}
          {taskList.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  任务详情
                  <span className="text-slate-400/60 dark:text-slate-500/60 font-normal ml-1.5 text-xs">
                    点击展开编辑
                  </span>
                </span>
                <button
                  type="button"
                  onClick={toggleExpandAll}
                  className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  {allExpanded ? '收起全部' : '展开全部'}
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {taskList.map((task) => {
                  const isExpanded = expandedIds.has(task.id)
                  return (
                    <div
                      key={task.id}
                      className="rounded-xl border border-white/20 dark:border-white/8 bg-white/25 dark:bg-white/3 backdrop-blur-sm overflow-hidden transition-all"
                    >
                      {/* 紧凑行：标题 + 优先级 + 展开按钮 */}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 truncate">
                          {task.title}
                        </span>
                        <select
                          value={task.priority}
                          onChange={(e) => updateTask(task.id, 'priority', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 text-xs rounded-lg border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-300 outline-none"
                        >
                          <option value="low">{priorityLabel.low}</option>
                          <option value="medium">{priorityLabel.medium}</option>
                          <option value="high">{priorityLabel.high}</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => toggleExpand(task.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>

                      {/* 展开详情：分类 + 描述 */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-white/15 dark:border-white/5 space-y-2">
                          <input
                            type="text"
                            value={task.category}
                            onChange={(e) => updateTask(task.id, 'category', e.target.value)}
                            list="batch-cat-opts"
                            placeholder="分类（选填）"
                            maxLength={30}
                            className={`${inputCls} w-full`}
                          />
                          <datalist id="batch-cat-opts">
                            {categories.map((cat) => (
                              <option key={cat} value={cat} />
                            ))}
                          </datalist>
                          <input
                            type="text"
                            value={task.description}
                            onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                            placeholder="描述（选填）"
                            maxLength={500}
                            className={`${inputCls} w-full`}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 汇总 */}
          {taskList.length > 0 && (
            <p className="text-xs text-slate-500/60 dark:text-slate-400/60">
              将创建 <span className="font-semibold text-indigo-500 dark:text-indigo-400">{taskList.length}</span> 个任务，日期：{selectedDate}
            </p>
          )}
        </div>

        {/* 底部按钮（固定） */}
        <div className="flex items-center justify-end gap-3 p-5 pt-3 border-t border-white/15 dark:border-white/5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600/80 dark:text-slate-400/80 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={taskList.length === 0}
            className="px-5 py-2 text-sm font-medium text-white btn-gradient rounded-xl shadow-soft transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            创建 {taskList.length > 0 ? `(${taskList.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
