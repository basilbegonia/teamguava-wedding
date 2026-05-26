// Photo stubs — replace the placeholder div with <Image> when real photos arrive.
// Drop files into /public/photos/ and use src="/photos/photo-N.jpg".
const photos = [
  {
    id: 1,
    alt: 'Bea and Basil at the harbour',
    rotate: 'rotate-[5deg]',
    position: 'col-start-2 row-start-1 justify-self-end self-end',
    bottomPb: 'pb-7',
  },
  {
    id: 2,
    alt: 'Bea and Basil on a bench',
    rotate: '-rotate-[3deg]',
    position: 'col-start-1 row-start-2 justify-self-start -mt-6',
    bottomPb: 'pb-7',
  },
  {
    id: 3,
    alt: 'Bea and Basil in the city',
    rotate: 'rotate-[2deg]',
    position: 'col-start-2 row-start-2 justify-self-end mt-4',
    bottomPb: 'pb-7',
  },
]

function Polaroid({ photo }: { photo: (typeof photos)[number] }) {
  return (
    <div
      className={`
        ${photo.rotate} ${photo.position} ${photo.bottomPb}
        bg-white p-2 shadow-[0_3px_12px_rgba(0,0,0,0.18)]
        w-[44vw] max-w-[160px] min-w-[120px]
        transition-transform duration-300 hover:scale-105 hover:rotate-0
      `}
    >
      {/* 3:4 portrait — swap for <Image fill className="object-cover"> when photos arrive */}
      <div className="w-full aspect-[3/4] bg-forest/10 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <span className="font-sans text-[10px] text-forest/25 text-center leading-tight">
            {photo.alt}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function StoryPage() {
  return (
    <main className="relative flex-1 bg-cream text-forest overflow-hidden">

      {/* ── Blob decorations ─────────────────────────────────────────────── */}
      {/* Bottom-left mustard blob — partially off-screen */}
      <svg
        aria-hidden
        className="absolute -bottom-20 -left-20 w-64 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#F2B965"
          d="M44.6,-62.3C56.3,-53.2,62.7,-37.5,67.3,-21.2C71.9,-4.9,74.7,12,69.8,26.4C64.9,40.8,52.3,52.6,37.9,60.2C23.5,67.8,7.3,71.1,-8.4,69.5C-24.1,67.9,-39.3,61.4,-50.6,50.7C-61.9,40,-69.3,25,-71.1,9.3C-72.9,-6.4,-69.1,-22.8,-61,-36.2C-52.8,-49.6,-40.3,-60,-26.7,-67.5C-13.2,-75,1.4,-79.5,15.6,-76.8C29.7,-74.1,32.9,-71.4,44.6,-62.3Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Top-right terracotta accent — blob peeking from corner */}
      <svg
        aria-hidden
        className="absolute -top-20 -right-20 w-52 pointer-events-none opacity-30"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#EE1839"
          d="M38.9,-52.2C50.3,-43.8,59.4,-31.5,63.2,-17.4C67,-3.3,65.4,12.5,59.2,26C53,39.5,42.1,50.6,28.8,57.3C15.6,64,-0.1,66.3,-15.5,63.5C-30.9,60.6,-46,52.6,-55.9,40.3C-65.8,28,-70.5,11.3,-68.8,-4.5C-67.1,-20.3,-59,-35.3,-47.6,-43.8C-36.2,-52.3,-21.5,-54.3,-7.2,-55.9C7.1,-57.5,27.5,-60.6,38.9,-52.2Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm mx-auto px-5 pt-10 pb-24">

        {/* Heading */}
        <h1 className="font-serif text-[clamp(3.5rem,14vw,4.5rem)] font-bold text-terracotta leading-none mb-5">
          Tara,&nbsp;kain?
        </h1>

        {/* 2-col grid: [text | photo1] then [photo2 | photo3] */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-0">

          {/* Intro copy */}
          <div className="col-start-1 row-start-1 flex flex-col justify-center pb-4">
            <p className="font-sans text-sm leading-snug text-forest font-medium">
              Celebrate with us as we begin our journey as husband&nbsp;+&nbsp;wife
            </p>
            {/* Slight CCW tilt to match the hand-written feel */}
            <p className="font-serif text-xs italic text-forest/45 mt-2 text-right -rotate-[2deg] origin-right">
              (husband + wife?!)
            </p>
          </div>

          {/* Photo 1 */}
          <Polaroid photo={photos[0]} />

          {/* Photo 2 */}
          <Polaroid photo={photos[1]} />

          {/* Photo 3 */}
          <Polaroid photo={photos[2]} />

        </div>

        {/* Footer tagline */}
        <p className="font-serif text-2xl font-bold text-forest/25 text-center mt-20">
          Tara, kasal?
        </p>

      </div>
    </main>
  )
}
