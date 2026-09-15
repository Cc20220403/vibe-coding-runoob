import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskPriority, TaskStatus, TaskCategory } from '../types/task'

interface TaskState {
  // 任务数据
  tasks: Task[]
  
  // 筛选状态
  filterCategory: TaskCategory | ''
  filterPriority: TaskPriority | ''
  filterStatus: TaskStatus | ''
  searchKeyword: string
  
  // 任务 CRUD
  addTask: (data: { title: string; description: string; category: string; priority: TaskPriority; dueDate: string }) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  
  // 筛选操作
  setFilterCategory: (category: TaskCategory | '') => void
  setFilterPriority: (priority: TaskPriority | '') => void
  setFilterStatus: (status: TaskStatus | '') => void
  setSearchKeyword: (keyword: string) => void
  
  // 计算属性
  getFilteredTasks: () => Task[]
  getStats: () => { total: number; todo: number; inProgress: number; done: number; completionRate: number; todayCompleted: number }
  getCategories: () => string[]
  getTodayTasks: () => Task[]
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filterCategory: '',
      filterPriority: '',
      filterStatus: '',
      searchKeyword: '',

      addTask: (data) => {
        const newTask: Task = {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          status: 'todo',
          dueDate: data.dueDate,
          createdAt: new Date().toISOString().split('T')[0],
        }
        set((state) => ({ tasks: [newTask, ...state.tasks] }))
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }))
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
              : t
          ),
        }))
      },

      setFilterCategory: (category) => set({ filterCategory: category }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

      getFilteredTasks: () => {
        const { tasks, filterCategory, filterPriority, filterStatus, searchKeyword } = get()
        let result = [...tasks]

        if (filterCategory) {
          result = result.filter((t) => t.category === filterCategory)
        }
        if (filterPriority) {
          result = result.filter((t) => t.priority === filterPriority)
        }
        if (filterStatus) {
          result = result.filter((t) => t.status === filterStatus)
        }
        if (searchKeyword.trim()) {
          const kw = searchKeyword.toLowerCase()
          result = result.filter(
            (t) =>
              t.title.toLowerCase().includes(kw) ||
              t.description.toLowerCase().includes(kw)
          )
        }

        // 按创建时间倒序
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return result
      },

      getStats: () => {
        const { tasks } = get()
        const total = tasks.length
        const todo = tasks.filter((t) => t.status === 'todo').length
        const inProgress = tasks.filter((t) => t.status === 'in-progress').length
        const done = tasks.filter((t) => t.status === 'done').length
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
        
        // 今日完成数
        const today = new Date().toISOString().split('T')[0]
        const todayCompleted = tasks.filter(
          (t) => t.status === 'done' && t.dueDate === today
        ).length

        return { total, todo, inProgress, done, completionRate, todayCompleted }
      },

      getCategories: () => {
        const { tasks } = get()
        const cats = new Set(tasks.map((t) => t.category).filter(Boolean))
        return Array.from(cats)
      },

      getTodayTasks: () => {
        const { tasks } = get()
        const today = new Date().toISOString().split('T')[0]
        // 今日任务 = 截止日期是今天的 + 逾期未完成的
        return tasks.filter((t) => {
          if (t.status === 'done') return false
          return t.dueDate === today || (t.dueDate && t.dueDate < today)
        })
      },
    }),
    {
      name: 'vibe-coding-runoob-tasks',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
)
