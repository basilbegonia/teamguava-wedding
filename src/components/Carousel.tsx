'use client'

import { useRef, useState } from 'react'

export type Slide = { src: string; alt: string }

/**
 * Instagram-post-style carousel: one slide per view, swipe/snap, a slide
 * counter, dot indicators, and (desktop-only) prev/next arrows.
 * Width is controlled by the parent; pass the image aspect ratio via aspectClass.
 */
export default function Carousel({
  slides,
  aspectClass,
  hint,
}: {
  slides: Slide[]
  aspectClass: string
  hint?: string
}) {
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
    const idx = Math.max(0, Math.min(slides.length - 1, i))
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {slides.map((s, i) => (
            <div key={i} className="w-full flex-shrink-0 snap-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.alt}
                className={`w-full ${aspectClass} object-cover`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Slide counter */}
        <div className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/45 px-2.5 py-1 font-sans text-xs font-medium text-white">
          {current + 1}/{slides.length}
        </div>

        {/* Prev / next — desktop only (mobile swipes) */}
        {current > 0 && (
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 text-forest shadow backdrop-blur hover:bg-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {current < slides.length - 1 && (
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            aria-label="Next slide"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/80 text-forest shadow backdrop-blur hover:bg-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5">
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'w-5 bg-forest' : 'w-1.5 bg-forest/25'
            }`}
          />
        ))}
      </div>

      {hint && <p className="text-center font-sans text-xs text-forest/45">{hint}</p>}
    </div>
  )
}
