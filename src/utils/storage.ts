import type { Task, TaskStatus, TaskPriority } from '../types/task'

const TASKS_KEY = 'vibe-coding-runoob-tasks'

const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done']
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

function isValidTask(item: unknown): item is Task {
  if (!item || typeof item !== 'object') return false
  const t = item as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    VALID_STATUSES.includes(t.status as TaskStatus) &&
    VALID_PRIORITIES.includes(t.priority as TaskPriority)
  )
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.warn('[storage] 保存任务数据失败:', e)
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (raw === null) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidTask)
  } catch {
    return []
  }
}
