import { useMemo, useState } from 'react'
import type { Task } from '../types/task'
import { useTaskStore } from '../store/taskStore'
import NavBar from '../components/NavBar'
import Stats from '../components/Stats'
import FilterBar from '../components/FilterBar'
import TaskList from '../components/TaskList'
import KanbanBoard from '../components/KanbanBoard'
import TaskFormModal from '../components/TaskFormModal'

export default function TaskListPage() {
  const tasks = useTaskStore((s) => s.tasks)
  const filterCategory = useTaskStore((s) => s.filterCategory)
  const filterPriority = useTaskStore((s) => s.filterPriority)
  const filterStatus = useTaskStore((s) => s.filterStatus)
  const searchKeyword = useTaskStore((s) => s.searchKeyword)

  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const filteredTasks = useMemo(() => {
    let result = [...tasks]
    if (filterCategory) result = result.filter((t) => t.category === filterCategory)
    if (filterPriority) result = result.filter((t) => t.priority === filterPriority)
    if (filterStatus) result = result.filter((t) => t.status === filterStatus)
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw)
      )
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return result
  }, [tasks, filterCategory, filterPriority, filterStatus, searchKeyword])

  function handleEdit(task: Task) {
    setEditTask(task)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setEditTask(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <NavBar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Stats />

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">任务管理</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'kanban' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="18" rx="1" />
                  <rect x="14" y="3" width="7" height="12" rx="1" />
                </svg>
                看板
              </button>
            </div>

            <button
              onClick={() => { setEditTask(null); setShowModal(true) }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              新建任务
            </button>
          </div>
        </div>

        <FilterBar />

        {view === 'list' ? (
          <TaskList tasks={filteredTasks} onEdit={handleEdit} />
        ) : (
          <KanbanBoard />
        )}
      </main>

      <TaskFormModal isOpen={showModal} onClose={handleCloseModal} editTask={editTask} />
    </div>
  )
}
