import { useState, useMemo } from 'react'
import type { Task } from '../types/task'
import { useTaskStore } from '../store/taskStore'

interface Props {
  task: Task
  onComplete: (id: string) => void
}

// 尺寸：胖胖的水滴形
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

// 胖胖的雨滴路径
function dropPath(w: number, h: number): string {
  const cx = w / 2
  const bodyR = Math.min(w, h) * 0.44
  const bodyCY = h * 0.56
  const topY = h * 0.06
  return [
    `M ${cx} ${topY}`,
    `C ${cx + w * 0.06} ${h * 0.12}, ${cx + bodyR} ${bodyCY - bodyR * 0.6}, ${cx + bodyR} ${bodyCY}`,
    `A ${bodyR} ${bodyR} 0 1 1 ${cx - bodyR} ${bodyCY}`,
    `C ${cx - bodyR} ${bodyCY - bodyR * 0.6}, ${cx - w * 0.06} ${h * 0.12}, ${cx} ${topY}`,
    'Z',
  ].join(' ')
}

// 生成爆裂碎片数据（从中心向四周飞散的不规则弧面碎片）
function genFragments(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8
    const dist = 35 + Math.random() * 55
    return {
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      rot: (Math.random() - 0.5) * 720,
      w: 5 + Math.random() * 10,
      h: 3 + Math.random() * 6,
      delay: Math.random() * 0.03,
    }
  })
}

// 生成散射粒子（更多更远）
function genParticles(count: number) {
  const animId = `sp${Date.now()}`
  const items = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 1.0
    const dist = 30 + Math.random() * 70
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      size: 2 + Math.random() * 5,
      delay: Math.random() * 0.04,
    }
  })
  const kf = items
    .map(
      (p, i) =>
        `@keyframes ${animId}_${i}{0%{transform:translate(0,0) scale(1);opacity:.9}100%{transform:translate(${p.dx}px,${p.dy}px) scale(0);opacity:0}}`
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

  const fragments = useMemo(() => (popping ? genFragments(14) : null), [popping])
  const scatter = useMemo(() => (popping ? genParticles(20) : null), [popping])

  const handleClick = () => {
    if (popping) return
    setPopping(true)
    setTimeout(() => {
      toggleTask(task.id)
      onComplete(task.id)
    }, 280)
  }

  const path = dropPath(size.w, size.h)
  const clipId = `d${task.id}`

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* 爆裂效果层 */}
      {popping && fragments && scatter && (
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <style>{scatter.kf}</style>

          {/* 环形闪光 */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: size.w * 0.7,
              height: size.w * 0.7,
              background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, ${style.glow} 40%, transparent 70%)`,
              animation: 'ring-flash 0.15s ease-out forwards',
            }}
          />

          {/* 弧面碎片（像水滴破裂的碎片） */}
          {fragments.map((f, i) => (
            <div
              key={`f${i}`}
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                width: f.w,
                height: f.h,
                borderRadius: '45% 55% 40% 60%',
                background: style.edge,
                boxShadow: `0 0 4px ${style.glow}`,
                '--tx': `${f.tx}px`,
                '--ty': `${f.ty}px`,
                '--rot': `${f.rot}deg`,
                animation: `frag-fly 0.3s ease-out ${f.delay}s forwards`,
              } as React.CSSProperties}
            />
          ))}

          {/* 散射水滴粒子 */}
          {scatter.items.map((p, i) => (
            <div
              key={`p${i}`}
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: style.glow,
                animation: `${scatter.animId}_${i} 0.3s ease-out ${p.delay}s forwards`,
              }}
            />
          ))}

          {/* 涟漪环 1 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '55%',
              width: size.w * 0.5,
              height: size.w * 0.5,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `2px solid ${style.glow}`,
              animation: 'pop-ripple 0.35s ease-out forwards',
            }}
          />

          {/* 涟漪环 2 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '55%',
              width: size.w * 0.35,
              height: size.w * 0.35,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `1.5px solid ${style.glow}`,
              animation: 'pop-ripple 0.35s ease-out 0.04s forwards',
              opacity: 0,
            }}
          />
        </div>
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
          animationDuration: popping ? '0.24s' : `${anim.duration}s`,
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

          {/* 主高光 */}
          <ellipse
            cx={size.w * 0.38}
            cy={size.h * 0.32}
            rx={size.w * 0.16}
            ry={size.h * 0.1}
            fill="rgba(255,255,255,0.55)"
            style={{ filter: 'blur(2px)' }}
          />

          {/* 次高光 */}
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
