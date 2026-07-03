import Image from 'next/image'

const photos = [
  {
    id: 1,
    src: '/assets/home-page/photo-1.png',
    alt: 'Bea and Basil',
    rotate: 'rotate-[5deg]',
    position: 'col-start-2 row-start-1 justify-self-end self-end',
    bottomPb: 'pb-7',
  },
  {
    id: 2,
    src: '/assets/home-page/photo-2.png',
    alt: 'Bea and Basil',
    rotate: '-rotate-[3deg]',
    position: 'col-start-1 row-start-2 justify-self-start -mt-6',
    bottomPb: 'pb-7',
  },
  {
    id: 3,
    src: '/assets/home-page/photo-3.png',
    alt: 'Bea and Basil',
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
      <div className="w-full aspect-[3/4] relative overflow-hidden">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 44vw, 160px"
        />
      </div>
    </div>
  )
}

export default function StorySection() {
  return (
    <div id="story" className="relative bg-cream text-forest overflow-hidden py-16">

      {/* ── Blob decorations ─────────────────────────────────────────────── */}
      <div className="absolute -bottom-16 -left-20 w-64 pointer-events-none">
        <Image
          src="/assets/home-page/shape-1.png"
          alt=""
          width={256}
          height={320}
          className="object-contain"
          aria-hidden
        />
      </div>

      <div className="absolute -top-16 -right-20 w-52 pointer-events-none opacity-80">
        <Image
          src="/assets/home-page/shape-2.png"
          alt=""
          width={208}
          height={260}
          className="object-contain"
          aria-hidden
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-sm mx-auto px-5">

        <h2 className="font-serif text-[clamp(3.5rem,14vw,4.5rem)] font-bold text-terracotta leading-none mb-5">
          Tara,&nbsp;kain?
        </h2>

        <div className="grid grid-cols-2 items-start gap-x-2 gap-y-0">

          <div className="col-start-1 row-start-1 flex flex-col justify-center pb-4">
            <p className="font-sans text-sm leading-snug text-forest font-medium">
              Celebrate with us as we begin our journey as husband&nbsp;+&nbsp;wife
            </p>
            <p className="font-serif text-xs italic text-forest/45 mt-2 text-right -rotate-[2deg] origin-right">
              (husband + wife?!)
            </p>
          </div>

          {photos.map((photo) => (
            <Polaroid key={photo.id} photo={photo} />
          ))}

        </div>

      </div>
    </div>
  )
}
