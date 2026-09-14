<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { TaskPriority } from '../types/task'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: { title: string; description: string; priority: TaskPriority }]
}>()

// 表单数据
const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('medium')

// 校验错误
const titleError = ref('')

// 打开时重置表单
watch(() => props.modelValue, (val) => {
  if (val) {
    title.value = ''
    description.value = ''
    priority.value = 'medium'
    titleError.value = ''
  }
})

function close() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  // 校验标题
  if (!title.value.trim()) {
    titleError.value = '标题不能为空'
    return
  }
  titleError.value = ''

  // 提交新任务数据
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim(),
    priority: priority.value,
  })

  close()
}

// ESC 键关闭弹窗
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- 遮罩层：点击关闭 -->
        <div class="absolute inset-0 bg-black/40" @click="close" />

        <!-- 弹窗主体 -->
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 z-10">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">新建任务</h2>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              @click="close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- 表单 -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- 标题 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                标题 <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="title"
                type="text"
                maxlength="100"
                placeholder="请输入任务标题"
                class="w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                :class="titleError ? 'border-rose-400' : 'border-slate-300 dark:border-slate-600'"
                @input="titleError = ''"
              />
              <p v-if="titleError" class="mt-1.5 text-sm text-rose-500">
                {{ titleError }}
              </p>
            </div>

            <!-- 描述 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                描述 <span class="text-slate-400 dark:text-slate-500 font-normal">（选填）</span>
              </label>
              <textarea
                v-model="description"
                rows="3"
                maxlength="500"
                placeholder="请输入任务描述"
                class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            <!-- 优先级 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                优先级
              </label>
              <select
                v-model="priority"
                class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                @click="close"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                创建
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
