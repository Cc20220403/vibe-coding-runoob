<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TaskStatus } from './types/task'
import { tasks, addTask, toggleTask, deleteTask, updateTask } from './stores/taskStore'
import TaskList from './components/TaskList.vue'
import TaskModal from './components/TaskModal.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import ThemeToggle from './components/ThemeToggle.vue'

// 视图切换
const currentView = ref<'list' | 'kanban'>('list')

// 新建任务弹窗
const showModal = ref(false)

// 看板拖拽更新状态
function handleUpdateStatus(id: string, status: TaskStatus) {
  updateTask(id, { status })
}

// 统计各状态任务数量（一次遍历）
const stats = computed(() => {
  const result = { todo: 0, 'in-progress': 0, done: 0 }
  for (const t of tasks) {
    result[t.status]++
  }
  return result
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
    <!-- 顶部导航栏 -->
    <nav class="bg-indigo-600 shadow-lg">
      <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-white tracking-wide">
          Vibe Coding Runoob
        </h1>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-100 transition-colors shadow-sm"
            @click="showModal = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            新建任务
          </button>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="max-w-5xl mx-auto px-6 py-8">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">待办</p>
          <p class="text-3xl font-bold text-slate-700 dark:text-slate-200">
            {{ stats.todo }}
          </p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">进行中</p>
          <p class="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {{ stats['in-progress'] }}
          </p>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">已完成</p>
          <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {{ stats.done }}
          </p>
        </div>
      </div>

      <!-- 视图切换 Tab -->
      <div class="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 w-fit">
        <button
          class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="currentView === 'list'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="currentView = 'list'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          列表
        </button>
        <button
          class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors"
          :class="currentView === 'kanban'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'"
          @click="currentView = 'kanban'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="18" rx="1" />
            <rect x="14" y="3" width="7" height="12" rx="1" />
          </svg>
          看板
        </button>
      </div>

      <!-- 列表视图 -->
      <TaskList
        v-if="currentView === 'list'"
        :tasks="tasks"
        @toggle="toggleTask"
        @delete="deleteTask"
      />

      <!-- 看板视图 -->
      <KanbanBoard
        v-else
        :tasks="tasks"
        @update-status="handleUpdateStatus"
        @toggle="toggleTask"
        @delete="deleteTask"
      />

      <!-- 新建任务弹窗 -->
      <TaskModal
        v-model="showModal"
        @submit="addTask"
      />
    </main>
  </div>
</template>
