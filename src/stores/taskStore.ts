import { reactive, watch } from 'vue'
import type { Task, TaskPriority } from '../types/task'
import { saveTasks, loadTasks } from '../utils/storage'

// 初始化：首次使用即为空数组，不预设任何任务
const initial = loadTasks()
const tasks = reactive<Task[]>(initial === null ? [] : initial)

// 监听变化自动持久化
watch(
  () => tasks,
  (val) => saveTasks(val),
  { deep: true },
)

/** 添加新任务 */
function addTask(data: { title: string; description: string; priority: TaskPriority }) {
  const newTask: Task = {
    id: Date.now().toString(),
    title: data.title,
    description: data.description,
    status: 'todo',
    priority: data.priority,
    dueDate: '',
    createdAt: new Date().toISOString().split('T')[0],
  }
  tasks.unshift(newTask)
}

/** 更新任务字段 */
function updateTask(id: string, updates: Partial<Task>) {
  const task = tasks.find(t => t.id === id)
  if (task) {
    Object.assign(task, updates)
  }
}

/** 删除任务 */
function deleteTask(id: string) {
  const index = tasks.findIndex(t => t.id === id)
  if (index !== -1) {
    tasks.splice(index, 1)
  }
}

/** 切换任务完成状态 */
function toggleTask(id: string) {
  const task = tasks.find(t => t.id === id)
  if (task) {
    task.status = task.status === 'done' ? 'todo' : 'done'
  }
}

export { tasks, addTask, updateTask, deleteTask, toggleTask }
