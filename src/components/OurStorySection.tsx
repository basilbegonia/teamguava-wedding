'use client'

import { useRef, useState } from 'react'

const SLIDES = Array.from({ length: 10 }, (_, i) => ({
  src: `/assets/our-story/chapter-1/chapter1-${i + 1}.webp`,
  n: i + 1,
}))

export default function OurStorySection() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  function handleScroll() {
    const el = scrollerRef.current
    if (!el) return
    setCurrent(Math.round(el.scrollLeft / el.clientWidth))
  }

  function goTo(i: number) {
    const el = scrollerRef.current
    if (!el) return
    const idx = Math.max(0, Math.min(SLIDES.length - 1, i))
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div id="our-story" className="bg-cream text-forest py-16">
      <div className="max-w-sm mx-auto px-5 space-y-4">
        <h2 className="font-serif text-4xl font-bold text-center">Our Story</h2>

        {/* Instagram-post-style carousel */}
        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-2xl"
          >
            {SLIDES.map((s) => (
              <div key={s.n} className="w-full flex-shrink-0 snap-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={`Our story — slide ${s.n} of ${SLIDES.length}`}
                  className="w-full aspect-[4/5] object-cover"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Slide counter */}
          <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/45 px-2.5 py-1 font-sans text-xs font-medium text-white">
            {current + 1}/{SLIDES.length}
          </div>

          {/* Prev / next — desktop only (mobile swipes) */}
          {current > 0 && (
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Previous slide"
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/80 text-forest shadow backdrop-blur hover:bg-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {current < SLIDES.length - 1 && (
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Next slide"
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 items-center justify-center rounded-full bg-white/80 text-forest shadow backdrop-blur hover:bg-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.n}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${s.n}`}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-5 bg-forest' : 'w-1.5 bg-forest/25'
              }`}
            />
          ))}
        </div>

        <p className="text-center font-sans text-xs text-forest/45">
          swipe through our story →
        </p>
      </div>
    </div>
  )
}
