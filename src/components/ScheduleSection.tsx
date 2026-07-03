import Image from 'next/image'

function TimeBadge({ time }: { time: string }) {
  return (
    <div className="relative inline-flex items-center justify-center mb-3">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{ width: 108, height: 46 }}
      >
        <Image
          src="/assets/mga-ganap/shape-5.png"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: 'center 32%' }}
          sizes="108px"
          aria-hidden
        />
      </div>
      <span className="relative z-10 font-sans text-sm font-bold text-white px-4 py-1.5">
        {time}
      </span>
    </div>
  )
}

function MapsLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-sans text-xs text-terracotta/80 hover:text-terracotta transition-colors"
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      Open in Maps
    </a>
  )
}

export default function ScheduleSection() {
  return (
    <div id="schedule" className="bg-cream text-forest py-16 overflow-hidden">
      <div className="max-w-sm mx-auto px-5">

        {/* Header */}
        <h2 className="font-serif text-4xl font-bold mb-1">Mga Ganap</h2>
        <p className="font-sans text-sm text-forest/50 mb-8">Nov. 27, 2026 | Friday</p>

        {/* ── Event 1: Church ──────────────────────────────────────────── */}
        <div className="flex items-start gap-2 mb-4">

          {/* Blob decoration + portrait oval photo */}
          <div className="relative flex-shrink-0 w-[162px] h-[228px]">
            {/* Olive blob — bleeds off left edge */}
            <div className="absolute -left-6 -top-2 w-[188px] h-[252px] pointer-events-none">
              <Image
                src="/assets/mga-ganap/shape-3.png"
                alt=""
                fill
                className="object-contain object-left-top"
                aria-hidden
              />
            </div>
            {/* Portrait oval photo — on top of blob */}
            <div
              className="absolute overflow-hidden shadow-md"
              style={{
                width: 138,
                height: 194,
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-54%, -50%)',
              }}
            >
              <Image
                src="/assets/mga-ganap/church.png"
                alt="St. John Bosco Parish"
                fill
                className="object-cover object-center"
                sizes="138px"
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-2">
            <TimeBadge time="3:30 PM" />
            <h3 className="font-serif text-lg font-bold leading-tight mb-1">
              St. John Bosco Parish, Makati
            </h3>
            <p className="font-sans text-xs text-forest/55 mb-2">
              Antonio Arnaiz Avenue, cor. Amorsolo St.
            </p>
            <p className="font-sans text-sm text-forest/80 leading-relaxed mb-2">
              30 years ago, Bea&apos;s parents got married here and 20 years ago, Basil was confirmed.
              Decades later, we&apos;re back for a full circle moment hehe
            </p>
            <p className="font-sans text-xs text-forest/45 italic mb-3">Doors close 3:30 PM</p>
            <MapsLink href="https://maps.app.goo.gl/tDEFTmzGi2JvYjKP9" />
          </div>
        </div>

        {/* Dashed arrow image */}
        <div className="flex justify-center my-2">
          <div className="relative w-28 h-20">
            <Image
              src="/assets/mga-ganap/shape-6.png"
              alt=""
              fill
              className="object-contain"
              aria-hidden
            />
          </div>
        </div>

        {/* ── Event 2: Reception ───────────────────────────────────────── */}
        <div className="flex items-start gap-3">

          {/* Text */}
          <div className="flex-1 min-w-0 pt-1">
            <TimeBadge time="6:00 PM" />
            <h3 className="font-serif text-lg font-bold leading-tight mb-1">
              The Mess Hall, Makati
            </h3>
            <p className="font-sans text-xs text-forest/55 mb-2">Karrivin Plaza, Chino Roces Ave</p>
            <p className="font-sans text-sm text-forest/80 leading-relaxed mb-3">
              For some merriment after we get married chos 😄
            </p>
            <MapsLink href="https://maps.app.goo.gl/3VxEg4FZSZ8u1RNKA" />
          </div>

          {/* Squiggle decoration + landscape oval photo */}
          <div className="relative flex-shrink-0 w-[158px] h-[150px]">
            {/* Orange squiggle — bleeds off right edge */}
            <div className="absolute -right-6 -top-4 w-[186px] h-[186px] pointer-events-none">
              <Image
                src="/assets/mga-ganap/shape-4.png"
                alt=""
                fill
                className="object-contain object-right-top"
                aria-hidden
              />
            </div>
            {/* Landscape oval photo — slightly rotated, on top of squiggle */}
            <div
              className="absolute overflow-hidden shadow-md"
              style={{
                width: 152,
                height: 114,
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(6deg)',
              }}
            >
              <Image
                src="/assets/mga-ganap/mess-hall.png"
                alt="The Mess Hall"
                fill
                className="object-cover object-center"
                sizes="152px"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
