import { useState, useMemo } from 'react'
import type { Task } from '../types/task'
import { useTaskStore } from '../store/taskStore'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

// 根据优先级决定气泡大小
const sizeMap = {
  high: { w: 'w-28', h: 'h-28', text: 'text-sm' },
  medium: { w: 'w-24', h: 'h-24', text: 'text-xs' },
  low: { w: 'w-20', h: 'h-20', text: 'text-xs' },
}

// 根据优先级决定颜色
const colorMap = {
  high: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  medium: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  low: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
}

export default function TaskBubble({ task, onComplete }: Props) {
  const [popping, setPopping] = useState(false)
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const size = sizeMap[task.priority]

  // 随机动画参数（每个气泡不同）
  const animStyle = useMemo(() => {
    const delay = Math.random() * 5
    const duration = 5 + Math.random() * 4
    const animName = Math.random() > 0.5 ? 'animate-float' : 'animate-drift'
    return {
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      className: animName,
    }
  }, [])

  const handleClick = () => {
    if (popping) return
    setPopping(true)
    // 等 pop 动画结束后标记完成
    setTimeout(() => {
      toggleTask(task.id)
      onComplete(task.id)
    }, 400)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${size.w} ${size.h} rounded-full border-2 flex items-center justify-center
        cursor-pointer select-none transition-shadow hover:shadow-lg
        ${colorMap[task.priority]}
        ${popping ? 'animate-pop' : animStyle.className}
        animate-infinite
      `}
      style={{
        animationDelay: animStyle.animationDelay,
        animationDuration: animStyle.animationDuration,
      }}
      title={`点击完成: ${task.title}`}
    >
      <span className={`${size.text} font-medium px-2 text-center leading-tight line-clamp-2`}>
        {task.title}
      </span>
    </button>
  )
}
