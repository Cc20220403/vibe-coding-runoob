const THEME_KEY = 'vibe-coding-runoob-theme'

/** 初始化主题（在挂载前调用，防止闪烁） */
export function initTheme(): boolean {
  const saved = localStorage.getItem(THEME_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved ? saved === 'dark' : prefersDark
  document.documentElement.classList.toggle('dark', isDark)
  return isDark
}

/** 保存主题偏好到 localStorage */
export function saveTheme(isDark: boolean): void {
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
}

/** 读取已保存的主题，无记录返回 null */
export function loadTheme(): string | null {
  return localStorage.getItem(THEME_KEY)
}
