import Image from 'next/image'

export default function DressCodeSection() {
  return (
    <div id="dress-code" className="bg-cream text-forest py-16 overflow-hidden">
      <div className="max-w-sm mx-auto px-5 space-y-8">

        {/* Heading */}
        <h2 className="font-serif text-4xl font-bold leading-tight">
          Come dressed<br />to celebrate!
        </h2>

        {/* Chart */}
        <div className="space-y-3">
          <p className="font-sans text-sm text-forest/80 leading-snug">
            Come in your most Fun &amp; Festive cocktail attire
          </p>
          <div className="relative w-full aspect-[4/5]">
            <Image
              src="/assets/dress-code-page/dress-code-chart.png"
              alt="Dress code formality chart: Fun & Festive vibe, between Casual and Black tie formality"
              fill
              className="object-contain"
              sizes="(max-width: 384px) 100vw, 384px"
            />
          </div>
        </div>

        {/* Inspo */}
        <div className="space-y-4">
          <p className="font-serif text-xl font-bold">Inspo:</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory">
            {['bg-terracotta/15', 'bg-mustard/20', 'bg-forest/10'].map((bg, i) => (
              <div
                key={i}
                className={`flex-shrink-0 snap-start w-36 h-52 rounded-2xl ${bg} flex items-end justify-center pb-3`}
              >
                <span className="font-sans text-xs text-forest/30">inspo {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Closing note */}
        <p className="font-serif text-lg italic text-forest/40 text-center pb-4">
          Most importantly — be comfortable enough to dance. 💃🕺
        </p>

      </div>
    </div>
  )
}
