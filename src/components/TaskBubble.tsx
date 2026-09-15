import { useState, useMemo } from 'react'
import type { Task } from '../types/task'
import { useTaskStore } from '../store/taskStore'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

const sizeMap = {
  high: { w: 120, h: 120, text: 'text-sm' },
  medium: { w: 100, h: 100, text: 'text-xs' },
  low: { w: 80, h: 80, text: 'text-[11px]' },
}

// 气泡颜色方案：径向渐变 + 阴影颜色
const bubbleStyles: Record<string, { gradient: string; glow: string; highlight: string }> = {
  high: {
    gradient: 'radial-gradient(circle at 35% 30%, rgba(255,200,210,0.9) 0%, rgba(251,113,133,0.7) 40%, rgba(225,29,72,0.5) 100%)',
    glow: 'rgba(244, 63, 94, 0.35)',
    highlight: 'rgba(255, 255, 255, 0.7)',
  },
  medium: {
    gradient: 'radial-gradient(circle at 35% 30%, rgba(254,240,190,0.9) 0%, rgba(251,191,36,0.7) 40%, rgba(217,119,6,0.5) 100%)',
    glow: 'rgba(245, 158, 11, 0.35)',
    highlight: 'rgba(255, 255, 255, 0.7)',
  },
  low: {
    gradient: 'radial-gradient(circle at 35% 30%, rgba(209,250,229,0.9) 0%, rgba(52,211,153,0.7) 40%, rgba(5,150,105,0.5) 100%)',
    glow: 'rgba(16, 185, 129, 0.35)',
    highlight: 'rgba(255, 255, 255, 0.7)',
  },
}

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
    return { delay, duration, animName }
  }, [])

  const handleClick = () => {
    if (popping) return
    setPopping(true)

    // 生成粒子
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
          relative rounded-full flex items-center justify-center
          cursor-pointer select-none overflow-hidden
          transition-transform duration-300
          ${popping ? 'animate-pop' : animStyle.animName}
        `}
        style={{
          width: size.w,
          height: size.h,
          background: style.gradient,
          boxShadow: `0 8px 32px ${style.glow}, 0 2px 8px ${style.glow}, inset 0 -4px 12px rgba(0,0,0,0.08)`,
          animationDelay: `${animStyle.delay}s`,
          animationDuration: `${animStyle.duration}s`,
          border: '1px solid rgba(255,255,255,0.3)',
        }}
        title={`点击完成: ${task.title}`}
      >
        {/* 顶部高光 */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '8%',
            left: '15%',
            width: '55%',
            height: '35%',
            background: `radial-gradient(ellipse, ${style.highlight} 0%, transparent 70%)`,
            filter: 'blur(1px)',
          }}
        />

        {/* 底部反光 */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            bottom: '10%',
            right: '12%',
            width: '30%',
            height: '20%',
            background: `radial-gradient(ellipse, rgba(255,255,255,0.3) 0%, transparent 70%)`,
            filter: 'blur(2px)',
          }}
        />

        {/* 边缘光晕 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none animate-glow-pulse"
          style={{
            boxShadow: `inset 0 0 20px ${style.glow}`,
            animationDelay: `${animStyle.delay + 1}s`,
          }}
        />

        {/* 文字 */}
        <span
          className={`${size.text} font-semibold px-3 text-center leading-tight line-clamp-2 relative z-10`}
          style={{
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
