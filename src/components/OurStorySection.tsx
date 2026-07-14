import Carousel from './Carousel'

const SLIDES = Array.from({ length: 10 }, (_, i) => ({
  src: `/assets/our-story/chapter-1/chapter1-${i + 1}.webp`,
  alt: `Our story — slide ${i + 1} of 10`,
}))

export default function OurStorySection() {
  return (
    <div id="our-story" className="bg-cream text-forest py-16 space-y-4">
      <h2 className="font-serif text-4xl font-bold text-center px-5">Our Story</h2>

      {/* Edge-to-edge on phones; capped + centered on wider screens */}
      <div className="sm:max-w-md sm:mx-auto">
        <Carousel
          slides={SLIDES}
          aspectClass="aspect-[4/5]"
          hint="swipe through our story →"
        />
      </div>
    </div>
  )
}
