import Header from '@/components/Header'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-forest">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer
        className="snap-end bg-forest text-center font-sans text-sm text-cream/70 px-5 pt-6"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        made with love by Bea and Basil 💚
      </footer>
    </div>
  )
}
