'use client'

import { useEffect, useState } from 'react'

// Cycles in the "Tara, ___?" heading.
const PHRASES = ['kasal?', 'inom?', 'iyak?', 'tawanan?', 'kwentuhan?', 'kain?']

export default function StorySection() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setI((n) => (n + 1) % PHRASES.length)
    }, 1300)
    return () => clearInterval(id)
  }, [])

  return (
    <div id="story" className="relative bg-cream text-forest overflow-hidden py-16">
      {/* The collage image already includes the caption + blob decorations. */}
      <div className="relative w-full max-w-sm mx-auto px-5">

        <h2 className="font-serif text-[clamp(2rem,8.5vw,2.75rem)] font-bold text-terracotta leading-none mb-6 whitespace-nowrap">
          Tara,&nbsp;{PHRASES[i]}
        </h2>

        {/* Photo collage — single hard-coded image (caption + accents baked in) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/home-page/home-page-all-photos.png"
          alt="Bea and Basil"
          className="w-full h-auto"
        />

      </div>
    </div>
  )
}
