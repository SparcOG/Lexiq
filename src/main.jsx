import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = saved === 'dark' ? '#1a1a1a' : '#f5f5f5'
  }
} catch {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
