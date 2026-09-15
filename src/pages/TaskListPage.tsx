import { useMemo, useState, useCallback, useEffect } from 'react'
import type { Task } from '../types/task'
import { useTaskStore } from '../store/taskStore'
import NavBar from '../components/NavBar'
import Stats from '../components/Stats'
import DatePicker from '../components/DatePicker'
import QuickAddBar from '../components/QuickAddBar'
import FilterBar from '../components/FilterBar'
import TaskList from '../components/TaskList'
import KanbanBoard from '../components/KanbanBoard'
import TaskFormModal from '../components/TaskFormModal'
import BatchAddModal from '../components/BatchAddModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

export default function TaskListPage() {
  const tasks = useTaskStore((s) => s.tasks)
  const selectedDate = useTaskStore((s) => s.selectedDate)
  const filterCategory = useTaskStore((s) => s.filterCategory)
  const filterPriority = useTaskStore((s) => s.filterPriority)
  const filterStatus = useTaskStore((s) => s.filterStatus)
  const searchKeyword = useTaskStore((s) => s.searchKeyword)
  const batchDeleteTasks = useTaskStore((s) => s.batchDeleteTasks)
  const setTasks = useTaskStore((s) => s.setTasks)

  // 清理重复ID数据（修复旧版 localStorage 中同毫秒创建的重复ID）
  useEffect(() => {
    const seen = new Set<string>()
    const unique = tasks.filter((t) => {
      if (seen.has(t.id)) return false
      seen.add(t.id)
      return true
    })
    if (unique.length < tasks.length) {
      setTasks(unique)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [showBatchAdd, setShowBatchAdd] = useState(false)

  // 批量操作状态
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBatchDelete, setShowBatchDelete] = useState(false)

  // 日期筛选 + 其他筛选
  const { dayTasks, overdueTasks } = useMemo(() => {
    let filtered = [...tasks]

    if (filterCategory) filtered = filtered.filter((t) => t.category === filterCategory)
    if (filterPriority) filtered = filtered.filter((t) => t.priority === filterPriority)
    if (filterStatus) filtered = filtered.filter((t) => t.status === filterStatus)
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase()
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw)
      )
    }

    const overdue = filtered
      .filter((t) => t.dueDate < selectedDate && t.status !== 'done')
      .sort((a, b) => {
        const pOrder = { high: 0, medium: 1, low: 2 }
        if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority]
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

    const day = filtered
      .filter((t) => t.dueDate === selectedDate)
      .sort((a, b) => {
        const pOrder = { high: 0, medium: 1, low: 2 }
        if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority]
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

    return { dayTasks: day, overdueTasks: overdue }
  }, [tasks, selectedDate, filterCategory, filterPriority, filterStatus, searchKeyword])

  // 所有可见任务的 ID 列表（去重，防御性处理）
  const allVisibleIds = useMemo(() => {
    const ids = [...overdueTasks.map((t) => t.id), ...dayTasks.map((t) => t.id)]
    return [...new Set(ids)]
  }, [dayTasks, overdueTasks])

  const handleEdit = useCallback((task: Task) => {
    setEditTask(task)
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setEditTask(null)
  }, [])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = () => {
    if (selectedIds.size === allVisibleIds.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allVisibleIds))
    }
  }

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return
    batchDeleteTasks(Array.from(selectedIds))
    setShowBatchDelete(false)
    setSelectedIds(new Set())
    setBatchMode(false)
  }

  const exitBatchMode = () => {
    setBatchMode(false)
    setSelectedIds(new Set())
  }

  const totalVisible = allVisibleIds.length
  const selectedCount = selectedIds.size
  const allSelected = totalVisible > 0 && selectedCount === totalVisible

  return (
    <div className="min-h-screen transition-colors">
      <NavBar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* 统计面板 */}
        <Stats />

        {/* 日期导航 */}
        <div className="relative flex items-center justify-between mb-4 flex-wrap gap-3">
          <DatePicker />

          <div className="flex items-center gap-3">
            {/* 视图切换 */}
            <div className="flex items-center gap-1 glass-card rounded-xl p-1">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${view === 'list' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' : 'text-slate-500/70 dark:text-slate-400/70 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                列表
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${view === 'kanban' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' : 'text-slate-500/70 dark:text-slate-400/70 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="18" rx="1" />
                  <rect x="14" y="3" width="7" height="12" rx="1" />
                </svg>
                看板
              </button>
            </div>

            {/* 批量添加按钮 */}
            <button
              onClick={() => setShowBatchAdd(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600/80 dark:text-slate-300/80 glass-card rounded-xl hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
              title="批量添加"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
              批量添加
            </button>

            {/* 新建任务按钮 */}
            <button
              onClick={() => { setEditTask(null); setShowModal(true) }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white btn-gradient rounded-xl shadow-soft transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              新建任务
            </button>
          </div>
        </div>

        {/* 快速添加栏 */}
        <QuickAddBar />

        {/* 筛选工具栏 */}
        <FilterBar />

        {/* 批量操作栏 */}
        {view === 'list' && totalVisible > 0 && (
          <div className="flex items-center justify-between mb-3 glass-card rounded-xl px-4 py-2.5">
            {!batchMode ? (
              <>
                <span className="text-xs text-slate-500/70 dark:text-slate-400/70">
                  共 {totalVisible} 个任务
                </span>
                <button
                  onClick={() => setBatchMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600/80 dark:text-indigo-400/80 hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  批量操作
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {/* 全选 */}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300/50 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-600/80 dark:text-slate-300/80">
                      全选 {selectedCount > 0 && `(${selectedCount}/${totalVisible})`}
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {/* 批量删除 */}
                  <button
                    onClick={() => selectedCount > 0 && setShowBatchDelete(true)}
                    disabled={selectedCount === 0}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600/80 dark:text-rose-400/80 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    删除{selectedCount > 0 ? `(${selectedCount})` : ''}
                  </button>
                  {/* 退出批量 */}
                  <button
                    onClick={exitBatchMode}
                    className="px-3 py-1.5 text-xs font-medium text-slate-500/70 dark:text-slate-400/70 hover:bg-white/30 dark:hover:bg-white/10 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 任务视图 */}
        {view === 'list' ? (
          <TaskList
            tasks={dayTasks}
            overdueTasks={overdueTasks}
            onEdit={handleEdit}
            batchMode={batchMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
          />
        ) : (
          <KanbanBoard />
        )}
      </main>

      <TaskFormModal isOpen={showModal} onClose={handleCloseModal} editTask={editTask} />
      <BatchAddModal isOpen={showBatchAdd} onClose={() => setShowBatchAdd(false)} />
      <DeleteConfirmModal
        isOpen={showBatchDelete}
        count={selectedCount}
        onConfirm={handleBatchDelete}
        onCancel={() => setShowBatchDelete(false)}
      />
    </div>
  )
}
