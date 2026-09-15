import { useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'
import { priorityLabel, statusLabel } from '../constants/task'
import type { TaskPriority, TaskStatus } from '../types/task'

export default function FilterBar() {
  const tasks = useTaskStore((s) => s.tasks)
  const filterCategory = useTaskStore((s) => s.filterCategory)
  const filterPriority = useTaskStore((s) => s.filterPriority)
  const filterStatus = useTaskStore((s) => s.filterStatus)
  const searchKeyword = useTaskStore((s) => s.searchKeyword)
  const setFilterCategory = useTaskStore((s) => s.setFilterCategory)
  const setFilterPriority = useTaskStore((s) => s.setFilterPriority)
  const setFilterStatus = useTaskStore((s) => s.setFilterStatus)
  const setSearchKeyword = useTaskStore((s) => s.setSearchKeyword)

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))),
    [tasks]
  )

  const hasFilters = filterCategory || filterPriority || filterStatus || searchKeyword.trim()

  function clearAll() {
    setFilterCategory('')
    setFilterPriority('')
    setFilterStatus('')
    setSearchKeyword('')
  }

  const selectClass =
    'px-2.5 py-1.5 text-xs rounded-full border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-500/10 transition-colors backdrop-blur-sm'

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* 搜索框 */}
      <div className="relative flex-1 min-w-[180px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="搜索任务..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 text-slate-700 dark:text-slate-200 placeholder-slate-400/60 dark:placeholder-slate-500/60 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-500/10 transition-colors backdrop-blur-sm"
        />
      </div>

      {/* 分类筛选 */}
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
        className={selectClass}
      >
        <option value="">全部分类</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* 优先级筛选 */}
      <select
        value={filterPriority}
        onChange={(e) => setFilterPriority(e.target.value as TaskPriority | '')}
        className={selectClass}
      >
        <option value="">全部优先级</option>
        <option value="high">{priorityLabel.high}</option>
        <option value="medium">{priorityLabel.medium}</option>
        <option value="low">{priorityLabel.low}</option>
      </select>

      {/* 状态筛选 */}
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')}
        className={selectClass}
      >
        <option value="">全部状态</option>
        <option value="todo">{statusLabel.todo}</option>
        <option value="in-progress">{statusLabel['in-progress']}</option>
        <option value="done">{statusLabel.done}</option>
      </select>

      {/* 清除筛选 */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500/70 dark:text-slate-400/70 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          清除
        </button>
      )}
    </div>
  )
}
