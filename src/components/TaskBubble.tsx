import { useState, useMemo } from 'react'
import type { Task } from '../types/task'
import { useTaskStore } from '../store/taskStore'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

// 尺寸：雨滴状（上窄下宽，高>宽）
const sizeMap = {
  high: { w: 100, h: 130, text: 15 },
  medium: { w: 82, h: 108, text: 13 },
  low: { w: 66, h: 88, text: 11.5 },
}

// 半透明气泡配色（真实气泡：边缘有色、中心几乎透明）
const bubbleStyles: Record<string, { rimColor: string; innerTint: string; glow: string; edgeColor: string }> = {
  high: {
    rimColor: 'rgba(244, 63, 94, 0.25)',
    innerTint: 'rgba(251, 113, 133, 0.08)',
    glow: 'rgba(244, 63, 94, 0.2)',
    edgeColor: 'rgba(244, 63, 94, 0.3)',
  },
  medium: {
    rimColor: 'rgba(245, 158, 11, 0.25)',
    innerTint: 'rgba(251, 191, 36, 0.08)',
    glow: 'rgba(245, 158, 11, 0.2)',
    edgeColor: 'rgba(245, 158, 11, 0.3)',
  },
  low: {
    rimColor: 'rgba(16, 185, 129, 0.25)',
    innerTint: 'rgba(52, 211, 153, 0.08)',
    glow: 'rgba(16, 185, 129, 0.2)',
    edgeColor: 'rgba(16, 185, 129, 0.3)',
  },
}

// 雨滴状 SVG path（尖顶圆底）
function teardropPath(w: number, h: number): string {
  const cx = w / 2
  const topY = 0
  // 底部圆弧半径
  const r = w * 0.48
  const bottomCenterY = h - r
  // 从顶部尖端到右侧弧线起点的控制点
  const cpX = w * 0.55
  const cpY = h * 0.3
  return [
    `M ${cx} ${topY}`,
    `C ${cx + cpX * 0.3} ${cpY * 0.4}, ${cx + cpX} ${cpY}, ${cx + r} ${bottomCenterY}`,
    `A ${r} ${r} 0 1 1 ${cx - r} ${bottomCenterY}`,
    `C ${cx - cpX} ${cpY}, ${cx - cpX * 0.3} ${cpY * 0.4}, ${cx} ${topY}`,
    'Z',
  ].join(' ')
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

  const path = teardropPath(size.w, size.h)
  const clipId = `teardrop-${task.id}`

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
          cursor-pointer select-none
          transition-transform duration-300
          ${popping ? 'animate-pop' : animStyle.animName}
        `}
        style={{
          width: size.w,
          height: size.h,
          animationDelay: `${animStyle.delay}s`,
          animationDuration: `${animStyle.duration}s`,
          filter: `drop-shadow(0 8px 24px ${style.glow})`,
        }}
        title={`点击完成: ${task.title}`}
      >
        {/* SVG 雨滴形状容器 */}
        <svg
          className="absolute inset-0"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={path} />
            </clipPath>
            {/* 径向渐变：中心透明，边缘有色（真实气泡效果） */}
            <radialGradient id={`fill-${clipId}`} cx="50%" cy="60%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="60%" stopColor={style.innerTint} />
              <stop offset="100%" stopColor={style.rimColor} />
            </radialGradient>
          </defs>

          {/* 气泡主体：半透明填充 */}
          <path
            d={path}
            fill={`url(#fill-${clipId})`}
            stroke={style.edgeColor}
            strokeWidth="1.2"
          />

          {/* 顶部高光弧 */}
          <ellipse
            cx={size.w * 0.42}
            cy={size.h * 0.38}
            rx={size.w * 0.18}
            ry={size.h * 0.12}
            fill="rgba(255,255,255,0.5)"
            style={{ filter: 'blur(1.5px)' }}
          />

          {/* 底部小反光 */}
          <ellipse
            cx={size.w * 0.55}
            cy={size.h * 0.78}
            rx={size.w * 0.1}
            ry={size.h * 0.06}
            fill="rgba(255,255,255,0.25)"
            style={{ filter: 'blur(1px)' }}
          />
        </svg>

        {/* 边缘光晕层 */}
        <div
          className="absolute inset-0 pointer-events-none animate-glow-pulse"
          style={{
            clipPath: `url(#${clipId})`,
            boxShadow: `inset 0 0 ${size.w * 0.2}px ${style.glow}`,
            animationDelay: `${animStyle.delay + 1}s`,
          }}
        />

        {/* 文字 */}
        <span
          className="font-semibold text-center leading-tight relative z-10"
          style={{
            fontSize: size.text,
            color: 'rgba(80, 60, 80, 0.85)',
            textShadow: '0 1px 2px rgba(255,255,255,0.6)',
            maxWidth: size.w * 0.65,
            marginTop: size.h * 0.15,
          }}
        >
          {task.title}
        </span>
      </button>
    </div>
  )
}
