import type { Task, TaskStatus, TaskPriority } from '../types/task'

const TASKS_KEY = 'vibe-coding-runoob-tasks'

const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done']
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

/** 校验单条任务数据是否合法 */
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

/** 把任务数组存为 JSON 到 localStorage */
export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.warn('[storage] 保存任务数据失败:', e)
  }
}

/** 从 localStorage 读取并解析任务数组
 *  返回 null 表示从未保存过（首次使用），返回 [] 表示用户主动清空了数据 */
export function loadTasks(): Task[] | null {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (raw === null) return null  // 键不存在，首次使用
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidTask)
  } catch {
    return []
  }
}
