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

  const selectClass =
    'px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors'

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* 搜索框 */}
      <div className="relative flex-1 min-w-[200px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
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
          <option key={cat} value={cat}>
            {cat}
          </option>
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
    </div>
  )
}
