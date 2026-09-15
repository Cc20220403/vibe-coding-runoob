import { useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'
import NavBar from '../components/NavBar'
import TaskBubble from '../components/TaskBubble'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function HomePage() {
  const tasks = useTaskStore((s) => s.tasks)

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = useMemo(() =>
    tasks.filter((t) => {
      if (t.status === 'done') return false
      return t.dueDate === today || (t.dueDate && t.dueDate < today)
    }),
    [tasks, today]
  )

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === 'done').length
    return { total, completionRate: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [tasks])

  const dateLabel = format(new Date(), 'M月d日 EEEE', { locale: zhCN })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <NavBar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            今日待办
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {dateLabel} · {todayTasks.length > 0 ? `还有 ${todayTasks.length} 项任务等你完成` : '今天没有待办任务，享受清闲吧'}
          </p>
        </div>

        {todayTasks.length > 0 ? (
          <div className="relative min-h-[400px] flex flex-wrap items-center justify-center gap-6 p-8">
            {todayTasks.map((task) => (
              <TaskBubble
                key={task.id}
                task={task}
                onComplete={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-center">
              {stats.total === 0 ? '还没有创建任何任务，去管理页面创建吧' : '今日任务已全部完成'}
            </p>
            {stats.total > 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                完成率 {stats.completionRate}%
              </p>
            )}
          </div>
        )}

        {todayTasks.length > 0 && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
            点击气泡即可完成任务
          </p>
        )}
      </main>
    </div>
  )
}
