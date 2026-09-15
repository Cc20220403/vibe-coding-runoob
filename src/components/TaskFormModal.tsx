import { useState, useEffect, useMemo } from 'react'
import type { Task, TaskPriority } from '../types/task'
import { useTaskStore } from '../store/taskStore'

interface Props {
  isOpen: boolean
  onClose: () => void
  editTask?: Task | null
}

export default function TaskFormModal({ isOpen, onClose, editTask }: Props) {
  const addTask = useTaskStore((s) => s.addTask)
  const updateTask = useTaskStore((s) => s.updateTask)
  const tasks = useTaskStore((s) => s.tasks)
  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))),
    [tasks]
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [titleError, setTitleError] = useState('')

  // 打开时重置或填充表单
  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        setTitle(editTask.title)
        setDescription(editTask.description)
        setCategory(editTask.category)
        setPriority(editTask.priority)
        setDueDate(editTask.dueDate)
      } else {
        setTitle('')
        setDescription('')
        setCategory('')
        setPriority('medium')
        setDueDate('')
      }
      setTitleError('')
    }
  }, [isOpen, editTask])

  // ESC 关闭
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
    if (!title.trim()) {
      setTitleError('标题不能为空')
      return
    }
    setTitleError('')

    if (editTask) {
      updateTask(editTask.id, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority,
        dueDate,
      })
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority,
        dueDate,
      })
    }
    onClose()
  }

  if (!isOpen) return null

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
  const borderClass = titleError ? 'border-rose-400' : 'border-slate-300 dark:border-slate-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 z-10">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {editTask ? '编辑任务' : '新建任务'}
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

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              标题 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError('') }}
              maxLength={100}
              placeholder="请输入任务标题"
              className={`${inputClass} ${borderClass}`}
            />
            {titleError && <p className="mt-1 text-sm text-rose-500">{titleError}</p>}
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              描述 <span className="text-slate-400 dark:text-slate-500 font-normal">(选填)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="请输入任务描述"
              className={`${inputClass} border-slate-300 dark:border-slate-600 resize-none`}
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              分类 <span className="text-slate-400 dark:text-slate-500 font-normal">(选填)</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="category-options"
              maxLength={30}
              placeholder="如：工作、学习、生活"
              className={`${inputClass} border-slate-300 dark:border-slate-600`}
            />
            <datalist id="category-options">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          {/* 优先级 + 截止日期 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">优先级</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={`${inputClass} border-slate-300 dark:border-slate-600`}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">截止日期</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`${inputClass} border-slate-300 dark:border-slate-600`}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {editTask ? '保存' : '创建'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
