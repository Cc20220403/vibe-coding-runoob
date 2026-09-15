import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskPriority, TaskStatus } from '../types/task'

interface TaskState {
  // 任务数据
  tasks: Task[]
  
  // 筛选状态
  filterCategory: string
  filterPriority: TaskPriority | ''
  filterStatus: TaskStatus | ''
  searchKeyword: string
  
  // 任务 CRUD
  addTask: (data: { title: string; description: string; category: string; priority: TaskPriority; dueDate: string }) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  
  // 筛选操作
  setFilterCategory: (category: string) => void
  setFilterPriority: (priority: TaskPriority | '') => void
  setFilterStatus: (status: TaskStatus | '') => void
  setSearchKeyword: (keyword: string) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'vibe-coding-runoob-tasks',
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
)
