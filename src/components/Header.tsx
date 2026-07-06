'use client'

import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { id: 'home',       label: 'Home' },
  { id: 'story',      label: 'Our Story' },
  { id: 'schedule',   label: 'Mga Ganap' },
  { id: 'rsvp',       label: 'RSVP' },
  { id: 'survey',     label: 'Survey' },
  { id: 'dress-code', label: 'Dress Code' },
]

const SECTION_IDS = NAV_LINKS.map((l) => l.id)

export default function Header() {
  const [activeSection, setActiveSection] = useState('home')
  const [open, setOpen] = useState(false)

  // Scroll-spy: the last section whose top has scrolled above the threshold.
  useEffect(() => {
    function update() {
      let current = SECTION_IDS[0]
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 80) current = id
      }
      setActiveSection(current)
      if (current === 'home') setOpen(false)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // Explicit scroll — reliable on mobile where hash-link jumps can be swallowed
  // by scroll-snap.
  function go(id: string) {
    setOpen(false)
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // Hidden on the landing (hero) section.
  const hidden = activeSection === 'home'

  return (
    <div
      className={`fixed top-0 right-0 z-50 p-4 transition-all duration-300 ${
        hidden ? '-translate-y-4 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="relative z-10 ml-auto flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-full border border-forest/10 bg-cream/95 shadow-sm backdrop-blur-sm"
      >
        {[0, 1, 2].map((bar) => (
          <span
            key={bar}
            className={`block h-0.5 w-5 origin-center bg-forest transition-all duration-200 ${
              bar === 0 && open ? 'translate-y-[7px] rotate-45' : ''
            } ${bar === 1 && open ? 'opacity-0' : ''} ${
              bar === 2 && open ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        ))}
      </button>

      {/* Dropdown menu */}
      <nav
        className={`absolute right-4 top-16 w-48 origin-top-right overflow-hidden rounded-2xl border border-forest/10 bg-cream shadow-lg transition-all duration-200 ${
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="flex flex-col py-2">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              className={`px-5 py-2.5 text-left font-sans text-sm transition-colors ${
                activeSection === link.id
                  ? 'font-medium text-terracotta'
                  : 'text-forest/80 hover:bg-forest/5'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
