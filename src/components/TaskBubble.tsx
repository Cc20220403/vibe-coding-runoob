import { useState, useMemo } from 'react'
import type { Task } from '../types/task'
import { useTaskStore } from '../store/taskStore'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

// 尺寸：胖胖的水滴形（接近圆形，顶部微凸）
const sizeMap = {
  high: { w: 110, h: 118, text: 15 },
  medium: { w: 90, h: 97, text: 13 },
  low: { w: 74, h: 80, text: 11.5 },
}

// 半透明配色
const bubbleStyles: Record<string, { tint: string; rim: string; glow: string; edge: string }> = {
  high: {
    tint: 'rgba(251, 113, 133, 0.06)',
    rim: 'rgba(244, 63, 94, 0.22)',
    glow: 'rgba(244, 63, 94, 0.25)',
    edge: 'rgba(244, 63, 94, 0.28)',
  },
  medium: {
    tint: 'rgba(129, 140, 248, 0.06)',
    rim: 'rgba(99, 102, 241, 0.22)',
    glow: 'rgba(99, 102, 241, 0.25)',
    edge: 'rgba(99, 102, 241, 0.28)',
  },
  low: {
    tint: 'rgba(52, 211, 153, 0.06)',
    rim: 'rgba(16, 185, 129, 0.22)',
    glow: 'rgba(16, 185, 129, 0.25)',
    edge: 'rgba(16, 185, 129, 0.28)',
  },
}

// 胖胖的雨滴路径：接近圆形，顶部有微凸的小尖尖
function dropPath(w: number, h: number): string {
  const cx = w / 2
  const bodyR = Math.min(w, h) * 0.44
  const bodyCY = h * 0.56
  const topY = h * 0.06
  // 从顶部小尖尖 → 右侧平滑过渡到圆弧 → 底部大圆弧 → 左侧回来
  return [
    `M ${cx} ${topY}`,
    `C ${cx + w * 0.06} ${h * 0.12}, ${cx + bodyR} ${bodyCY - bodyR * 0.6}, ${cx + bodyR} ${bodyCY}`,
    `A ${bodyR} ${bodyR} 0 1 1 ${cx - bodyR} ${bodyCY}`,
    `C ${cx - bodyR} ${bodyCY - bodyR * 0.6}, ${cx - w * 0.06} ${h * 0.12}, ${cx} ${topY}`,
    'Z',
  ].join(' ')
}

// 生成散射粒子
function scatterParticles(count: number) {
  const animId = `p${Date.now()}`
  const items = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8
    const dist = 18 + Math.random() * 35
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - 10
    const size = 3 + Math.random() * 5
    return { dx, dy, size, delay: Math.random() * 0.08 }
  })

  const kf = items
    .map(
      (p, i) =>
        `@keyframes ${animId}_${i}{0%{transform:translate(0,0) scale(1);opacity:.7}100%{transform:translate(${p.dx}px,${p.dy}px) scale(0);opacity:0}}`
    )
    .join('')

  return { items, animId, kf }
}

export default function TaskBubble({ task, onComplete }: Props) {
  const [popping, setPopping] = useState(false)
  const toggleTask = useTaskStore((s) => s.toggleTask)
  const size = sizeMap[task.priority]
  const style = bubbleStyles[task.priority]

  const anim = useMemo(() => {
    const delay = Math.random() * 5
    const duration = 6 + Math.random() * 5
    const name = Math.random() > 0.5 ? 'animate-bubble-float' : 'animate-bubble-drift'
    return { delay, duration, name }
  }, [])

  const scatter = useMemo(() => (popping ? scatterParticles(10) : null), [popping])

  const handleClick = () => {
    if (popping) return
    setPopping(true)
    setTimeout(() => {
      toggleTask(task.id)
      onComplete(task.id)
    }, 480)
  }

  const path = dropPath(size.w, size.h)
  const clipId = `d${task.id}`

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* 戳破动画层 */}
      {scatter && (
        <>
          <style>{scatter.kf}</style>

          {/* 涟漪扩散环 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '55%',
              width: size.w * 0.6,
              height: size.w * 0.6,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `2px solid ${style.glow}`,
              animation: 'pop-ripple 0.48s ease-out forwards',
            }}
          />

          {/* 第二层涟漪（延迟） */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '55%',
              width: size.w * 0.4,
              height: size.w * 0.4,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `1.5px solid ${style.glow}`,
              animation: 'pop-ripple 0.48s ease-out 0.06s forwards',
              opacity: 0,
            }}
          />

          {/* 散射水滴粒子 */}
          {scatter.items.map((p, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                width: p.size,
                height: p.size,
                borderRadius: '50% 50% 50% 0%',
                background: style.glow,
                animation: `${scatter.animId}_${i} 0.45s ease-out ${p.delay}s forwards`,
              }}
            />
          ))}

          {/* 闪白爆发 */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: size.w * 0.5,
              height: size.w * 0.5,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
              animation: 'pop-flash 0.3s ease-out forwards',
            }}
          />
        </>
      )}

      {/* 雨滴主体 */}
      <button
        onClick={handleClick}
        disabled={popping}
        className={`relative flex items-center justify-center cursor-pointer select-none ${
          popping ? 'animate-pop-drop' : anim.name
        }`}
        style={{
          width: size.w,
          height: size.h,
          animationDelay: popping ? '0s' : `${anim.delay}s`,
          animationDuration: popping ? '0.48s' : `${anim.duration}s`,
          filter: `drop-shadow(0 6px 20px ${style.glow})`,
        }}
        title={`点击完成: ${task.title}`}
      >
        <svg
          className="absolute inset-0"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
        >
          <defs>
            <clipPath id={clipId}>
              <path d={path} />
            </clipPath>
            <radialGradient id={`f${clipId}`} cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="50%" stopColor={style.tint} />
              <stop offset="100%" stopColor={style.rim} />
            </radialGradient>
          </defs>

          {/* 主体：半透明 */}
          <path d={path} fill={`url(#f${clipId})`} stroke={style.edge} strokeWidth="1.2" />

          {/* 主高光：左上角亮斑 */}
          <ellipse
            cx={size.w * 0.38}
            cy={size.h * 0.32}
            rx={size.w * 0.16}
            ry={size.h * 0.1}
            fill="rgba(255,255,255,0.55)"
            style={{ filter: 'blur(2px)' }}
          />

          {/* 次高光：小亮点 */}
          <ellipse
            cx={size.w * 0.32}
            cy={size.h * 0.26}
            rx={size.w * 0.06}
            ry={size.h * 0.04}
            fill="rgba(255,255,255,0.7)"
            style={{ filter: 'blur(0.5px)' }}
          />

          {/* 底部弧形反光 */}
          <ellipse
            cx={size.w * 0.52}
            cy={size.h * 0.76}
            rx={size.w * 0.14}
            ry={size.h * 0.05}
            fill="rgba(255,255,255,0.2)"
            style={{ filter: 'blur(1.5px)' }}
          />

          {/* 边缘内光晕 */}
          <path
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="3"
            style={{ filter: 'blur(1.5px)' }}
          />
        </svg>

        {/* 文字 */}
        <span
          className="font-semibold text-center leading-tight relative z-10"
          style={{
            fontSize: size.text,
            color: 'rgba(70, 55, 70, 0.82)',
            textShadow: '0 1px 3px rgba(255,255,255,0.7)',
            maxWidth: size.w * 0.6,
            marginTop: size.h * 0.12,
          }}
        >
          {task.title}
        </span>
      </button>
    </div>
  )
}
