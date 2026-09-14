import { reactive, watch } from 'vue'
import type { Task, TaskPriority } from '../types/task'
import { saveTasks, loadTasks } from '../utils/storage'

// 默认示例任务（首次使用时创建）
const defaultTasks: Task[] = [
  {
    id: '1',
    title: '搭建项目骨架',
    description: '初始化 Vue 3 + Vite + Tailwind CSS 项目，配置基础目录结构',
    status: 'done',
    priority: 'high',
    dueDate: '2026-09-15',
    createdAt: '2026-09-12',
  },
  {
    id: '2',
    title: '实现任务列表页面',
    description: '完成 TaskCard、TaskList、TaskModal 组件开发，打通新建/完成/删除流程',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2026-09-18',
    createdAt: '2026-09-14',
  },
  {
    id: '3',
    title: '接入后端 API',
    description: '对接 RESTful 接口，实现任务的增删改查数据交互',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-09-22',
    createdAt: '2026-09-14',
  },
]

// 初始化：null 表示首次使用，加载默认示例任务；[] 表示用户主动清空，保持空数组
const initial = loadTasks()
const tasks = reactive<Task[]>(initial === null ? defaultTasks : initial)

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
