'use client'

import { useState } from 'react'
import MapsLink from './MapsLink'

type Row = { icon: string; text: string }
type Link = { label: string; href: string }

function VenueBlock({ title, rows, links }: { title: string; rows: Row[]; links: Link[] }) {
  return (
    <div className="space-y-2.5">
      <p className="font-sans text-sm font-bold text-forest">{title}</p>
      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span aria-hidden className="flex-shrink-0 leading-6">
            {r.icon}
          </span>
          <span className="font-sans text-sm text-forest/80 leading-6">{r.text}</span>
        </div>
      ))}
      <div className="space-y-2 pt-0.5">
        {links.map((l) => (
          <MapsLink key={l.href} label={l.label} href={l.href} compact />
        ))}
      </div>
    </div>
  )
}

export default function ParkingSection() {
  const [open, setOpen] = useState(false)

  return (
    <div id="parking" className="bg-cream text-forest pb-16">
      <div className="max-w-sm mx-auto px-5">

        {/* One card: header toggles, content lives inside it */}
        <div className="rounded-2xl bg-white border border-forest/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <span className="flex items-center gap-2 font-sans text-sm font-bold text-forest">
              <span aria-hidden>🅿️</span>
              Parking
            </span>
            <svg
              className={`w-5 h-5 flex-shrink-0 text-forest/50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Collapsible body (grid-rows trick animates height) */}
          <div
            className={`grid transition-all duration-300 ease-out ${
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-5 pb-5 pt-4 space-y-5 border-t border-forest/10">
                <VenueBlock
                  title="St. John Bosco Parish"
                  rows={[
                    { icon: '🚗', text: "There's parking at the church, but a wedding before ours might fill it up" },
                    { icon: '🅿️', text: 'Backup options nearby:' },
                  ]}
                  links={[
                    { label: 'Makati Central Square (Cinema Square)', href: 'https://maps.app.goo.gl/TZ2fWbDx94LnajLD9' },
                    { label: 'Waltermart Makati', href: 'https://maps.app.goo.gl/zAkcJV44yJ7Xghxw8' },
                  ]}
                />
                <VenueBlock
                  title="The Mess Hall"
                  rows={[
                    { icon: '❌', text: 'No parking at The Mess Hall' },
                    { icon: '✅', text: 'Asked for parking in your RSVP? We saved you a free spot at MJ Plaza, the building with the Alorica logo' },
                    { icon: '💬', text: 'At MJ Plaza, mention the Begonia-Luna wedding and give your name' },
                  ]}
                  links={[
                    { label: 'MJ Plaza', href: 'https://maps.app.goo.gl/d9heNWdM8UCskZzn7' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
