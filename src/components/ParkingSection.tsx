'use client'

import { useState } from 'react'
import InfoCard from './InfoCard'
import MapsLink from './MapsLink'

export default function ParkingSection() {
  const [open, setOpen] = useState(false)

  return (
    <div id="parking" className="bg-cream text-forest pb-16">
      <div className="max-w-sm mx-auto px-5">

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full flex items-center justify-between rounded-2xl bg-white border border-forest/10 px-5 py-4"
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
            open ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-6">

              {/* Ceremony */}
              <div className="space-y-3">
                <InfoCard
                  title="St. John Bosco Parish"
                  rows={[
                    { icon: '🚗', text: "There's parking at the church, but a wedding before ours might fill it up" },
                    { icon: '🅿️', text: 'Backup options nearby:' },
                  ]}
                />
                <MapsLink label="Makati Central Square (Cinema Square)" href="https://maps.app.goo.gl/TZ2fWbDx94LnajLD9" />
                <MapsLink label="Waltermart Makati" href="https://maps.app.goo.gl/zAkcJV44yJ7Xghxw8" />
              </div>

              {/* Reception */}
              <div className="space-y-3">
                <InfoCard
                  title="The Mess Hall"
                  rows={[
                    { icon: '❌', text: 'No parking at The Mess Hall' },
                    { icon: '✅', text: 'Asked for parking in your RSVP? We saved you a free spot at MJ Plaza, the building with the Alorica logo' },
                    { icon: '💬', text: 'At MJ Plaza, mention the Begonia-Luna wedding and give your name' },
                  ]}
                />
                <MapsLink label="MJ Plaza" href="https://maps.app.goo.gl/d9heNWdM8UCskZzn7" />
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
