'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    const nextIsDark = stored ? stored === 'dark' : prefersDark

    setIsDark(nextIsDark)
    document.documentElement.classList.toggle('dark', nextIsDark)
  }, [])

  const toggleTheme = () => {
    setIsDark((current) => {
      const next = !current
      document.documentElement.classList.toggle('dark', next)
      window.localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:text-white"
      aria-pressed={isDark}
    >
      <span className="text-base" aria-hidden>
        {isDark ? '🌙' : '☀️'}
      </span>
      {isDark ? '夜间' : '白天'}
    </button>
  )
}
