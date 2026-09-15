import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// Handle SPA routing from GitHub Pages 404.html redirect
const params = new URLSearchParams(window.location.search)
const spaRoute = params.get('route')
if (spaRoute) {
  const cleanPath = '/vibe-coding-runoob' + spaRoute
  window.history.replaceState(null, '', cleanPath)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/vibe-coding-runoob">
      <App />
    </BrowserRouter>
  </StrictMode>
)
