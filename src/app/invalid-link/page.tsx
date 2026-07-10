export default function InvalidLinkPage({
  searchParams,
}: {
  searchParams: { e?: string }
}) {
  const serverError = searchParams?.e === '1'

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-5xl mb-4">{serverError ? '😅' : '🤔'}</p>
      <h1 className="font-serif text-3xl text-forest mb-3">
        {serverError ? 'something went wrong' : "hmm, this link doesn't look right"}
      </h1>
      <p className="font-sans text-forest/70 text-base max-w-sm">
        {serverError
          ? 'That was on our end, not yours. Please try opening your link again in a moment.'
          : "Double-check the link we sent you, or reach out to Bea or Basil and we'll sort it out!"}
      </p>
    </main>
  )
}
