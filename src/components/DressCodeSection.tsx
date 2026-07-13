import Image from 'next/image'

const INSPO = [
  'Feminine - 1.webp',
  'Feminine - 2.webp',
  'Feminine - 3.webp',
  'Masculine - 1.webp',
  'Masculine - 2.webp',
  'Masculine - 3.webp',
]

export default function DressCodeSection() {
  return (
    <div id="dress-code" className="bg-cream text-forest py-16 overflow-hidden">
      <div className="max-w-sm mx-auto px-5 space-y-8">

        {/* Heading */}
        <h2 className="font-serif text-4xl font-bold leading-tight text-center">
          Dress code
        </h2>

        {/* Chart */}
        <div className="space-y-3">
          <p className="font-sans text-sm text-forest/80 leading-snug">
            Come in any color, as long as it&rsquo;s festive, fun, and brings you joy.
          </p>
          <div className="relative w-full aspect-[4/5]">
            <Image
              src="/assets/dress-code-page/dress-code-chart.webp"
              alt="Dress code formality chart: Fun & Festive vibe, between Casual and Black tie formality"
              fill
              className="object-contain"
              sizes="(max-width: 384px) 100vw, 384px"
            />
          </div>
        </div>

        {/* Inspo */}
        <div className="space-y-3">
          <div className="text-center space-y-1">
            <p className="font-serif text-xl font-bold">Inspiration</p>
            <span className="inline-flex items-center justify-center gap-1 font-sans text-xs text-forest/50 animate-pulse">
              swipe
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <div className="relative -mx-5">
            <div className="flex gap-3 overflow-x-auto pb-2 px-5 snap-x snap-mandatory no-scrollbar">
              {INSPO.map((name, i) => (
                <div key={i} className="flex-shrink-0 snap-start w-72 overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/assets/dress-code-page/${encodeURIComponent(name)}`}
                    alt={`Dress code inspiration ${i + 1}`}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
            {/* Right-edge fade hinting there's more to scroll */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream to-transparent" />
          </div>
        </div>

      </div>
    </div>
  )
}
