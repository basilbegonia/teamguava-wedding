'use client'

import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '#home',       label: 'Home' },
  { href: '#story',      label: 'Our Story' },
  { href: '#schedule',   label: 'Mga Ganap' },
  { href: '#rsvp',       label: 'RSVP' },
  { href: '#dress-code', label: 'Dress Code' },
]

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1))

export default function Header() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  // Scroll-spy: mark whichever section's top has passed the header
  useEffect(() => {
    function update() {
      const scrollY = window.scrollY + 72 // 64px header + 8px buffer
      let current = SECTION_IDS[0]
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollY) current = id
      }
      setActiveSection(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const isHero = activeSection === 'home'

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        isHero
          ? 'bg-forest border-b border-cream/10'
          : 'bg-cream/95 backdrop-blur-sm border-b border-forest/10'
      }`}
    >
      <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Wordmark — scrolls to top */}
        <a
          href="#home"
          onClick={() => setOpen(false)}
          className={`font-serif text-lg leading-none transition-colors ${
            isHero ? 'text-cream' : 'text-forest'
          }`}
        >
          bea &amp; basil &apos;26
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-sans text-sm transition-colors ${
                activeSection === link.href.slice(1)
                  ? isHero
                    ? 'text-mustard font-medium'
                    : 'text-terracotta font-medium'
                  : isHero
                  ? 'text-cream/70 hover:text-cream'
                  : 'text-forest/80 hover:text-forest'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-10 h-10 -mr-2"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {[0, 1, 2].map((bar) => (
            <span
              key={bar}
              className={`block w-6 h-0.5 origin-center transition-all duration-200 ${
                isHero ? 'bg-cream' : 'bg-forest'
              } ${bar === 0 && open ? 'rotate-45 translate-y-[7px]' : ''} ${
                bar === 1 && open ? 'opacity-0' : ''
              } ${bar === 2 && open ? '-rotate-45 -translate-y-[7px]' : ''}`}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav
          className={`md:hidden px-5 py-5 flex flex-col gap-5 border-t ${
            isHero ? 'bg-forest border-cream/10' : 'bg-cream border-forest/10'
          }`}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`font-sans text-base transition-colors ${
                activeSection === link.href.slice(1)
                  ? isHero
                    ? 'text-mustard font-medium'
                    : 'text-terracotta font-medium'
                  : isHero
                  ? 'text-cream/80'
                  : 'text-forest'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
