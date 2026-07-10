function MapsLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-3 font-sans text-sm text-forest transition-colors hover:border-forest/40"
    >
      <svg className="w-4 h-4 flex-shrink-0 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-xs text-forest/50">Open in Maps →</span>
    </a>
  )
}

export default function ScheduleSection() {
  return (
    <div id="schedule" className="bg-cream text-forest py-16 overflow-hidden">

      {/* Header */}
      <div className="max-w-sm mx-auto px-5 mb-6">
        <h2 className="font-serif text-4xl font-bold mb-1 text-center">Mga Ganap</h2>
        <p className="font-sans text-base font-medium text-brown text-center">Nov. 27, 2026 | Friday</p>
      </div>

      {/* Full-width schedule image (venues, times + accents baked in) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/mga-ganap/mga-ganap-whole-page.webp"
        alt="Schedule: 3:30 PM ceremony at St. John Bosco Parish, Makati; 6:00 PM reception at The Mess Hall, Makati"
        className="w-full h-auto"
        loading="lazy"
        decoding="async"
      />

      {/* Map links */}
      <div className="max-w-sm mx-auto px-5 mt-6 flex flex-col gap-3">
        <MapsLink label="St. John Bosco Parish" href="https://maps.app.goo.gl/Jm11V2t2NwFCfBwbA" />
        <MapsLink label="The Mess Hall" href="https://maps.app.goo.gl/dFgcVtRQ6qeaT1xUA" />
      </div>

    </div>
  )
}
