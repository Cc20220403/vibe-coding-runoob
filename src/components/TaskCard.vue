<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task } from '../types/task'
import { priorityBorder, priorityLabel, priorityBadge } from '../constants/task'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
}>()

const isDone = computed(() => props.task.status === 'done')

// 删除确认弹窗状态
const showDeleteConfirm = ref(false)

function requestDelete() {
  showDeleteConfirm.value = true
}

function confirmDelete() {
  showDeleteConfirm.value = false
  emit('delete', props.task.id)
}

function cancelDelete() {
  showDeleteConfirm.value = false
}
</script>

<template>
  <div
    class="group relative bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 p-4 transition-transform duration-200 hover:scale-[1.02]"
    :class="priorityBorder[task.priority]"
  >
    <!-- 删除按钮 -->
    <button
      class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
      title="删除任务"
      @click="requestDelete"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <div class="flex items-start gap-3">
      <!-- 复选框 -->
      <label class="flex items-center pt-0.5 cursor-pointer">
        <input
          type="checkbox"
          :checked="isDone"
          class="w-4.5 h-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
          @change="emit('toggle', task.id)"
        />
      </label>

      <!-- 任务内容 -->
      <div class="flex-1 min-w-0">
        <h3
          class="text-base font-medium pr-6 transition-colors"
          :class="isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'"
        >
          {{ task.title }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
          {{ task.description }}
        </p>
        <div class="flex items-center gap-3 mt-3">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            :class="priorityBadge[task.priority]"
          >
            {{ priorityLabel[task.priority] }}
          </span>
          <span class="text-xs text-slate-400 dark:text-slate-500">
            截止：{{ task.dueDate }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- 删除确认弹窗 -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="cancelDelete" />
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">确认删除</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">
            确定要删除任务「<span class="font-medium text-slate-700 dark:text-slate-200">{{ task.title }}</span>」吗？此操作不可撤销。
          </p>
          <div class="flex items-center justify-end gap-3">
            <button
              class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              @click="cancelDelete"
            >
              取消
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-sm transition-colors"
              @click="confirmDelete"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
