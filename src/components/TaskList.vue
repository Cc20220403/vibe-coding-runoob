<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TaskStatus } from '../types/task'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
}>()

type FilterType = 'all' | TaskStatus

const currentFilter = ref<FilterType>('todo')

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'todo', label: '待办' },
  { key: 'in-progress', label: '进行中' },
  { key: 'done', label: '完成' },
]

const filteredTasks = computed(() => {
  // 先按筛选条件过滤
  let result = currentFilter.value === 'all'
    ? [...props.tasks]
    : props.tasks.filter(t => t.status === currentFilter.value)

  // 按创建时间倒序排列（最新的在上面）
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return result
})
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
    <!-- 头部：标题 + 筛选按钮 -->
    <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">任务列表</h2>

      <!-- 状态筛选按钮组 -->
      <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
        <button
          v-for="filter in filters"
          :key="filter.key"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="currentFilter === filter.key
            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
          @click="currentFilter = filter.key"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- 任务列表区域 -->
    <div class="p-4">
      <!-- 有任务时：用 TaskCard 展示 -->
      <div v-if="filteredTasks.length" class="flex flex-col gap-3">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @toggle="emit('toggle', $event)"
          @delete="emit('delete', $event)"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-slate-200 dark:text-slate-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <p class="text-slate-400 dark:text-slate-500 text-sm">还没有任务，点击下方按钮创建第一个吧</p>
      </div>
    </div>
  </div>
</template>
