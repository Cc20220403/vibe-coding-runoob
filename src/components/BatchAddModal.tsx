import { useState, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function BatchAddModal({ isOpen, onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask)
  const selectedDate = useTaskStore((s) => s.selectedDate)
  const [text, setText] = useState('')

  useEffect(() => {
    if (isOpen) setText('')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return
    for (const title of lines) {
      addTask({
        title,
        description: '',
        category: '',
        priority: 'medium',
        dueDate: selectedDate,
      })
    }
    onClose()
  }

  if (!isOpen) return null

  const lineCount = text.split('\n').filter((l) => l.trim()).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card rounded-2xl w-full max-w-md p-6 z-10 shadow-xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-5">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              每行一个任务标题
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={'买牛奶\n写周报\n预约牙医\n...'}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400/60 dark:placeholder-slate-500/60 outline-none transition-colors focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10 backdrop-blur-sm resize-none"
            />
            {lineCount > 0 && (
              <p className="mt-1.5 text-xs text-slate-500/60 dark:text-slate-400/60">
                将创建 <span className="font-semibold text-indigo-500 dark:text-indigo-400">{lineCount}</span> 个任务，日期：{selectedDate}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="submit"
              disabled={lineCount === 0}
              className="px-5 py-2 text-sm font-medium text-white btn-gradient rounded-xl shadow-soft transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              创建 {lineCount > 0 ? `(${lineCount})` : ''}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600/80 dark:text-slate-400/80 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10 rounded-xl transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
