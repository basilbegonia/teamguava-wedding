'use client'

import { useEffect, useState } from 'react'

const COLOR_CYCLE = [
  ['text-mustard', 'text-terracotta', 'text-cream'],
  ['text-cream', 'text-mustard', 'text-terracotta'],
  ['text-terracotta', 'text-cream', 'text-mustard'],
]

export default function HeroSection() {
  const [frame, setFrame] = useState(0)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % COLOR_CYCLE.length)
    }, 650)
    return () => clearInterval(id)
  }, [])

  // Nudge the guest to scroll down after a beat.
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1000)
    return () => clearTimeout(t)
  }, [])

  // The landing should never rest half-scrolled. When scrolling settles while
  // the hero is only partly in view, snap it fully into place:
  //  · scrolling up  → back to the top (home)
  //  · scrolling down → to the next section only if committed past halfway,
  //    otherwise fall back to the top.
  useEffect(() => {
    let lastY = window.scrollY
    let dir: 'up' | 'down' = 'down'
    let timer: number | undefined
    let animating = false

    function settle() {
      if (animating) return
      const hero = document.getElementById('home')
      if (!hero) return
      const h = hero.offsetHeight
      const y = window.scrollY
      if (y <= 0 || y >= h) return // fully on home or fully past — nothing to do

      const target = dir === 'up' ? 0 : y > h * 0.5 ? h : 0
      if (target === y) return
      animating = true
      window.scrollTo({ top: target, behavior: 'smooth' })
      window.setTimeout(() => {
        animating = false
        lastY = window.scrollY
      }, 700)
    }

    function onScroll() {
      const y = window.scrollY
      if (y !== lastY) dir = y > lastY ? 'down' : 'up'
      lastY = y
      if (animating) return
      window.clearTimeout(timer)
      timer = window.setTimeout(settle, 110)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(timer)
    }
  }, [])

  const [c0, c1, c2] = COLOR_CYCLE[frame]

  return (
    <div
      id="home"
      className="relative bg-forest flex flex-col items-center justify-center px-8 pb-16"
    >
      <div className="flex flex-col gap-1 text-center">
        <p className={`font-serif text-4xl md:text-6xl font-bold transition-colors duration-200 ${c0}`}>
          dis is it, pancit!
        </p>
        <p className={`font-serif text-4xl md:text-6xl font-bold transition-colors duration-200 ${c1}`}>
          dis is it, pancit!
        </p>
        <p className={`font-serif text-4xl md:text-6xl font-bold transition-colors duration-200 ${c2}`}>
          dis is it, pancit!
        </p>
      </div>

      {/* Scroll-down hint — appears after a second, tap to scroll down.
          Centered via flexbox (not a transform) so it doesn't clash with the
          fade-up animation's transform. */}
      {showHint && (
        <div className="absolute inset-x-0 bottom-8 flex justify-center animate-fade-up">
          <button
            type="button"
            onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
            aria-label="Scroll down"
            className="flex flex-col items-center gap-1 text-cream/70 transition-colors hover:text-cream"
          >
            <span className="font-sans text-[11px] uppercase tracking-widest">scroll</span>
            <svg className="w-6 h-6 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
