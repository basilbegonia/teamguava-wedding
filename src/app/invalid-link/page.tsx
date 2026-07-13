export default function InvalidLinkPage({
  searchParams,
}: {
  searchParams: { reason?: string }
}) {
  const reason = searchParams?.reason

  const content =
    reason === 'expired'
      ? {
          emoji: '🔗',
          title: 'please use your invite link',
          body: "Looks like your session ended (a refresh can do that). Just reopen the link Bea & Basil originally sent you and you'll be right back in.",
        }
      : reason === 'error'
        ? {
            emoji: '😅',
            title: 'something went wrong',
            body: 'That was on our end, not yours. Please try opening your link again in a moment.',
          }
        : {
            emoji: '🤔',
            title: "hmm, this link doesn't look right",
            body: "Double-check the link we sent you, or reach out to Bea or Basil and we'll sort it out!",
          }

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-5xl mb-4">{content.emoji}</p>
      <h1 className="font-serif text-3xl text-forest mb-3">{content.title}</h1>
      <p className="font-sans text-forest/70 text-base max-w-sm">{content.body}</p>
    </main>
  )
}
