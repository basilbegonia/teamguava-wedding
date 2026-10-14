import MapsLink from './MapsLink'

export default function ScheduleSection() {
  return (
    <div id="schedule" className="bg-cream text-forest py-16 overflow-hidden">

      {/* Header */}
      <div className="max-w-sm mx-auto px-5 mb-6">
        <h2 className="font-serif text-4xl font-bold mb-1 text-center">Mga Ganap</h2>
        <p className="font-sans text-base font-medium text-brown text-center">Nov. 27, 2026 | Friday</p>
      </div>

      {/* ── Ceremony ─────────────────────────────────────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/mga-ganap/mga-ganap-1.webp"
        alt="3:30 PM ceremony at St. John Bosco Parish, Makati — Antonio Arnaiz Avenue, cor. Amorsolo St. Doors close 3:30 PM."
        className="w-full h-auto"
        loading="lazy"
        decoding="async"
      />
      <div className="max-w-sm mx-auto px-5 mt-4">
        <MapsLink label="St. John Bosco Parish" href="https://maps.app.goo.gl/Jm11V2t2NwFCfBwbA" />
      </div>

      {/* ── Reception ────────────────────────────────────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/mga-ganap/mga-ganap-2.webp"
        alt="6:00 PM reception at The Mess Hall, Makati — Karrivin Plaza, Chino Roces Ave."
        className="w-full h-auto mt-10"
        loading="lazy"
        decoding="async"
      />
      <div className="max-w-sm mx-auto px-5 mt-4">
        <MapsLink label="The Mess Hall" href="https://maps.app.goo.gl/dFgcVtRQ6qeaT1xUA" />
      </div>

    </div>
  )
}
