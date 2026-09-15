import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  taskTitle?: string
  count?: number
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({ isOpen, taskTitle, count, onConfirm, onCancel }: Props) {
  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass-card rounded-2xl w-full max-w-sm p-6 z-10 shadow-xl">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">确认删除</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          {count
            ? <>确定要删除选中的 <span className="font-medium text-slate-700 dark:text-slate-200">{count}</span> 个任务吗？此操作不可撤销。</>
            : <>确定要删除任务「<span className="font-medium text-slate-700 dark:text-slate-200">{taskTitle}</span>」吗？此操作不可撤销。</>
          }
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-xl shadow-soft transition-all duration-300"
            onClick={onConfirm}
          >
            删除
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-slate-600/80 dark:text-slate-400/80 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10 rounded-xl transition-colors"
            onClick={onCancel}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
