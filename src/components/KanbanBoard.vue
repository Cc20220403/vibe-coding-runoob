<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TaskStatus } from '../types/task'
import { priorityBorder, priorityLabel, priorityBadge } from '../constants/task'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  'update-status': [id: string, status: TaskStatus]
  toggle: [id: string]
  delete: [id: string]
}>()

// 三列定义
const columns: { status: TaskStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'todo', label: '待办', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-50 dark:bg-slate-700' },
  { status: 'in-progress', label: '进行中', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/30' },
  { status: 'done', label: '已完成', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30' },
]

// 按状态筛选任务
function getTasksByStatus(status: TaskStatus): Task[] {
  return props.tasks.filter(t => t.status === status)
}

// 拖拽状态
const draggedTaskId = ref<string | null>(null)
const dragOverColumn = ref<TaskStatus | null>(null)

// 删除确认弹窗状态
const showDeleteConfirmId = ref<string | null>(null)

function requestDelete(id: string) {
  showDeleteConfirmId.value = id
}

function confirmDelete() {
  if (showDeleteConfirmId.value) {
    emit('delete', showDeleteConfirmId.value)
    showDeleteConfirmId.value = null
  }
}

function cancelDelete() {
  showDeleteConfirmId.value = null
}

// 获取正在确认删除的任务名称
const deletingTaskTitle = computed(() => {
  if (!showDeleteConfirmId.value) return ''
  const t = props.tasks.find(t => t.id === showDeleteConfirmId.value)
  return t ? t.title : ''
})

function onDragStart(task: Task) {
  draggedTaskId.value = task.id
}

function onDragOver(status: TaskStatus) {
  dragOverColumn.value = status
}

function onDragLeave() {
  dragOverColumn.value = null
}

function onDrop(status: TaskStatus) {
  if (draggedTaskId.value) {
    emit('update-status', draggedTaskId.value, status)
  }
  draggedTaskId.value = null
  dragOverColumn.value = null
}

function onDragEnd() {
  draggedTaskId.value = null
  dragOverColumn.value = null
}
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <!-- 每一列 -->
    <div
      v-for="col in columns"
      :key="col.status"
      class="rounded-xl border-2 transition-colors duration-150"
      :class="dragOverColumn === col.status ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-transparent'"
    >
      <!-- 列头 -->
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold" :class="col.color">
            {{ col.label }}
          </h3>
          <span
            class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium"
            :class="col.bgColor + ' ' + col.color"
          >
            {{ getTasksByStatus(col.status).length }}
          </span>
        </div>
      </div>

      <!-- 拖放区域 -->
      <div
        class="px-3 pb-3 min-h-[200px] flex flex-col gap-3"
        @dragover.prevent="onDragOver(col.status)"
        @dragleave="onDragLeave"
        @drop="onDrop(col.status)"
      >
        <div
          v-for="task in getTasksByStatus(col.status)"
          :key="task.id"
          draggable="true"
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 p-3 cursor-grab active:cursor-grabbing transition-transform duration-150 hover:scale-[1.02]"
          :class="[
            priorityBorder[task.priority],
            draggedTaskId === task.id ? 'opacity-40 scale-95' : '',
          ]"
          @dragstart="onDragStart(task)"
          @dragend="onDragEnd"
        >
          <!-- 卡片顶部：标题 + 删除 -->
          <div class="flex items-start justify-between gap-2">
            <h4
              class="text-sm font-medium leading-snug"
              :class="task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'"
            >
              {{ task.title }}
            </h4>
            <button
              class="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
              title="删除任务"
              @click.stop="requestDelete(task.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- 描述 -->
          <p v-if="task.description" class="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
            {{ task.description }}
          </p>

          <!-- 底部：优先级 + 复选框 -->
          <div class="flex items-center justify-between mt-2.5">
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
              :class="priorityBadge[task.priority]"
            >
              {{ priorityLabel[task.priority] }}
            </span>
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                :checked="task.status === 'done'"
                class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer accent-indigo-600"
                @change="emit('toggle', task.id)"
              />
            </label>
          </div>
        </div>

        <!-- 列内空状态 -->
        <div
          v-if="getTasksByStatus(col.status).length === 0"
          class="flex-1 flex items-center justify-center text-xs text-slate-300 dark:text-slate-600 py-8"
        >
          拖拽任务到此处
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
      <div v-if="showDeleteConfirmId" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="cancelDelete" />
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 z-10">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">确认删除</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-5">
            确定要删除任务「<span class="font-medium text-slate-700 dark:text-slate-200">{{ deletingTaskTitle }}</span>」吗？此操作不可撤销。
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
