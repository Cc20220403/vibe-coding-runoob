import type { TaskPriority } from '../types/task'

/** 优先级左边框颜色（Tailwind class） */
export const priorityBorder: Record<TaskPriority, string> = {
  high: 'border-l-rose-500',
  medium: 'border-l-indigo-400',
  low: 'border-l-emerald-500',
}

/** 优先级标签文字 */
export const priorityLabel: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

/** 优先级徽章样式（含深色模式） */
export const priorityBadge: Record<TaskPriority, string> = {
  high: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  medium: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  low: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
}

/** 状态标签 */
export const statusLabel: Record<string, string> = {
  todo: '待办',
  'in-progress': '进行中',
  done: '已完成',
}

/** 状态颜色 */
export const statusColor: Record<string, string> = {
  todo: 'text-slate-600 dark:text-slate-400',
  'in-progress': 'text-amber-600 dark:text-amber-400',
  done: 'text-emerald-600 dark:text-emerald-400',
}
