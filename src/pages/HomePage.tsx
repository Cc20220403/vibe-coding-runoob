import { useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'
import NavBar from '../components/NavBar'
import TaskBubble from '../components/TaskBubble'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 装饰性小气泡（半透明雨滴）
const decoBubbles = [
  { size: 20, x: '10%', y: '20%', delay: 0, duration: 8, opacity: 0.25 },
  { size: 14, x: '85%', y: '15%', delay: 2, duration: 10, opacity: 0.2 },
  { size: 18, x: '75%', y: '70%', delay: 1, duration: 9, opacity: 0.18 },
  { size: 12, x: '20%', y: '75%', delay: 3, duration: 11, opacity: 0.15 },
  { size: 16, x: '50%', y: '10%', delay: 4, duration: 7, opacity: 0.12 },
  { size: 10, x: '90%', y: '50%', delay: 1.5, duration: 12, opacity: 0.18 },
  { size: 22, x: '5%', y: '50%', delay: 2.5, duration: 9, opacity: 0.12 },
  { size: 8, x: '60%', y: '85%', delay: 0.5, duration: 10, opacity: 0.15 },
]

// 模块级位置缓存（确保位置永不因重渲染而变化）
const positionCache: Record<string, { left: number; top: number }> = {}

// 气泡尺寸（与 TaskBubble 中的 sizeMap 一致）
const bubbleSizeMap: Record<string, { w: number; h: number }> = {
  high: { w: 110, h: 118 },
  medium: { w: 90, h: 97 },
  low: { w: 74, h: 80 },
}

// 检测两个气泡是否碰撞（百分比坐标 + 像素尺寸）
function overlaps(
  a: { left: number; top: number; w: number; h: number },
  b: { left: number; top: number; w: number; h: number },
  containerW: number,
  containerH: number
): boolean {
  const ax1 = ((a.left / 100) * containerW) - a.w / 2
  const ay1 = ((a.top / 100) * containerH) - a.h / 2
  const ax2 = ax1 + a.w
  const ay2 = ay1 + a.h
  const bx1 = ((b.left / 100) * containerW) - b.w / 2
  const by1 = ((b.top / 100) * containerH) - b.h / 2
  const bx2 = bx1 + b.w
  const by2 = by1 + b.h
  // 加 8px 间距
  const gap = 8
  return !(
    ax2 + gap < bx1 || bx2 + gap < ax1 ||
    ay2 + gap < by1 || by2 + gap < ay1
  )
}

function getCachedPosition(
  id: string,
  priority: string,
  margin: number,
  placed: { left: number; top: number; w: number; h: number }[],
  containerW: number,
  containerH: number
): { left: number; top: number } {
  if (positionCache[id]) return positionCache[id]
  const size = bubbleSizeMap[priority] || bubbleSizeMap.medium
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  // 尝试最多 80 个候选位置
  for (let attempt = 0; attempt < 80; attempt++) {
    const seed = hash + attempt * 7919 // 用素数偏移产生不同随机序列
    const r1 = (Math.abs(seed * 16807) % 10000) / 10000
    const r2 = (Math.abs((seed >> 3) * 16807) % 10000) / 10000
    const candidate = {
      left: margin + r1 * (100 - 2 * margin),
      top: margin + r2 * (100 - 2 * margin),
      w: size.w,
      h: size.h,
    }
    let collision = false
    for (const p of placed) {
      if (overlaps(candidate, p, containerW, containerH)) {
        collision = true
        break
      }
    }
    if (!collision) {
      positionCache[id] = { left: candidate.left, top: candidate.top }
      return positionCache[id]
    }
  }
  // 兜底：用原始 hash 位置
  const r1 = (Math.abs(hash) % 10000) / 10000
  const r2 = (Math.abs(hash >> 16) % 10000) / 10000
  positionCache[id] = {
    left: margin + r1 * (100 - 2 * margin),
    top: margin + r2 * (100 - 2 * margin),
  }
  return positionCache[id]
}

export default function HomePage() {
  const tasks = useTaskStore((s) => s.tasks)

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = useMemo(() =>
    tasks.filter((t) => {
      if (t.status === 'done') return false
      return t.dueDate === today || (t.dueDate && t.dueDate < today)
    }),
    [tasks, today]
  )

  // 使用碰撞检测布局，确保气泡不重叠
  const positionMap = useMemo(() => {
    const map: Record<string, { left: number; top: number }> = {}
    const placed: { left: number; top: number; w: number; h: number }[] = []
    // 估算容器尺寸（桌面端约 1000x600 内容区）
    const containerW = 1000
    const containerH = 600
    for (const t of todayTasks) {
      const pos = getCachedPosition(t.id, t.priority, 8, placed, containerW, containerH)
      map[t.id] = pos
      placed.push({ ...pos, ...bubbleSizeMap[t.priority] })
    }
    return map
  }, [todayTasks])

  const dateLabel = format(new Date(), 'M月d日 EEEE', { locale: zhCN })

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NavBar />

      {/* 装饰气泡 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {decoBubbles.map((b, i) => (
          <div
            key={i}
            className="absolute animate-bubble-float"
            style={{
              width: b.size,
              height: b.size * 1.3,
              left: b.x,
              top: b.y,
              opacity: b.opacity,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
            }}
          >
            <svg width={b.size} height={b.size * 1.3} viewBox={`0 0 ${b.size} ${b.size * 1.3}`}>
              <defs>
                <radialGradient cx="50%" cy="60%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                  <stop offset="70%" stopColor="rgba(200,200,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(180,180,255,0.15)" />
                </radialGradient>
              </defs>
              <ellipse
                cx={b.size / 2}
                cy={b.size * 1.3 * 0.55}
                rx={b.size * 0.45}
                ry={b.size * 1.3 * 0.42}
                fill="rgba(200,210,255,0.12)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.5"
              />
              <ellipse
                cx={b.size * 0.4}
                cy={b.size * 1.3 * 0.4}
                rx={b.size * 0.15}
                ry={b.size * 0.1}
                fill="rgba(255,255,255,0.4)"
                style={{ filter: 'blur(0.5px)' }}
              />
            </svg>
          </div>
        ))}
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            今日待办
          </h1>
          <p className="text-sm text-slate-600/70 dark:text-slate-300/70">
            {dateLabel} · {todayTasks.length > 0 ? `还有 ${todayTasks.length} 项任务等你完成` : '今天没有待办任务，享受清闲吧'}
          </p>
        </div>

        {todayTasks.length > 0 ? (
          <div className="relative min-h-[500px]">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="absolute"
                style={{
                  left: `${positionMap[task.id]?.left ?? 50}%`,
                  top: `${positionMap[task.id]?.top ?? 50}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <TaskBubble
                  task={task}
                  onComplete={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center mb-6 shadow-glow-purple">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-indigo-400 dark:text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-slate-600/80 dark:text-slate-300/80 text-center text-base">
              今日任务已全部完成
            </p>
          </div>
        )}

        {todayTasks.length > 0 && (
          <p className="text-center text-xs text-slate-500/50 dark:text-slate-400/50 mt-8">
            点击气泡即可完成任务
          </p>
        )}
      </main>
    </div>
  )
}
