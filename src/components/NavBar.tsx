import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function NavBar() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20 dark:border-white/5">
      <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gradient tracking-wide hover:opacity-80 transition-opacity">
          智能看板
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to={isHome ? '/tasks' : '/'}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full glass-card hover:shadow-glow-blue transition-all duration-300 text-slate-700 dark:text-slate-200"
          >
            {isHome ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                管理任务
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                返回首页
              </>
            )}
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
