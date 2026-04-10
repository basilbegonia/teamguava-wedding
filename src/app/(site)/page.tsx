'use client'

import { useEffect, useState } from 'react'

const COLOR_CYCLE = [
  ['text-mustard', 'text-terracotta', 'text-cream'],
  ['text-cream', 'text-mustard', 'text-terracotta'],
  ['text-terracotta', 'text-cream', 'text-mustard'],
]

export default function HeroPage() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % COLOR_CYCLE.length)
    }, 650)
    return () => clearInterval(id)
  }, [])

  const [c0, c1, c2] = COLOR_CYCLE[frame]

  return (
    <main className="flex-1 bg-forest flex flex-col items-center justify-center px-8 pb-16">
      <div className="flex flex-col gap-1 text-center md:text-left">
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
    </main>
  )
}
