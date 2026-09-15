import { useState, useRef, useEffect, useMemo } from 'react'
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useTaskStore } from '../store/taskStore'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

export default function DatePicker() {
  const selectedDate = useTaskStore((s) => s.selectedDate)
  const setSelectedDate = useTaskStore((s) => s.setSelectedDate)

  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(selectedDate))
  const panelRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => new Date(selectedDate + 'T00:00:00'), [selectedDate])
  const today = useMemo(() => new Date(), [])
  const isToday = isSameDay(selected, today)

  const dateLabel = format(selected, 'M月d日 EEEE', { locale: zhCN })

  // 点击外部关闭日历
  useEffect(() => {
    if (!showCalendar) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showCalendar])

  // 日历面板的日期网格
  const calendarDays = useMemo(() => {
    const start = startOfMonth(calendarMonth)
    const end = endOfMonth(calendarMonth)
    const days = eachDayOfInterval({ start, end })
    // 填充前面的空白（周日=0）
    const leadingEmpty = getDay(start)
    const leading = Array.from({ length: leadingEmpty }, (_, i) => {
      const d = subDays(start, leadingEmpty - i)
      return { date: d, isCurrentMonth: false }
    })
    const current = days.map((d) => ({ date: d, isCurrentMonth: true }))
    // 填充后面的空白到 6 行
    const total = leading.length + current.length
    const trailingCount = total % 7 === 0 ? 0 : 7 - (total % 7)
    // 确保至少 6 行
    const needRows = Math.max(6, Math.ceil((total + trailingCount) / 7))
    const totalCells = needRows * 7
    const trailing = Array.from({ length: totalCells - total }, (_, i) => {
      const d = addDays(end, i + 1)
      return { date: d, isCurrentMonth: false }
    })
    return [...leading, ...current, ...trailing]
  }, [calendarMonth])

  function goToPrevDay() {
    const newDate = format(subDays(selected, 1), 'yyyy-MM-dd')
    setSelectedDate(newDate)
    setCalendarMonth(subDays(selected, 1))
  }

  function goToNextDay() {
    const newDate = format(addDays(selected, 1), 'yyyy-MM-dd')
    setSelectedDate(newDate)
    setCalendarMonth(addDays(selected, 1))
  }

  function goToToday() {
    const todayStr = format(today, 'yyyy-MM-dd')
    setSelectedDate(todayStr)
    setCalendarMonth(today)
    setShowCalendar(false)
  }

  function selectCalendarDay(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    setSelectedDate(dateStr)
    setCalendarMonth(date)
    setShowCalendar(false)
  }

  function goToPrevMonth() {
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    setCalendarMonth(prev)
  }

  function goToNextMonth() {
    const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    setCalendarMonth(next)
  }

  return (
    <div className="flex items-center gap-3">
      {/* 日期导航 */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 shadow-sm border border-slate-200 dark:border-slate-700">
        <button
          onClick={goToPrevDay}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="前一天"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="选择日期"
        >
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{dateLabel}</span>
          {!isToday && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              非今日
            </span>
          )}
        </button>

        <button
          onClick={goToNextDay}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="后一天"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* 今天按钮 */}
      {!isToday && (
        <button
          onClick={goToToday}
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          今天
        </button>
      )}

      {/* 日历面板 */}
      {showCalendar && (
        <div ref={panelRef} className="absolute top-full mt-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-72">
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goToPrevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {format(calendarMonth, 'yyyy年 M月', { locale: zhCN })}
            </span>
            <button
              onClick={goToNextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* 星期头 */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map(({ date, isCurrentMonth }, i) => {
              const isSelected = isSameDay(date, selected)
              const isTodayCell = isSameDay(date, today)
              return (
                <button
                  key={i}
                  onClick={() => selectCalendarDay(date)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                    ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-600' : ''}
                    ${isSelected ? 'bg-indigo-600 text-white' : ''}
                    ${!isSelected && isCurrentMonth && isTodayCell ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' : ''}
                    ${!isSelected && isCurrentMonth && !isTodayCell ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700' : ''}
                  `}
                >
                  {format(date, 'd')}
                </button>
              )
            })}
          </div>

          {/* 今天快捷按钮 */}
          <button
            onClick={goToToday}
            className="w-full mt-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            回到今天
          </button>
        </div>
      )}
    </div>
  )
}
