import Image from 'next/image'
import Carousel from './Carousel'

const INSPO = [
  'Feminine - 1.webp',
  'Feminine - 2.webp',
  'Feminine - 3.webp',
  'Masculine - 1.webp',
  'Masculine - 2.webp',
  'Masculine - 3.webp',
]

const INSPO_SLIDES = INSPO.map((name, i) => ({
  src: `/assets/dress-code-page/${encodeURIComponent(name)}`,
  alt: `Dress code inspiration ${i + 1}`,
}))

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
          <p className="font-sans text-base font-medium text-brown text-center">
            Come in any color, as long as it&rsquo;s festive, fun, and brings you joy :)
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

        {/* Inspiration carousel */}
        <div className="space-y-3">
          <p className="font-serif text-xl font-bold text-center">Inspiration</p>
          <Carousel
            slides={INSPO_SLIDES}
            aspectClass="aspect-[4/3]"
            hint="swipe for more looks →"
          />
        </div>

      </div>
    </div>
  )
}
