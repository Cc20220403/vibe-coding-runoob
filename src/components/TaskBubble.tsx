import { useState, useMemo } from 'react'
import type { Task } from '../types/task'
import { useTaskStore } from '../store/taskStore'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

const sizeMap = {
  high: { w: 130, h: 120 },
  medium: { w: 108, h: 100 },
  low: { w: 88, h: 82 },
}

// 气泡颜色方案
const bubbleStyles: Record<string, { gradient: string; glow: string; highlight: string }> = {
  high: {
    gradient: 'radial-gradient(circle at 35% 30%, rgba(255,200,210,0.95) 0%, rgba(251,113,133,0.75) 40%, rgba(225,29,72,0.5) 100%)',
    glow: 'rgba(244, 63, 94, 0.35)',
    highlight: 'rgba(255, 255, 255, 0.75)',
  },
  medium: {
    gradient: 'radial-gradient(circle at 35% 30%, rgba(254,240,190,0.95) 0%, rgba(251,191,36,0.75) 40%, rgba(217,119,6,0.5) 100%)',
    glow: 'rgba(245, 158, 11, 0.35)',
    highlight: 'rgba(255, 255, 255, 0.75)',
  },
  low: {
    gradient: 'radial-gradient(circle at 35% 30%, rgba(209,250,229,0.95) 0%, rgba(52,211,153,0.75) 40%, rgba(5,150,105,0.5) 100%)',
    glow: 'rgba(16, 185, 129, 0.35)',
    highlight: 'rgba(255, 255, 255, 0.75)',
  },
}

// 预定义的有机形状变体（非正圆，略有椭圆/不规则感）
const blobShapes = [
  // 略扁的椭圆，左上更圆
  { borderRadius: '48% 52% 55% 45% / 50% 46% 54% 50%' },
  // 偏高的水滴感
  { borderRadius: '52% 48% 46% 54% / 55% 52% 48% 45%' },
  // 左右不对称
  { borderRadius: '45% 55% 50% 50% / 48% 52% 48% 52%' },
  // 柔和的椭圆
  { borderRadius: '55% 45% 48% 52% / 52% 50% 50% 48%' },
  // 微变形
  { borderRadius: '50% 50% 45% 55% / 46% 54% 46% 54%' },
  // 宽椭圆
  { borderRadius: '46% 54% 52% 48% / 45% 50% 50% 55%' },
]

export default function TaskBubble({ task, onComplete }: Props) {
  const [popping, setPopping] = useState(false)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const size = sizeMap[task.priority]
  const style = bubbleStyles[task.priority]

  const animStyle = useMemo(() => {
    const delay = Math.random() * 5
    const duration = 6 + Math.random() * 5
    const animName = Math.random() > 0.5 ? 'animate-bubble-float' : 'animate-bubble-drift'
    const shapeIdx = Math.floor(Math.random() * blobShapes.length)
    return { delay, duration, animName, shape: blobShapes[shapeIdx] }
  }, [])

  const handleClick = () => {
    if (popping) return
    setPopping(true)

    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -(Math.random() * 40 + 20),
    }))
    setParticles(newParticles)

    setTimeout(() => {
      toggleTask(task.id)
      onComplete(task.id)
    }, 450)
  }

  const blobRadius = animStyle.shape.borderRadius

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* 粒子效果 */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="bubble-particle"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${p.x}px, ${p.y}px)`,
            background: style.glow,
          }}
        />
      ))}

      <button
        onClick={handleClick}
        disabled={popping}
        className={`
          relative flex items-center justify-center
          cursor-pointer select-none overflow-hidden
          transition-transform duration-300
          ${popping ? 'animate-pop' : animStyle.animName}
        `}
        style={{
          width: size.w,
          height: size.h,
          background: style.gradient,
          borderRadius: blobRadius,
          boxShadow: `0 8px 32px ${style.glow}, 0 2px 8px ${style.glow}, inset 0 -4px 12px rgba(0,0,0,0.08)`,
          animationDelay: `${animStyle.delay}s`,
          animationDuration: `${animStyle.duration}s`,
          border: '1px solid rgba(255,255,255,0.35)',
        }}
        title={`点击完成: ${task.title}`}
      >
        {/* 顶部高光 */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '6%',
            left: '12%',
            width: '55%',
            height: '38%',
            borderRadius: '50% 50% 45% 55% / 60% 55% 45% 40%',
            background: `radial-gradient(ellipse, ${style.highlight} 0%, transparent 70%)`,
            filter: 'blur(2px)',
          }}
        />

        {/* 底部反光 */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '8%',
            right: '10%',
            width: '32%',
            height: '22%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 70%)`,
            filter: 'blur(2px)',
          }}
        />

        {/* 边缘光晕 */}
        <div
          className="absolute inset-0 pointer-events-none animate-glow-pulse"
          style={{
            borderRadius: blobRadius,
            boxShadow: `inset 0 0 20px ${style.glow}`,
            animationDelay: `${animStyle.delay + 1}s`,
          }}
        />

        {/* 文字 */}
        <span
          className="font-semibold px-3 text-center leading-tight line-clamp-2 relative z-10"
          style={{
            fontSize: task.priority === 'high' ? '0.875rem' : task.priority === 'medium' ? '0.8rem' : '0.72rem',
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}
        >
          {task.title}
        </span>
      </button>
    </div>
  )
}
