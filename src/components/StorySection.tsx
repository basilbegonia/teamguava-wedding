'use client'

import { useEffect, useState } from 'react'

// Words typed out in the "Tara, ___" heading.
const PHRASES = ['kasal?', 'inom?', 'iyak?', 'tawanan?', 'kwentuhan?', 'kain?']

const TYPE_MS = 95    // per letter while typing
const DELETE_MS = 45  // per letter while deleting
const HOLD_MS = 1400  // pause with the full word shown

export default function StorySection() {
  const [i, setI] = useState(0)
  const [len, setLen] = useState(PHRASES[0].length)
  const [deleting, setDeleting] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // Typewriter loop: type the word → hold → delete → move to the next.
  useEffect(() => {
    if (reduced) {
      const id = setInterval(() => setI((n) => (n + 1) % PHRASES.length), 1300)
      return () => clearInterval(id)
    }
    const word = PHRASES[i]
    let t: number
    if (!deleting) {
      t = window.setTimeout(
        () => (len < word.length ? setLen(len + 1) : setDeleting(true)),
        len < word.length ? TYPE_MS : HOLD_MS
      )
    } else if (len > 0) {
      t = window.setTimeout(() => setLen(len - 1), DELETE_MS)
    } else {
      t = window.setTimeout(() => {
        setDeleting(false)
        setI((n) => (n + 1) % PHRASES.length)
      }, DELETE_MS)
    }
    return () => window.clearTimeout(t)
  }, [i, len, deleting, reduced])

  const word = reduced ? PHRASES[i] : PHRASES[i].slice(0, len)

  return (
    <div id="story" className="relative bg-cream text-forest overflow-hidden py-16">
      {/* The collage image already includes the caption + blob decorations. */}
      <div className="relative w-full max-w-sm mx-auto px-5 mb-10">
        <h2 className="font-serif text-[clamp(2rem,8.5vw,2.75rem)] font-bold text-forest leading-none whitespace-nowrap text-center">
          Tara,&nbsp;{word}
          {/* Blinking typewriter cursor */}
          <span
            aria-hidden
            className="inline-block w-[3px] h-[0.85em] bg-forest/70 rounded-sm animate-blink align-baseline translate-y-[0.12em] ml-0.5"
          />
        </h2>
      </div>

      {/* Photo collage — full-width, no side border (caption + accents baked in) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/home-page/home-page-all-photos.webp"
        alt="Bea and Basil"
        className="w-full h-auto"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
