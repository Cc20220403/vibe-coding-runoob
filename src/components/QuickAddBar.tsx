import { useState, useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'
import { priorityLabel } from '../constants/task'
import type { TaskPriority } from '../types/task'

export default function QuickAddBar() {
  const addTask = useTaskStore((s) => s.addTask)
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))),
    [tasks]
  )

  function handleAdd() {
    if (!title.trim()) return
    addTask({
      title: title.trim(),
      description: '',
      category: category.trim(),
      priority,
      dueDate: selectedDate,
    })
    setTitle('')
    setCategory('')
    setPriority('medium')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const inputClass =
    'px-3 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors'

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* 标题输入 */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入任务内容..."
          className="flex-1 min-w-[200px] px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
        />

        {/* 分类下拉 */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          <option value="">分类</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* 优先级下拉 */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className={inputClass}
        >
          <option value="high">{priorityLabel.high}</option>
          <option value="medium">{priorityLabel.medium}</option>
          <option value="low">{priorityLabel.low}</option>
        </select>

        {/* 添加按钮 */}
        <button
          onClick={handleAdd}
          disabled={!title.trim()}
          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          添加
        </button>
      </div>
    </div>
  )
}
