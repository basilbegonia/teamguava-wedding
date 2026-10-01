'use client'

import { useState } from 'react'
import Carousel from './Carousel'

const CHAPTERS = [
  {
    n: 1,
    label: 'Chapter 1',
    dir: 'chapter-1',
    prefix: 'chapter1',
    count: 11,
  },
  {
    n: 2,
    label: 'Chapter 2',
    dir: 'chapter-2',
    prefix: 'chapter2',
    count: 15,
  },
] as const

function slidesFor(c: (typeof CHAPTERS)[number]) {
  return Array.from({ length: c.count }, (_, i) => ({
    src: `/assets/our-story/${c.dir}/${c.prefix}-${i + 1}.webp`,
    alt: `Our story, ${c.label} — slide ${i + 1} of ${c.count}`,
  }))
}

export default function OurStorySection() {
  // Chapter 2 is the current chapter, shown first.
  const [active, setActive] = useState(1) // index into CHAPTERS → Chapter 2
  const chapter = CHAPTERS[active]

  return (
    <div id="our-story" className="bg-cream text-forest py-16 space-y-4">
      <h2 className="font-serif text-4xl font-bold text-center px-5">Our Story</h2>

      {/* Chapter switch — segmented pill toggle (matches the site's rounded-full idiom) */}
      <div className="flex justify-center px-5">
        <div className="inline-flex rounded-full bg-forest/10 p-1">
          {CHAPTERS.map((c, idx) => (
            <button
              key={c.n}
              type="button"
              onClick={() => setActive(idx)}
              aria-pressed={active === idx}
              className={`rounded-full px-5 py-1.5 font-sans text-sm font-medium transition-colors ${
                active === idx ? 'bg-forest text-cream' : 'text-forest/55 hover:text-forest'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Edge-to-edge on phones; capped + centered on wider screens.
          key forces a fresh carousel (resets to slide 1) when the chapter changes. */}
      <div className="sm:max-w-md sm:mx-auto">
        <Carousel
          key={chapter.n}
          slides={slidesFor(chapter)}
          aspectClass="aspect-[4/5]"
          hint="swipe through our story →"
        />
      </div>
    </div>
  )
}
